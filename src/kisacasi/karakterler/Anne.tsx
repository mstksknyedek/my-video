import { useId } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Agiz } from "./Agiz";
import {
  agizAcikligi,
  dondur,
  gozAcikligi,
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
  /** The ladle arm swings (+-18 degrees, 2 Hz): "Doldurayım!" energy. */
  readonly kepceSalliyor?: boolean;
  /**
   * Arms for a hug. 0 = normal, 0.5 = arms flung wide open, 1 = both arms wrapped round
   * the middle of the frame (a tower of boxes goes there). A boolean works too (true = 1).
   * The ladle is put away (hidden) while the arms are wide or closed.
   */
  readonly kucakliyor?: boolean | number;
  /** The free hand is raised and waves goodbye (the ladle stays in the other hand). */
  readonly elSalliyor?: boolean;
  /** Which way she faces (the ladle hand is on that side). Default "sag" (right). */
  readonly yon?: "sag" | "sol";
  /** Shifts the blink schedule (frames) so two characters do not blink together. */
  readonly kirpmaGecikmesi?: number;
  /** Sparkling eyes: little four-point stars in both pupils (a bright idea, "let me fill them!"). */
  readonly gozParlasi?: boolean;
  /** The ladle held up high beside her head: 0 = at chest height, 1 = raised (a boolean works too). */
  readonly kepceKaldir?: boolean | number;
  /** Hide the ladle altogether (hands full). Default true = shown. */
  readonly kepce?: boolean;
};

const TEN = "#E8B48A";
const TEN_KOYU = "#D49A6E";
const SAC = "#4A2A18";
const SAC_KOYU = "#2E190D";
const YANAK = "#F58B78";
const ALTIN = "#E3B341";
const CELIK = "#C9CED6";
const CELIK_ICI = "#8E96A3";

