import { useCurrentFrame, useVideoConfig } from "remotion";
import { Agiz } from "./Agiz";
import { dondur, gozAcikligi, KONTUR, MUREKKEP, nefes, olcekle, SARI } from "./animasyon";

type Props = {
  /** Width (and height) in px; the drawing is square. */
  readonly size: number;
  /** What the six legs do: stand, walk (tripod gait) or tap-dance (pairs stamp in turn). */
  readonly bacaklar: "dur" | "yuru" | "dans";
  /** Wings buzzing (flying). */
  readonly ucuyor: boolean;
  /** Feet glow yellow: the taste sensors are working. */
  readonly tatAliyor: boolean;
  /** Proboscis length, 0 = short stub, 1 = a long straw reaching the ground. Default 0. */
  readonly hortum?: number;
  /** Which way it faces. Default "sag" (right). */
  readonly yon?: "sag" | "sol";
  /** Shifts the blink schedule (frames). */
  readonly kirpmaGecikmesi?: number;
};

const ZEMIN = 540;
const GOVDE = "#3B3D45";
const KARIN = "#55575F";
const SERIT = "#7E8088";
const GOZ = "#D2231A";
const GOZ_KOYU = "#9A140D";
const KANAT = "#CFEFFF";
const HORTUM = "#6B5446";
const BEYAZ = "#FFFFFF";

