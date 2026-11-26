import { useCurrentFrame, useVideoConfig } from "remotion";
import { Agiz } from "./Agiz";
import {
  dondur,
  gozAcikligi,
  agizAcikligi,
  Ifade,
  KIRMIZI,
  KONTUR,
  KOYU_SARI,
  KREM,
  MAVI,
  MUREKKEP,
  nefes,
  olcekle,
  SARI,
} from "./animasyon";

type Props = {
  /** Width (and height) in px; the drawing is square. */
  readonly size: number;
  readonly ifade: Ifade;
  readonly konusuyor: boolean;
  readonly yuruyor: boolean;
  /** Which way he faces. Default "sag" (right). */
  readonly yon?: "sag" | "sol";
  /** Shifts the blink schedule (frames) so two characters do not blink together. */
  readonly kirpmaGecikmesi?: number;
};

const ZEMIN = 540;

// Kazım, the tenant ant: three red circles, one antenna always bent,
// a yellow backpack bigger than he is (everything he owns), house key dangling.
// viewBox 600x600, feet on y=540.
export const Kazim: React.FC<Props> = ({
  size,
  ifade,
  konusuyor,
  yuruyor,
  yon = "sag",
  kirpmaGecikmesi = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = (frame / fps) * Math.PI * 2 * 1.7; // leg cycle
  const bob = yuruyor ? Math.abs(Math.sin(t)) * 8 : 0;
  const b = nefes(frame, fps);
  const goz = gozAcikligi(frame, fps, kirpmaGecikmesi);
  const acik = agizAcikligi(frame, fps, konusuyor);
  const sallan = Math.sin((frame / fps) * Math.PI * 2 * 0.8);
  const kafaSalla = konusuyor ? Math.sin((frame / fps) * Math.PI * 2 * 1.9) * 2.5 : 0;
  const cantaAci = yuruyor ? Math.sin(t) * 2.5 : b * 0.6;
  const anahtarAci = yuruyor ? Math.sin(t - 0.8) * 16 : sallan * 5;

  // ---- legs (all behind the body; tripod gait) ----
  const kalcalar = [
    { hx: 262, ayak: 190, faz: 0, uzak: true },
    { hx: 282, ayak: 285, faz: Math.PI, uzak: true },
    { hx: 300, ayak: 385, faz: 0, uzak: true },
    { hx: 255, ayak: 215, faz: Math.PI, uzak: false },
    { hx: 280, ayak: 312, faz: 0, uzak: false },
    { hx: 305, ayak: 410, faz: Math.PI, uzak: false },
  ];
  const bacak = (k: (typeof kalcalar)[number], i: number) => {
    const s = yuruyor ? Math.sin(t + k.faz) : 0;
    const c = yuruyor ? Math.cos(t + k.faz) : 0;
    const fx = k.ayak + s * 24 + (k.uzak ? 10 : 0);
    const fy = ZEMIN - Math.max(0, c) * 18 - (k.uzak ? 6 : 0) + bob;
    const hy = 440;
    const kx = (k.hx + fx) / 2 + (fx - k.hx) * 0.35;
    const ky = hy + 6;
    return (
      <g key={i} opacity={k.uzak ? 0.85 : 1}>
        <path
          d={`M ${k.hx} ${hy} Q ${kx} ${ky} ${fx} ${fy}`}
          stroke={MUREKKEP}
          strokeWidth={k.uzak ? 9 : 11}
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={fx + 5} cy={fy} rx={9} ry={6} fill={MUREKKEP} />
      </g>
    );
  };

  // ---- antennae ----
  const antenSarkma = ifade === "uzgun" ? 22 : ifade === "saskin" ? -10 : 0;
  const a = sallan * 5;
  const duzAnten = (
    <g transform={dondur(a + antenSarkma * 0.8, 432, 245)}>
      <path
        d={`M 432 245 Q 448 170 ${505} ${ifade === "uzgun" ? 168 : 140}`}
        stroke={MUREKKEP}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={505} cy={ifade === "uzgun" ? 168 : 140} r={11} fill={MUREKKEP} />
    </g>
  );
  // the always-bent one: goes up, then folds forward and down at a sharp knee
  const bukukAnten = (
    <g transform={dondur(-a * 0.6 + antenSarkma * 0.5, 382, 240)}>
      <path
        d="M 382 240 L 368 168 L 326 188"
        stroke={MUREKKEP}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx={326} cy={188} r={10} fill={MUREKKEP} />
    </g>
  );

  // ---- eyes ----
  const gozOlcek = ifade === "saskin" ? 1.14 : 1;
  const bebek = {
    mutlu: { dx: 8, dy: 2, r: 12 },
    saskin: { dx: 2, dy: 0, r: 7 },
    sinirli: { dx: 7, dy: 3, r: 12 },
    uzgun: { dx: 4, dy: 11, r: 12 },
  }[ifade];
  const gozCiz = (cx: number, cy: number, r0: number) => {
    const r = r0 * gozOlcek;
    if (goz < 0.18) {
      return (
        <path
          d={`M ${cx - r} ${cy} Q ${cx} ${cy + 8} ${cx + r} ${cy}`}
          stroke={MUREKKEP}
          strokeWidth={7}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * goz} fill="white" stroke={MUREKKEP} strokeWidth={6} />
        <ellipse
          cx={cx + bebek.dx * (r0 / 34)}
          cy={cy + bebek.dy * (r0 / 34) * goz}
          rx={bebek.r * (r0 / 34)}
          ry={bebek.r * (r0 / 34) * goz}
          fill={MUREKKEP}
        />
        <circle
          cx={cx + bebek.dx * (r0 / 34) + 4}
          cy={cy + (bebek.dy - 4) * (r0 / 34) * goz}
          r={3.5 * (r0 / 34)}
          fill="white"
          opacity={goz > 0.6 ? 1 : 0}
        />
      </g>
    );
  };

  // ---- brows ----
  const kas = (x: number, y: number, w: number, ic: "sag" | "sol") => {
    const h = w / 2;
    const yuk = ifade === "saskin" ? -16 : 0;
    let d: string;
    if (ifade === "sinirli") {
      d = ic === "sag" ? `M ${x - h} ${y - 6} L ${x + h} ${y + 12}` : `M ${x - h} ${y + 12} L ${x + h} ${y - 6}`;
    } else if (ifade === "uzgun") {
      d = ic === "sag" ? `M ${x - h} ${y + 10} L ${x + h} ${y - 8}` : `M ${x - h} ${y - 8} L ${x + h} ${y + 10}`;
    } else {
      d = `M ${x - h} ${y + 4 + yuk} Q ${x} ${y - 10 + yuk * 1.3} ${x + h} ${y + 4 + yuk}`;
    }
    return <path d={d} stroke={MUREKKEP} strokeWidth={10} strokeLinecap="round" fill="none" />;
  };

  const agiz = {
    mutlu: { egri: 20, gen: 58, ac: 0 },
    saskin: { egri: 0, gen: 52, ac: 0 },
    sinirli: { egri: -8, gen: 44, ac: 0 },
    uzgun: { egri: -16, gen: 48, ac: 0 },
  }[ifade];

  const damla = ((frame / fps) % 1.6) / 1.6; // tear slides down for 1.6 s, then repeats

  return (
    <svg width={size} height={size} viewBox="0 0 600 600" style={{ overflow: "visible" }}>
      <g transform={yon === "sol" ? "translate(600 0) scale(-1 1)" : undefined}>
        {/* ground shadow */}
        <ellipse cx={295} cy={ZEMIN + 6} rx={200 - bob * 3} ry={14} fill={MUREKKEP} opacity={0.12} />
        <g transform={`translate(0 ${-bob})`}>
          {kalcalar.filter((k) => k.uzak).map((k, i) => bacak(k, i))}
          {kalcalar.filter((k) => !k.uzak).map((k, i) => bacak(k, i + 3))}

          <g transform={olcekle(1 + b * 0.008, 1 + b * 0.016, 290, 480)}>
            {/* abdomen + thorax */}
            <circle cx={165} cy={405} r={82} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={KONTUR} />
            <circle cx={282} cy={418} r={46} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={KONTUR} />

            {/* backpack */}
            <g transform={dondur(cantaAci, 200, 390)}>
              {/* house key on a ring */}
              <g transform={dondur(anahtarAci, 70, 300)}>
                <line x1={70} y1={300} x2={70} y2={342} stroke={MUREKKEP} strokeWidth={5} />
                <circle cx={70} cy={354} r={13} fill={KREM} stroke={MUREKKEP} strokeWidth={5} />
                <path
                  d="M 70 367 L 70 402 M 70 388 L 60 388 M 70 398 L 62 398"
                  stroke={MUREKKEP}
                  strokeWidth={6}
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              {/* rolled blue mat on top */}
              <rect x={102} y={108} width={192} height={54} rx={27} fill={MAVI} stroke={MUREKKEP} strokeWidth={KONTUR} />
              <circle cx={267} cy={135} r={19} fill="#3F63D6" stroke={MUREKKEP} strokeWidth={5} />
              <path d="M 267 135 m -8 0 a 8 8 0 1 1 8 8" stroke={MUREKKEP} strokeWidth={4} fill="none" />
              <line x1={145} y1={106} x2={145} y2={164} stroke={MUREKKEP} strokeWidth={7} />
              <line x1={222} y1={106} x2={222} y2={164} stroke={MUREKKEP} strokeWidth={7} />
              {/* bag body */}
              <rect x={82} y={150} width={230} height={250} rx={54} fill={SARI} stroke={MUREKKEP} strokeWidth={KONTUR} />
              {/* flap */}
              <path
                d="M 82 205 Q 82 150 136 150 L 258 150 Q 312 150 312 205 L 312 252 Q 197 298 82 252 Z"
                fill={KOYU_SARI}
                stroke={MUREKKEP}
                strokeWidth={KONTUR}
                strokeLinejoin="round"
              />
              <line x1={197} y1={272} x2={197} y2={292} stroke={MUREKKEP} strokeWidth={9} />
              <rect x={182} y={286} width={30} height={26} rx={5} fill={MAVI} stroke={MUREKKEP} strokeWidth={6} />
              {/* front pocket */}
              <rect x={120} y={318} width={154} height={64} rx={22} fill={SARI} stroke={MUREKKEP} strokeWidth={6} />
              <line x1={132} y1={340} x2={262} y2={340} stroke={MUREKKEP} strokeWidth={4} strokeDasharray="10 8" />
            </g>

            {/* shoulder strap over the thorax */}
            <path d="M 296 238 Q 330 340 300 452" stroke={MUREKKEP} strokeWidth={34} strokeLinecap="round" fill="none" />
            <path d="M 296 238 Q 330 340 300 452" stroke={KOYU_SARI} strokeWidth={20} strokeLinecap="round" fill="none" />
          </g>

          {/* head */}
          <g transform={`${dondur(kafaSalla, 330, 400)} translate(0 ${-b * 3})`}>
            {bukukAnten}
            {duzAnten}
            <circle cx={405} cy={330} r={98} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={KONTUR} />
            {/* shine */}
            <path d="M 342 290 Q 352 262 378 250" stroke="white" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.45} />
            {ifade === "mutlu" ? (
              <>
                <ellipse cx={392} cy={372} rx={20} ry={11} fill="#FF8C7E" opacity={0.75} />
                <ellipse cx={484} cy={364} rx={13} ry={9} fill="#FF8C7E" opacity={0.75} />
              </>
            ) : null}
            {gozCiz(420, 312, 34)}
            {gozCiz(474, 306, 27)}
            {kas(420, 266, 46, "sag")}
            {kas(475, 262, 36, "sol")}
            <Agiz
              cx={448}
              cy={378}
              genislik={agiz.gen}
              egri={agiz.egri}
              acik={Math.max(agiz.ac, acik)}
              yuvarlak={ifade === "saskin"}
              cizgi={MUREKKEP}
              kalinlik={7}
            />
            {ifade === "sinirli" ? (
              // anger mark
              <g stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round" fill="none">
                <path d="M 330 262 Q 342 262 342 250" />
                <path d="M 352 250 Q 352 262 364 262" />
                <path d="M 364 272 Q 352 272 352 284" />
                <path d="M 342 284 Q 342 272 330 272" />
              </g>
            ) : null}
            {ifade === "uzgun" ? (
              <path
                d={`M 404 ${348 + damla * 70} q -11 18 0 24 q 11 -6 0 -24 Z`}
                fill="#7CC7F2"
                stroke={MUREKKEP}
                strokeWidth={4}
                opacity={damla < 0.85 ? 1 : 0}
              />
            ) : null}
            {ifade === "saskin" ? (
              <g stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round">
                <line x1={420} y1={200} x2={412} y2={172} />
                <line x1={455} y1={206} x2={468} y2={180} />
                <line x1={488} y1={222} x2={512} y2={204} />
              </g>
            ) : null}
          </g>
        </g>
      </g>
    </svg>
  );
};