type Nokta = readonly [number, number];
const karis = (a: Nokta, b: Nokta, t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Three poses on a 0 / 0.5 / 1 scale. */
const uc = (k: number, a: Nokta, b: Nokta, c: Nokta): [number, number] =>
  k < 0.5 ? karis(a, b, k * 2) : karis(b, c, (k - 0.5) * 2);

// The ladle, drawn upright with its grip at the origin: blue handle, steel bowl with a dark inside.
const Kepce: React.FC = () => (
  <g>
    <rect x={-9} y={-176} width={18} height={196} rx={9} fill={MAVI} stroke={MUREKKEP} strokeWidth={5} />
    <circle cx={0} cy={-158} r={4} fill="white" />
    <circle cx={0} cy={-216} r={52} fill={CELIK} stroke={MUREKKEP} strokeWidth={6} />
    <ellipse cx={0} cy={-220} rx={37} ry={30} fill={CELIK_ICI} stroke={MUREKKEP} strokeWidth={4} />
    <path d="M -22 -234 Q -12 -246 4 -246" stroke="white" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />
  </g>
);

// Anne: the generous mother. Round face (a shade deeper than Nermin Teyze's), short wavy dark-brown hair with a
// scalloped fringe, no glasses, small gold hoop earrings, red apron with cream polka dots over a yellow blouse,
// and a ladle in her hand. Bust shot plus two arms; the apron and blouse run off the bottom edge (y=600).
// viewBox 600x600. Same line language as the others: #111111 8 px outline, flat colours, shared blink / breath / mouth.
export const Anne: React.FC<Props> = ({
  size,
  ifade,
  konusuyor,
  kepceSalliyor = false,
  kucakliyor = false,
  elSalliyor = false,
  yon = "sag",
  kirpmaGecikmesi = 0,
  gozParlasi = false,
  kepceKaldir = false,
  kepce = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sn = frame / fps;
  const kimlik = useId().replace(/[^a-zA-Z0-9]/g, "");

  const b = nefes(frame, fps);
  const goz = gozAcikligi(frame, fps, kirpmaGecikmesi);
  const acik = agizAcikligi(frame, fps, konusuyor);
  const kafaSalla = konusuyor ? Math.sin(sn * Math.PI * 2 * 1.7) * 2.5 : 0;
  const kafaAci = kafaSalla;
  const kafaY = -b * 3;

  const kk = typeof kucakliyor === "number" ? Math.max(0, Math.min(1, kucakliyor)) : kucakliyor ? 1 : 0;
  const kld = typeof kepceKaldir === "number" ? Math.max(0, Math.min(1, kepceKaldir)) : kepceKaldir ? 1 : 0;
  const sallanma = kepceSalliyor ? Math.sin(sn * Math.PI * 2 * 2) * 18 : 0;

  // ---- arms: shoulder start (off the bottom edge), a control point and the hand ----
  const sagBas: Nokta = [480, 614];
  const sagNormalK = karis([566, 522], [584, 470], kld);
  const sagNormalE = karis([506, 414 - b * 2], [536, 310], kld);
  const sagK = uc(kk, sagNormalK, [592, 500], [540, 596]);
  const sagE = uc(kk, sagNormalE, [578, 352], [386, 548]);
  const solBas: Nokta = [120, 614];
  const solK = elSalliyor && kk === 0 ? [30, 500] : uc(kk, [44, 566], [10, 510], [60, 596]);
  const solE = elSalliyor && kk === 0 ? [84, 300] : uc(kk, [88, 484 - b * 2], [22, 352], [214, 548]);
  const sagYol = `M ${sagBas[0]} ${sagBas[1]} Q ${sagK[0]} ${sagK[1]} ${sagE[0]} ${sagE[1]}`;
  const solYol = `M ${solBas[0]} ${solBas[1]} Q ${solK[0]} ${solK[1]} ${solE[0]} ${solE[1]}`;
  const dalga = elSalliyor && kk === 0 ? Math.sin(sn * Math.PI * 2 * 2.6) * 22 : 0;
  const kepceGorunur = kepce && kk < 0.2;

  // ---- eyes ----
  const gozOlcek = ifade === "saskin" ? 1.16 : 1;
  const bebek = {
    mutlu: { dx: 6, dy: 0, r: 11 },
    saskin: { dx: 2, dy: 0, r: 6 },
    sinirli: { dx: 8, dy: 2, r: 10 },
    uzgun: { dx: 5, dy: 8, r: 10 },
  }[ifade];
  const parla = 0.75 + 0.25 * Math.sin(sn * Math.PI * 2 * 2.2);
  const gozCiz = (cx: number, cy: number, dis: 1 | -1) => {
    const r = 21 * gozOlcek;
    const ac = goz;
    // short lashes flick out of the outer corner
    const kirpik = (
      <g stroke={MUREKKEP} strokeWidth={5} strokeLinecap="round">
        <line x1={cx + dis * (r - 2)} y1={cy - 8 * ac} x2={cx + dis * (r + 12)} y2={cy - 16 * ac - 2} />
        <line x1={cx + dis * (r - 1)} y1={cy - 1 * ac} x2={cx + dis * (r + 13)} y2={cy - 3 * ac} />
      </g>
    );
    if (ac < 0.2) {
      return (
        <g>
          <path
            d={`M ${cx - r} ${cy} Q ${cx} ${cy + 7} ${cx + r} ${cy}`}
            stroke={MUREKKEP}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
          {kirpik}
        </g>
      );
    }
    const px = cx + bebek.dx;
    const py = cy + bebek.dy * ac;
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * ac} fill="white" stroke={MUREKKEP} strokeWidth={5} />
        <ellipse cx={px} cy={py} rx={bebek.r} ry={bebek.r * ac} fill={MUREKKEP} />
        {gozParlasi && ac > 0.5 ? (
          <g transform={`translate(${px + 1} ${py - 1}) scale(${parla})`} fill="white">
            <path d="M 0 -17 Q 2.5 -2.5 17 0 Q 2.5 2.5 0 17 Q -2.5 2.5 -17 0 Q -2.5 -2.5 0 -17 Z" />
          </g>
        ) : (
          <>
            <circle cx={px + 4} cy={py - 5 * ac} r={4} fill="white" opacity={ac > 0.6 ? 1 : 0} />
            <circle cx={px - 4} cy={py + 5 * ac} r={2} fill="white" opacity={ac > 0.6 ? 0.8 : 0} />
          </>
        )}
        {kirpik}
      </g>
    );
  };

  // ---- brows (dark hair colour, above the eyes) ----
  const kas = (x: number, y: number, ic: "sag" | "sol") => {
    const h = 26;
    const yuk = ifade === "saskin" ? -16 : 0;
    let d: string;
    if (ifade === "uzgun") {
      d = ic === "sag" ? `M ${x - h} ${y + 8} L ${x + h} ${y - 8}` : `M ${x - h} ${y - 8} L ${x + h} ${y + 8}`;
    } else if (ifade === "sinirli") {
      d =
        ic === "sag"
          ? `M ${x - h} ${y - 4} Q ${x} ${y - 6} ${x + h} ${y + 12}`
          : `M ${x - h} ${y + 12} Q ${x} ${y - 6} ${x + h} ${y - 4}`;
    } else {
      d = `M ${x - h} ${y + 4 + yuk} Q ${x} ${y - 10 + yuk * 1.3} ${x + h} ${y + 4 + yuk}`;
    }
    return <path d={d} stroke={SAC_KOYU} strokeWidth={10} strokeLinecap="round" fill="none" />;
  };

  const agiz = {
    mutlu: { egri: 28, gen: 78 },
    saskin: { egri: 0, gen: 58 },
    sinirli: { egri: -10, gen: 54 },
    uzgun: { egri: -18, gen: 56 },
  }[ifade];

  const damla = (sn % 1.6) / 1.6;

  return (
    <svg width={size} height={size} viewBox="0 0 600 600" style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={`kadraj-${kimlik}`}>
          <rect x={-200} y={-200} width={1000} height={800} />
        </clipPath>
      </defs>
      <g transform={yon === "sol" ? "translate(600 0) scale(-1 1)" : undefined} clipPath={`url(#kadraj-${kimlik})`}>
        {/* ---- body: yellow blouse, red apron with cream polka dots ---- */}
        <g transform={olcekle(1 + b * 0.008, 1 + b * 0.018, 300, 600)}>
          <rect x={268} y={370} width={64} height={80} fill={TEN} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <path
            d="M 62 610 L 88 505 Q 104 448 196 428 L 404 424 Q 498 440 512 498 L 540 610 Z"
            fill={SARI}
            stroke={MUREKKEP}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          {/* blouse collar */}
          <path d="M 244 428 L 300 482 L 356 426 Z" fill={TEN} stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
          {/* apron straps over the shoulders */}
          <path d="M 244 500 L 226 434 M 356 500 L 374 434" stroke={MUREKKEP} strokeWidth={34} strokeLinecap="round" />
          <path d="M 244 500 L 226 434 M 356 500 L 374 434" stroke={KIRMIZI} strokeWidth={20} strokeLinecap="round" />
          {/* apron bib */}
          <path
            d="M 222 500 Q 300 486 378 500 L 412 610 L 188 610 Z"
            fill={KIRMIZI}
            stroke={MUREKKEP}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          {[
            [258, 530],
            [300, 520],
            [342, 530],
            [236, 572],
            [280, 560],
            [322, 560],
            [364, 572],
            [300, 600],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={7} fill={KREM} />
          ))}
          <path d="M 226 504 Q 300 490 374 504" stroke="white" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.35} />
        </g>

        {/* ---- head ---- */}
        <g transform={`translate(0 ${kafaY}) ${dondur(kafaAci, 300, 420)}`}>
          {/* hair behind the face: short, wavy hem on both sides */}
          <path
            d="M 300 118 Q 146 120 148 280 Q 146 340 162 378 Q 178 350 196 380 Q 214 352 228 332 L 372 332 Q 386 352 404 380 Q 422 350 438 378 Q 454 340 452 280 Q 454 120 300 118 Z"
            fill={SAC}
            stroke={MUREKKEP}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          {/* face */}
          <circle cx={300} cy={280} r={124} fill={TEN} stroke={MUREKKEP} strokeWidth={KONTUR} />
          {/* hair cap with a scalloped fringe and short sideburns */}
          <path
            d="M 170 300 Q 150 140 300 128 Q 450 140 430 300 Q 424 240 410 180 Q 382 228 355 180 Q 328 228 300 180 Q 272 228 245 180 Q 218 228 190 180 Q 176 240 170 300 Z"
            fill={SAC}
            stroke={MUREKKEP}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          <g stroke={SAC_KOYU} strokeWidth={5} strokeLinecap="round" fill="none">
            <path d="M 214 152 Q 232 138 250 150 Q 268 162 286 148" />
            <path d="M 318 146 Q 338 136 356 150 Q 372 160 392 148" />
            <path d="M 172 222 Q 164 250 178 278" />
            <path d="M 428 222 Q 436 250 422 278" />
          </g>
          <path d="M 226 166 Q 252 156 280 164" stroke="white" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.32} />

          {/* gold hoop earrings, hanging out of the hair */}
          <circle cx={176} cy={346} r={15} fill="none" stroke={MUREKKEP} strokeWidth={9} />
          <circle cx={176} cy={346} r={15} fill="none" stroke={ALTIN} strokeWidth={4} />
          <circle cx={424} cy={346} r={15} fill="none" stroke={MUREKKEP} strokeWidth={9} />
          <circle cx={424} cy={346} r={15} fill="none" stroke={ALTIN} strokeWidth={4} />

          {/* cheeks and soft laugh lines */}
          <ellipse cx={224} cy={346} rx={25} ry={14} fill={YANAK} opacity={ifade === "mutlu" ? 0.85 : 0.5} />
          <ellipse cx={376} cy={346} rx={25} ry={14} fill={YANAK} opacity={ifade === "mutlu" ? 0.85 : 0.5} />
          {ifade === "mutlu" ? (
            <g stroke={MUREKKEP} strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.55}>
              <path d="M 244 364 Q 250 380 262 388" />
              <path d="M 356 364 Q 350 380 338 388" />
              <path d="M 192 288 Q 184 292 180 300" />
              <path d="M 408 288 Q 416 292 420 300" />
            </g>
          ) : null}

          {gozCiz(252, 284, -1)}
          {gozCiz(348, 284, 1)}

          {/* nose */}
          <path d="M 287 324 Q 300 344 314 324" stroke={MUREKKEP} strokeWidth={6} strokeLinecap="round" fill={TEN_KOYU} />

          {kas(252, 226, "sag")}
          {kas(348, 226, "sol")}

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

          {ifade === "sinirli" ? (
            <g stroke={KIRMIZI} strokeWidth={8} strokeLinecap="round" fill="none">
              <path d="M 408 150 Q 420 150 420 138" />
              <path d="M 430 138 Q 430 150 442 150" />
              <path d="M 442 160 Q 430 160 430 172" />
              <path d="M 420 172 Q 420 160 408 160" />
            </g>
          ) : null}
          {ifade === "uzgun" ? (
            <path
              d={`M 232 ${338 + damla * 60} q -11 18 0 24 q 11 -6 0 -24 Z`}
              fill="#7CC7F2"
              stroke={MUREKKEP}
              strokeWidth={4}
              opacity={damla < 0.85 ? 1 : 0}
            />
          ) : null}
          {ifade === "saskin" ? (
            <g stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round">
              <line x1={210} y1={96} x2={194} y2={70} />
              <line x1={248} y1={76} x2={244} y2={46} />
              <line x1={352} y1={76} x2={356} y2={46} />
              <line x1={390} y1={96} x2={406} y2={70} />
            </g>
          ) : null}
        </g>

        {/* ---- free (left) arm: yellow sleeve, rests or waves goodbye ---- */}
        <g transform={elSalliyor && kk === 0 ? dondur(dalga, solE[0], solE[1] + 60) : undefined}>
          <path d={solYol} stroke={MUREKKEP} strokeWidth={78} strokeLinecap="round" fill="none" />
          <path d={solYol} stroke={SARI} strokeWidth={62} strokeLinecap="round" fill="none" />
          <path d={solYol} stroke={KOYU_SARI} strokeWidth={5} strokeLinecap="round" fill="none" strokeDasharray="2 16" opacity={0.7} />
          {elSalliyor && kk === 0 ? (
            <g>
              {[-30, -10, 10, 30].map((a, i) => {
                const rad = (a * Math.PI) / 180;
                const x2 = solE[0] + Math.sin(rad) * (i === 1 || i === 2 ? 66 : 56);
                const y2 = solE[1] - Math.cos(rad) * (i === 1 || i === 2 ? 66 : 56);
                return (
                  <g key={a}>
                    <line x1={solE[0]} y1={solE[1] - 10} x2={x2} y2={y2} stroke={MUREKKEP} strokeWidth={24} strokeLinecap="round" />
                    <line x1={solE[0]} y1={solE[1] - 10} x2={x2} y2={y2} stroke={TEN} strokeWidth={12} strokeLinecap="round" />
                  </g>
                );
              })}
              <circle cx={solE[0]} cy={solE[1]} r={34} fill={TEN} stroke={MUREKKEP} strokeWidth={6} />
            </g>
          ) : (
            <circle cx={solE[0]} cy={solE[1]} r={32} fill={TEN} stroke={MUREKKEP} strokeWidth={6} />
          )}
        </g>

        {/* ---- ladle arm (right): the series' recognition mark ---- */}
        <g transform={dondur(sallanma, sagBas[0], sagBas[1])}>
          <path d={sagYol} stroke={MUREKKEP} strokeWidth={78} strokeLinecap="round" fill="none" />
          <path d={sagYol} stroke={SARI} strokeWidth={62} strokeLinecap="round" fill="none" />
          <path d={sagYol} stroke={KOYU_SARI} strokeWidth={5} strokeLinecap="round" fill="none" strokeDasharray="2 16" opacity={0.7} />
          {kepceGorunur ? (
            <g
              transform={`translate(${sagE[0]} ${sagE[1]}) rotate(${interpolate(kld, [0, 1], [10, 16])})`}
              opacity={interpolate(kk, [0, 0.2], [1, 0], { extrapolateRight: "clamp" })}
            >
              <Kepce />
            </g>
          ) : null}
          <circle cx={sagE[0]} cy={sagE[1]} r={32} fill={TEN} stroke={MUREKKEP} strokeWidth={6} />
          {kepceGorunur ? (
            <path
              d={`M ${sagE[0] - 14} ${sagE[1] - 8} Q ${sagE[0]} ${sagE[1] - 20} ${sagE[0] + 14} ${sagE[1] - 8}`}
              stroke={MUREKKEP}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}
        </g>
      </g>
    </svg>
  );
};