// The housefly: a cute-gross cartoon, not an insect plate. Striped grey thorax, round abdomen,
// two huge red compound eyes with cartoon pupils, little blue wings, six thin legs, a sponge-tipped
// proboscis that can grow into a straw. viewBox 600x600, feet on y=540, facing right.
// Speech bubbles are drawn by the scene, not here.
export const Sinek: React.FC<Props> = ({
  size,
  bacaklar,
  ucuyor,
  tatAliyor,
  hortum = 0,
  yon = "sag",
  kirpmaGecikmesi = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sn = frame / fps;
  const b = nefes(frame, fps);
  const goz = gozAcikligi(frame, fps, kirpmaGecikmesi);

  const yuruT = sn * Math.PI * 2 * 2.2;
  const dansT = sn * Math.PI * 2 * 3.3;
  // body bob: walking a little, dancing a lot
  const zipla =
    bacaklar === "dans" ? -Math.abs(Math.sin(dansT)) * 16 : bacaklar === "yuru" ? -Math.abs(Math.sin(yuruT)) * 6 : 0;
  const govdeY = zipla + (ucuyor ? 0 : b * 2);

  // ---- legs: hip under the body, knee raised, foot on the ground ----
  const kalcalar = [
    { hx: 205, kx: 150, fx: 120, faz: 0, uzak: true },
    { hx: 300, kx: 270, fx: 255, faz: Math.PI, uzak: true },
    { hx: 380, kx: 420, fx: 430, faz: 0, uzak: true },
    { hx: 225, kx: 180, fx: 170, faz: Math.PI, uzak: false },
    { hx: 320, kx: 320, fx: 315, faz: 0, uzak: false },
    { hx: 395, kx: 470, fx: 495, faz: Math.PI, uzak: false },
  ];
  const bacak = (k: (typeof kalcalar)[number], i: number) => {
    let kaldir = 0;
    let kay = 0;
    if (bacaklar === "yuru") {
      kaldir = Math.max(0, Math.cos(yuruT + k.faz)) * 26;
      kay = Math.sin(yuruT + k.faz) * 20;
    } else if (bacaklar === "dans") {
      // the pairs stamp one after another: front, middle, back
      const cift = i % 3;
      kaldir = Math.max(0, Math.sin(dansT + (cift * Math.PI * 2) / 3 + (k.uzak ? Math.PI : 0))) * 46;
    }
    const sarkit = ucuyor ? 40 : 0; // legs dangle while flying
    const fx = k.fx + kay - (ucuyor ? 20 : 0);
    const fy = ZEMIN - kaldir - (k.uzak ? 8 : 0) - (ucuyor ? 60 - sarkit : 0);
    const hy = 418 + govdeY;
    const ky = Math.min(hy, fy) - 40 + kaldir * 0.3;
    return (
      <g key={i} opacity={k.uzak ? 0.8 : 1}>
        <path
          d={`M ${k.hx} ${hy} L ${k.kx + kay * 0.5} ${ky} L ${fx} ${fy}`}
          stroke={MUREKKEP}
          strokeWidth={k.uzak ? 8 : 10}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* tiny hairy foot pad; glows yellow while tasting */}
        {tatAliyor && !k.uzak ? (
          <circle cx={fx + 4} cy={fy} r={22 + Math.sin(sn * 9 + i) * 3} fill={SARI} opacity={0.55} />
        ) : null}
        <ellipse
          cx={fx + 4}
          cy={fy}
          rx={13}
          ry={8}
          fill={tatAliyor ? SARI : MUREKKEP}
          stroke={MUREKKEP}
          strokeWidth={4}
        />
      </g>
    );
  };

  // ---- wings: two little blue paddles on the back; buzz when flying, twitch when idle ----
  const vizz = ucuyor ? (frame % 2 === 0 ? -26 : 18) : Math.sin(sn * Math.PI * 2 * 0.5) * 3;
  const kanat = (aci: number, ox: number, key: string, op: number) => (
    <g key={key} transform={dondur(aci + vizz, ox, 260 + govdeY)} opacity={op}>
      <path
        d={`M ${ox} ${260 + govdeY} C ${ox - 40} ${150 + govdeY} ${ox - 190} ${120 + govdeY} ${ox - 215} ${185 + govdeY} C ${ox - 230} ${235 + govdeY} ${ox - 120} ${275 + govdeY} ${ox} ${260 + govdeY} Z`}
        fill={KANAT}
        fillOpacity={0.75}
        stroke={MUREKKEP}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        d={`M ${ox - 10} ${252 + govdeY} Q ${ox - 100} ${200 + govdeY} ${ox - 190} ${190 + govdeY} M ${ox - 60} ${230 + govdeY} Q ${ox - 110} ${245 + govdeY} ${ox - 150} ${235 + govdeY}`}
        stroke={MUREKKEP}
        strokeWidth={3}
        fill="none"
        opacity={0.5}
      />
    </g>
  );

  // ---- head ----
  const hx = 455;
  const hy = 315 + govdeY;
  const hortumBoy = 40 + hortum * 150;
  const bebek = (cx: number, cy: number, r: number) =>
    goz < 0.18 ? (
      <path
        d={`M ${cx - r} ${cy} Q ${cx} ${cy + 8} ${cx + r} ${cy}`}
        stroke={MUREKKEP}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
    ) : (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * goz} fill={MUREKKEP} />
        <circle cx={cx + r * 0.35} cy={cy - r * 0.4 * goz} r={r * 0.32} fill={BEYAZ} />
      </g>
    );
  const petek = (cx: number, cy: number, rx: number, ry: number) =>
    [-0.55, -0.15, 0.25, 0.6].flatMap((u, i) =>
      [-0.5, 0, 0.5].map((v, j) => (
        <circle
          key={`${i}-${j}`}
          cx={cx + u * rx + (j % 2) * 6}
          cy={cy + v * ry}
          r={5}
          fill={GOZ_KOYU}
          opacity={0.6}
        />
      )),
    );

  return (
    <svg width={size} height={size} viewBox="0 0 600 600" style={{ overflow: "visible" }}>
      <g transform={yon === "sol" ? "translate(600 0) scale(-1 1)" : undefined}>
        <ellipse cx={300} cy={ZEMIN + 6} rx={ucuyor ? 120 : 200} ry={12} fill={MUREKKEP} opacity={ucuyor ? 0.06 : 0.12} />

        {kalcalar.filter((k) => k.uzak).map((k) => bacak(k, kalcalar.indexOf(k)))}
        {kanat(-14, 330, "uzak-kanat", 0.75)}

        {/* abdomen: round, striped, a few bristles */}
        <g transform={olcekle(1 + b * 0.015, 1 + b * 0.02, 230, 360 + govdeY)}>
          <ellipse cx={225} cy={355 + govdeY} rx={140} ry={100} fill={KARIN} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <path d={`M 160 ${270 + govdeY} Q 140 ${355 + govdeY} 165 ${448 + govdeY}`} stroke={MUREKKEP} strokeWidth={6} fill="none" opacity={0.45} />
          <path d={`M 110 ${290 + govdeY} Q 90 ${355 + govdeY} 112 ${425 + govdeY}`} stroke={MUREKKEP} strokeWidth={6} fill="none" opacity={0.45} />
          <path d={`M 140 ${300 + govdeY} Q 190 ${275 + govdeY} 250 ${282 + govdeY}`} stroke={BEYAZ} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.25} />
          {[120, 175, 230].map((x) => (
            <line key={x} x1={x} y1={262 + govdeY + Math.abs(x - 200) * 0.25} x2={x - 8} y2={240 + govdeY + Math.abs(x - 200) * 0.25} stroke={MUREKKEP} strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>

        {/* thorax with the housefly's dark stripes */}
        <ellipse cx={345} cy={330 + govdeY} rx={100} ry={95} fill={GOVDE} stroke={MUREKKEP} strokeWidth={KONTUR} />
        {[310, 345, 380].map((x) => (
          <path key={x} d={`M ${x} ${248 + govdeY} Q ${x + 6} ${300 + govdeY} ${x} ${352 + govdeY}`} stroke={SERIT} strokeWidth={9} strokeLinecap="round" fill="none" />
        ))}
        {[300, 340, 385].map((x) => (
          <line key={x} x1={x} y1={240 + govdeY} x2={x + 4} y2={216 + govdeY} stroke={MUREKKEP} strokeWidth={5} strokeLinecap="round" />
        ))}

        {kalcalar.filter((k) => !k.uzak).map((k) => bacak(k, kalcalar.indexOf(k)))}
        {kanat(-4, 345, "yakin-kanat", 0.95)}

        {/* proboscis: a tube with a sponge tip */}
        <path d={`M ${hx + 30} ${hy + 70} L ${hx + 40} ${hy + 70 + hortumBoy}`} stroke={MUREKKEP} strokeWidth={24} strokeLinecap="round" />
        <path d={`M ${hx + 30} ${hy + 70} L ${hx + 40} ${hy + 70 + hortumBoy}`} stroke={HORTUM} strokeWidth={12} strokeLinecap="round" />
        <ellipse cx={hx + 40} cy={hy + 78 + hortumBoy} rx={26} ry={14} fill="#A27C66" stroke={MUREKKEP} strokeWidth={6} />

        {/* head */}
        <circle cx={hx} cy={hy} r={92} fill={GOVDE} stroke={MUREKKEP} strokeWidth={KONTUR} />
        {/* stubby antennae */}
        <path d={`M ${hx + 40} ${hy - 60} q 12 -26 34 -30`} stroke={MUREKKEP} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d={`M ${hx + 10} ${hy - 72} q 2 -30 22 -42`} stroke={MUREKKEP} strokeWidth={8} strokeLinecap="round" fill="none" />
        {/* far eye, then near eye: huge red compound eyes with cartoon pupils */}
        <ellipse cx={hx - 30} cy={hy - 28} rx={60} ry={70} fill={GOZ} stroke={MUREKKEP} strokeWidth={KONTUR} />
        {petek(hx - 30, hy - 28, 60, 70)}
        {bebek(hx - 10, hy - 18, 15)}
        <ellipse cx={hx + 42} cy={hy - 20} rx={72} ry={80} fill={GOZ} stroke={MUREKKEP} strokeWidth={KONTUR} />
        {petek(hx + 42, hy - 20, 72, 80)}
        <path d={`M ${hx + 6} ${hy - 70} Q ${hx + 30} ${hy - 92} ${hx + 64} ${hy - 82}`} stroke={BEYAZ} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.7} />
        {bebek(hx + 62, hy - 8, 19)}
        <Agiz cx={hx + 52} cy={hy + 58} genislik={34} egri={9} acik={0} yuvarlak={false} cizgi={MUREKKEP} kalinlik={6} />
      </g>
    </svg>
  );
};
