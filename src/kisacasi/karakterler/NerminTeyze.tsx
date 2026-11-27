import { useId } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Agiz } from "./Agiz";
import {
  agizAcikligi,
  dondur,
  gozAcikligi,
  Ifade,
  KIRMIZI,
  KONTUR,
  KOYU_SARI,
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
  /**
   * Brings the phone right up to her glasses and squints at it.
   * `true` eases in over the first 10 frames of the surrounding <Sequence>;
   * a number 0..1 lets the scene drive the move itself (e.g. with interpolate).
   */
  readonly telefonuYaklastiriyor: boolean | number;
  /** Which way she faces (the phone is on that side). Default "sag" (right). */
  readonly yon?: "sag" | "sol";
  /** Shifts the blink schedule (frames) so two characters do not blink together. */
  readonly kirpmaGecikmesi?: number;
  /**
   * What she holds instead of the phone. Default "telefon" (the series look, unchanged).
   * With "kalem", "ceyrek" or "bilezik" the phone is gone and `telefonuYaklastiriyor` is ignored.
   */
  readonly elinde?: "telefon" | "kalem" | "ceyrek" | "bilezik" | null;
  /** For the non-phone items: 0 = hand resting at chest height, 1 = raised high (down to -0.4 = lowered, e.g. into a bag). A boolean works too. */
  readonly kolKaldir?: boolean | number;
  /** The pen hand wobbles (writing). Only for `elinde="kalem"`. */
  readonly yaziyor?: boolean;
  /** "Doing sums": narrowed eyes looking up, one brow raised (no frown), fingers counting on her free hand. */
  readonly hesapYapiyor?: boolean;
  /** A sweat drop on her temple. */
  readonly ter?: boolean;
};

const TEN = "#F6C29A";
const TEN_KOYU = "#E59F76";
const SAC = "#A3938A";
const SAC_KOYU = "#6F625B";
const YANAK = "#FF9C8A";
const BLUZ = "#FFF6E6";
const CAM = "#DDF1FA";
const EKRAN_ISIGI = "#D7ECFF";
const ACIK_MAVI = "#3F63D6";

// Nermin Teyze: the auntie every family has. Round face, grey-brown bun with a red scrunchie,
// thick black round glasses on a little chain, pearl earrings and necklace, blue cardigan,
// and a phone (red case) held close with the screen facing her. Bust shot.
// viewBox 600x600; the cardigan runs off the bottom edge (y=600) so she sits on the frame line.
export const NerminTeyze: React.FC<Props> = ({
  size,
  ifade,
  konusuyor,
  telefonuYaklastiriyor,
  yon = "sag",
  kirpmaGecikmesi = 0,
  elinde = "telefon",
  kolKaldir = false,
  yaziyor = false,
  hesapYapiyor = false,
  ter = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sn = frame / fps;
  const kimlik = useId().replace(/[^a-zA-Z0-9]/g, "");

  const b = nefes(frame, fps);
  const goz = gozAcikligi(frame, fps, kirpmaGecikmesi);
  const acik = agizAcikligi(frame, fps, konusuyor);
  const kafaSalla = konusuyor ? Math.sin(sn * Math.PI * 2 * 1.7) * 2.5 : 0;

  // 0 = phone at chin height, 1 = phone pressed against her glasses
  const p =
    typeof telefonuYaklastiriyor === "number"
      ? Math.max(0, Math.min(1, telefonuYaklastiriyor))
      : telefonuYaklastiriyor
        ? interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.34, 1.4, 0.64, 1),
          })
        : 0;

  // ---- head pose: leans back as the phone comes in ----
  const kafaAci = kafaSalla - p * 5;
  const kafaX = -p * 10;
  const kafaY = -b * 3;

  // ---- glasses slide down the nose: surprise, squinting at the phone ----
  const kayma = (ifade === "saskin" ? 28 : 0) + p * 16;

  // ---- phone (back side towards us, red case) ----
  const tx = interpolate(p, [0, 1], [470, 414]);
  const tyBaz = interpolate(p, [0, 1], [318, 236]);
  const titrek = p > 0.5 ? Math.sin(sn * Math.PI * 2 * 2.2) * 2 * p : 0;
  const ty = tyBaz + titrek - b * 2;
  const tAci = interpolate(p, [0, 1], [-9, -3]) + Math.sin(sn * Math.PI * 2 * 0.6) * 1.2;
  const tOlcek = interpolate(p, [0, 1], [1, 1.22]);
  const rad = (tAci * Math.PI) / 180;
  const bilekX = tx - 74 * tOlcek * Math.sin(rad);
  const bilekY = ty + 74 * tOlcek * Math.cos(rad);

  // ---- eyes ----
  const kisma = 1 - p * 0.45; // squints at the screen
  const gozOlcek = ifade === "saskin" ? 1.16 : 1;
  const bebek = {
    mutlu: { dx: 7, dy: 0, r: 10 },
    saskin: { dx: 2, dy: 0, r: 6 },
    sinirli: { dx: 8, dy: 2, r: 10 },
    uzgun: { dx: 5, dy: 8, r: 10 },
  }[ifade];
  const gozCiz = (cx: number, cy: number) => {
    if (ifade === "mutlu" && p < 0.5 && !hesapYapiyor) {
      // beaming: closed, upturned eyes with laugh lines
      return (
        <g stroke={MUREKKEP} strokeLinecap="round" fill="none">
          <path d={`M ${cx - 19} ${cy + 5} Q ${cx} ${cy - 16} ${cx + 19} ${cy + 5}`} strokeWidth={7} />
        </g>
      );
    }
    const r = 21 * gozOlcek;
    const ac = goz * kisma * (hesapYapiyor ? 0.42 : 1);
    if (ac < 0.2) {
      return (
        <path
          d={`M ${cx - r} ${cy} Q ${cx} ${cy + 7} ${cx + r} ${cy}`}
          stroke={MUREKKEP}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * ac} fill="white" stroke={MUREKKEP} strokeWidth={5} />
        <ellipse
          cx={cx + bebek.dx}
          cy={cy + (hesapYapiyor ? -7 : bebek.dy * ac)}
          rx={bebek.r}
          ry={bebek.r * ac}
          fill={MUREKKEP}
        />
        <circle cx={cx + bebek.dx + 3} cy={cy + (bebek.dy - 4) * ac} r={3} fill="white" opacity={ac > 0.6 ? 1 : 0} />
      </g>
    );
  };

  // ---- brows (grey, above the frames) ----
  const kas = (x: number, y: number, ic: "sag" | "sol") => {
    const h = 26;
    const yuk = ifade === "saskin" ? -16 : 0;
    const catik = ifade === "sinirli" ? 1 : p * 0.6;
    let d: string;
    if (ifade === "uzgun") {
      d = ic === "sag" ? `M ${x - h} ${y + 8} L ${x + h} ${y - 8}` : `M ${x - h} ${y - 8} L ${x + h} ${y + 8}`;
    } else if (catik > 0.05) {
      const k = 16 * catik;
      d =
        ic === "sag"
          ? `M ${x - h} ${y - 4} Q ${x} ${y - 6} ${x + h} ${y - 4 + k}`
          : `M ${x - h} ${y - 4 + k} Q ${x} ${y - 6} ${x + h} ${y - 4}`;
    } else {
      const hy = hesapYapiyor ? (ic === "sol" ? -16 : 3) : 0; // one brow up, none lowered: no frown
      d = `M ${x - h} ${y + 4 + yuk + hy} Q ${x} ${y - 10 + yuk * 1.3 + hy} ${x + h} ${y + 4 + yuk + hy}`;
    }
    return <path d={d} stroke={SAC_KOYU} strokeWidth={10} strokeLinecap="round" fill="none" />;
  };

  const agiz = hesapYapiyor
    ? { egri: 6, gen: 46 }
    : {
        mutlu: { egri: 26, gen: 74 },
        saskin: { egri: 0, gen: 58 },
        sinirli: { egri: -10, gen: 54 },
        uzgun: { egri: -18, gen: 56 },
      }[ifade];

  const damla = (sn % 1.6) / 1.6;
  // ---- non-phone items (pen, quarter coin, bangle): the hand and arm follow `kolKaldir` ----
  const telefonVar = elinde === "telefon";
  const kk = typeof kolKaldir === "number" ? Math.max(-0.4, Math.min(1, kolKaldir)) : kolKaldir ? 1 : 0;
  const elX = interpolate(kk, [0, 1], [430, 500]);
  const elY =
    interpolate(kk, [0, 1], [410, 190]) +
    (elinde === "kalem" && yaziyor ? Math.sin(sn * Math.PI * 2 * 4) * 3 : 0) -
    b * 2;
  const kolYolu = telefonVar
    ? `M 470 610 Q ${560 - p * 40} ${500 - p * 30} ${bilekX} ${bilekY}`
    : `M 470 610 Q ${570 - kk * 40} ${520 - kk * 120} ${elX} ${elY + 30}`;
  const sayi = 1 + (Math.floor(sn * 3.2) % 3); // fingers up on the counting hand

  return (
    <svg width={size} height={size} viewBox="0 0 600 600" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={`kadraj-${kimlik}`}>
          <rect x={-200} y={-200} width={1000} height={800} />
        </clipPath>
        <clipPath id={`yuz-${kimlik}`}>
          <circle cx={300} cy={280} r={128} />
        </clipPath>
      </defs>
      <g
        transform={yon === "sol" ? "translate(600 0) scale(-1 1)" : undefined}
        clipPath={`url(#kadraj-${kimlik})`}
      >
        {/* ---- body: blue cardigan over a cream blouse, pearls ---- */}
        <g transform={olcekle(1 + b * 0.008, 1 + b * 0.018, 300, 600)}>
          <rect x={268} y={370} width={64} height={80} fill={TEN} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <path
            d="M 62 610 L 88 505 Q 104 448 196 428 L 404 424 Q 498 440 512 498 L 540 610 Z"
            fill={MAVI}
            stroke={MUREKKEP}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          {/* blouse and the open cardigan front */}
          <path d="M 236 428 L 300 545 L 364 426 Z" fill={BLUZ} stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 236 428 L 300 545 L 292 610" stroke={MUREKKEP} strokeWidth={6} fill="none" strokeLinejoin="round" />
          <path d="M 364 426 L 300 545 L 308 610" stroke={MUREKKEP} strokeWidth={6} fill="none" strokeLinejoin="round" />
          {[560, 596].map((y) => (
            <circle key={y} cx={278} cy={y} r={9} fill={SARI} stroke={MUREKKEP} strokeWidth={4} />
          ))}
          {/* knit ribbing on the shoulders */}
          {[0, 1, 2].map((i) => (
            <g key={i} stroke={ACIK_MAVI} strokeWidth={5} strokeLinecap="round">
              <line x1={130 + i * 22} y1={478 - i * 8} x2={124 + i * 22} y2={510 - i * 8} />
              <line x1={448 - i * 22} y1={472 - i * 8} x2={456 - i * 22} y2={504 - i * 8} />
            </g>
          ))}
          {/* pearl necklace */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const u = i / 6;
            const x = 252 + u * 96;
            const y = 432 + Math.sin(u * Math.PI) * 30;
            return <circle key={i} cx={x} cy={y} r={7} fill="white" stroke={MUREKKEP} strokeWidth={3} />;
          })}
        </g>

        {/* ---- head ---- */}
        <g transform={`translate(${kafaX} ${kafaY}) ${dondur(kafaAci, 300, 420)}`}>
          {/* bun behind the hair */}
          <circle cx={300} cy={128} r={60} fill={SAC} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <path d="M 270 120 Q 290 92 322 108 Q 340 130 312 146" stroke={SAC_KOYU} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* ears with pearl earrings */}
          <circle cx={174} cy={296} r={25} fill={TEN} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <circle cx={426} cy={296} r={25} fill={TEN} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <circle cx={172} cy={332} r={10} fill="white" stroke={MUREKKEP} strokeWidth={4} />
          <circle cx={428} cy={332} r={10} fill="white" stroke={MUREKKEP} strokeWidth={4} />
          {/* face */}
          <circle cx={300} cy={280} r={128} fill={TEN} stroke={MUREKKEP} strokeWidth={KONTUR} />
          {/* phone light on the face, stronger as it comes closer */}
          <g clipPath={`url(#yuz-${kimlik})`}>
            <circle cx={470 - p * 40} cy={270} r={120} fill={EKRAN_ISIGI} opacity={elinde === "telefon" ? 0.16 + p * 0.2 : 0} />
          </g>
          {/* hair cap with a side wave, scrunchie at the bun */}
          <path
            d="M 170 290 Q 160 150 300 146 Q 440 150 430 290 Q 418 222 372 204 Q 330 232 288 214 Q 246 196 214 214 Q 182 236 170 290 Z"
            fill={SAC}
            stroke={MUREKKEP}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          <path d="M 232 176 Q 262 166 290 178" stroke="white" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.4} />
          <path d="M 330 184 Q 370 178 400 206" stroke={SAC_KOYU} strokeWidth={5} strokeLinecap="round" fill="none" />
          <rect x={264} y={160} width={72} height={26} rx={13} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={6} />

          {/* cheeks and laugh lines */}
          <ellipse cx={226} cy={346} rx={25} ry={14} fill={YANAK} opacity={ifade === "mutlu" ? 0.85 : 0.5} />
          <ellipse cx={378} cy={346} rx={25} ry={14} fill={YANAK} opacity={ifade === "mutlu" ? 0.85 : 0.5} />
          {ifade === "mutlu" ? (
            <g stroke={MUREKKEP} strokeWidth={4} strokeLinecap="round">
              <line x1={196} y1={274} x2={184} y2={268} />
              <line x1={197} y1={288} x2={185} y2={290} />
              <line x1={404} y1={274} x2={416} y2={268} />
              <line x1={403} y1={288} x2={415} y2={290} />
            </g>
          ) : null}

          {gozCiz(252, 282)}
          {gozCiz(348, 282)}

          {/* nose */}
          <path d="M 286 322 Q 300 344 316 322" stroke={MUREKKEP} strokeWidth={6} strokeLinecap="round" fill={TEN_KOYU} />

          {/* glasses on a little chain */}
          <g transform={`translate(0 ${kayma})`}>
            <path
              d="M 176 300 Q 150 380 196 450 M 424 300 Q 450 380 404 450"
              stroke={KOYU_SARI}
              strokeWidth={4}
              strokeDasharray="2 7"
              strokeLinecap="round"
              fill="none"
            />
            <line x1={206} y1={276} x2={176} y2={288} stroke={MUREKKEP} strokeWidth={9} strokeLinecap="round" />
            <line x1={394} y1={276} x2={424} y2={288} stroke={MUREKKEP} strokeWidth={9} strokeLinecap="round" />
            <circle cx={252} cy={282} r={46} fill={CAM} fillOpacity={0.35} stroke={MUREKKEP} strokeWidth={12} />
            <circle cx={348} cy={282} r={46} fill={CAM} fillOpacity={0.35} stroke={MUREKKEP} strokeWidth={12} />
            <path d="M 296 280 Q 300 268 304 280" stroke={MUREKKEP} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d="M 224 262 Q 236 250 252 248" stroke="white" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
            <path d="M 320 262 Q 332 250 348 248" stroke="white" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
          </g>

          {kas(252, 222, "sag")}
          {kas(348, 222, "sol")}

          <Agiz
            cx={300}
            cy={376}
            genislik={agiz.gen}
            egri={agiz.egri}
            acik={acik}
            yuvarlak={ifade === "saskin"}
            cizgi={MUREKKEP}
            kalinlik={7}
          />

          {ter ? (
            <path
              d={`M 206 ${236 + Math.sin(sn * 5) * 2} q -13 20 0 27 q 13 -7 0 -27 Z`}
              fill="#7CC7F2"
              stroke={MUREKKEP}
              strokeWidth={4}
            />
          ) : null}

          {ifade === "sinirli" ? (
            <g stroke={KIRMIZI} strokeWidth={8} strokeLinecap="round" fill="none">
              <path d="M 176 196 Q 188 196 188 184" />
              <path d="M 198 184 Q 198 196 210 196" />
              <path d="M 210 206 Q 198 206 198 218" />
              <path d="M 188 218 Q 188 206 176 206" />
            </g>
          ) : null}
          {ifade === "uzgun" ? (
            <path
              d={`M 236 ${334 + damla * 60} q -11 18 0 24 q 11 -6 0 -24 Z`}
              fill="#7CC7F2"
              stroke={MUREKKEP}
              strokeWidth={4}
              opacity={damla < 0.85 ? 1 : 0}
            />
          ) : null}
          {ifade === "saskin" ? (
            <g stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round">
              <line x1={210} y1={92} x2={194} y2={66} />
              <line x1={248} y1={70} x2={244} y2={40} />
              <line x1={352} y1={70} x2={356} y2={40} />
              <line x1={390} y1={92} x2={406} y2={66} />
            </g>
          ) : null}
        </g>

        {/* ---- arm in a blue sleeve ---- */}
        <path d={kolYolu} stroke={MUREKKEP} strokeWidth={78} strokeLinecap="round" fill="none" />
        <path d={kolYolu} stroke={MAVI} strokeWidth={62} strokeLinecap="round" fill="none" />

        {/* ---- free hand counting on its fingers ---- */}
        {hesapYapiyor ? (
          <g>
            <path d="M 130 610 Q 40 560 96 440" stroke={MUREKKEP} strokeWidth={78} strokeLinecap="round" fill="none" />
            <path d="M 130 610 Q 40 560 96 440" stroke={MAVI} strokeWidth={62} strokeLinecap="round" fill="none" />
            {[0, 1, 2].map((i) => (
              <line
                key={i}
                x1={72 + i * 24}
                y1={414}
                x2={72 + i * 24}
                y2={i < sayi ? 366 : 394}
                stroke={MUREKKEP}
                strokeWidth={26}
                strokeLinecap="round"
              />
            ))}
            {[0, 1, 2].map((i) => (
              <line
                key={i}
                x1={72 + i * 24}
                y1={414}
                x2={72 + i * 24}
                y2={i < sayi ? 366 : 394}
                stroke={TEN}
                strokeWidth={14}
                strokeLinecap="round"
              />
            ))}
            <circle cx={96} cy={440} r={34} fill={TEN} stroke={MUREKKEP} strokeWidth={6} />
          </g>
        ) : null}

        {/* ---- pen, quarter coin or bangle in her hand ---- */}
        {!telefonVar && elinde ? (
          <g transform={`translate(${elX} ${elY})`}>
            {elinde === "kalem" ? (
              <g transform="rotate(-38)">
                <rect x={-9} y={-96} width={18} height={104} rx={8} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={5} />
                <path d="M -9 8 L 0 34 L 9 8 Z" fill={MUREKKEP} />
              </g>
            ) : null}
            {elinde === "ceyrek" ? (
              <circle cx={0} cy={-62} r={50} fill={SARI} stroke={MUREKKEP} strokeWidth={6} />
            ) : null}
            {elinde === "bilezik" ? (
              <g>
                <circle cx={0} cy={-62} r={44} fill="none" stroke={MUREKKEP} strokeWidth={26} />
                <circle cx={0} cy={-62} r={44} fill="none" stroke={SARI} strokeWidth={14} />
                {[
                  [-66, -112, 0],
                  [64, -118, 7],
                  [70, -50, 14],
                ].map(([sx, sy, gec]) => {
                  const s2 = 0.6 + 0.4 * Math.abs(Math.sin((frame + gec) * 0.45));
                  return (
                    <g key={sx} transform={`translate(${sx} ${sy}) scale(${s2})`} stroke={MUREKKEP} strokeWidth={5} strokeLinecap="round">
                      <line x1={0} y1={-14} x2={0} y2={14} />
                      <line x1={-14} y1={0} x2={14} y2={0} />
                    </g>
                  );
                })}
              </g>
            ) : null}
            <circle cx={0} cy={0} r={32} fill={TEN} stroke={MUREKKEP} strokeWidth={6} />
            <path d="M -14 -12 Q 0 -22 14 -12" stroke={MUREKKEP} strokeWidth={4} strokeLinecap="round" fill="none" />
          </g>
        ) : null}

        {/* ---- phone, back towards us, with her hand around it ---- */}
        <g
          transform={`translate(${tx} ${ty}) rotate(${tAci}) scale(${tOlcek})`}
          opacity={telefonVar ? 1 : 0}
        >
          <rect x={-50} y={-88} width={100} height={176} rx={20} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <rect x={-36} y={-74} width={34} height={40} rx={10} fill={MUREKKEP} />
          <circle cx={-19} cy={-63} r={6} fill="#5A5A5A" />
          <circle cx={-19} cy={-45} r={6} fill="#5A5A5A" />
          {/* flower sticker on the case */}
          <g transform="translate(18 -8)">
            {[0, 72, 144, 216, 288].map((a) => (
              <circle
                key={a}
                cx={Math.cos((a * Math.PI) / 180) * 10}
                cy={Math.sin((a * Math.PI) / 180) * 10}
                r={8}
                fill={SARI}
                stroke={MUREKKEP}
                strokeWidth={3}
              />
            ))}
            <circle r={6} fill="white" stroke={MUREKKEP} strokeWidth={3} />
          </g>
          {/* hand: fingers wrapped round the back */}
          <rect x={-60} y={18} width={86} height={70} rx={30} fill={TEN} stroke={MUREKKEP} strokeWidth={6} />
          <g stroke={MUREKKEP} strokeWidth={4} strokeLinecap="round">
            <line x1={-8} y1={36} x2={24} y2={36} />
            <line x1={-8} y1={54} x2={24} y2={54} />
            <line x1={-8} y1={72} x2={22} y2={72} />
          </g>
        </g>
      </g>
    </svg>
  );
};
