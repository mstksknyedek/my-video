import { useCurrentFrame, useVideoConfig } from "remotion";
import { Agiz } from "./Agiz";
import {
  agizAcikligi,
  dondur,
  gozAcikligi,
  Ifade,
  KIRMIZI,
  KONTUR,
  KREM,
  MAVI,
  MUREKKEP,
  nefes,
  olcekle,
} from "./animasyon";

type Props = {
  /** Width (and height) in px; the drawing is square. */
  readonly size: number;
  readonly ifade: Ifade;
  readonly konusuyor: boolean;
  readonly tebesirSalliyor: boolean;
  /** Which way he faces. Default "sag" (right). */
  readonly yon?: "sag" | "sol";
  /** Shifts the blink schedule (frames) so two characters do not blink together. */
  readonly kirpmaGecikmesi?: number;
};

const ZEMIN = 540;
const ALTIN = "#C9A227";
const CAM = "#D6EEF8";
const BEYAZ = "#FFFFFF";

// Uğur Hoca, the ladybird teacher: red half-dome shell with black spots, black head,
// small round wire glasses, white bushy brows and moustache, blue bow tie, a stick of chalk.
// viewBox 600x600, feet on y=540.
export const UgurHoca: React.FC<Props> = ({
  size,
  ifade,
  konusuyor,
  tebesirSalliyor,
  yon = "sag",
  kirpmaGecikmesi = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sn = frame / fps;

  const b = nefes(frame, fps);
  const goz = gozAcikligi(frame, fps, kirpmaGecikmesi);
  const acik = agizAcikligi(frame, fps, konusuyor);
  const sallan = Math.sin(sn * Math.PI * 2 * 0.7);
  const kafaSalla = konusuyor ? Math.sin(sn * Math.PI * 2 * 1.6) * 3 : 0;
  const salla = Math.sin(sn * Math.PI * 2 * 2.3);
  const kolAci = tebesirSalliyor ? salla * 16 - 6 : sallan * 2;

  // ---- legs ----
  const bacak = (hx: number, fx: number, faz: number) => {
    const kipir = Math.sin(sn * Math.PI * 2 * 0.9 + faz) * 3;
    return (
      <g key={hx}>
        <path
          d={`M ${hx} 455 Q ${(hx + fx) / 2 + 14} 500 ${fx + kipir} ${ZEMIN}`}
          stroke={MUREKKEP}
          strokeWidth={11}
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx={fx + kipir + 6} cy={ZEMIN} rx={11} ry={6} fill={MUREKKEP} />
      </g>
    );
  };

  // ---- eyes behind the lenses ----
  const gozOlcek = ifade === "saskin" ? 1.18 : 1;
  const bebek = {
    mutlu: { dx: 4, dy: 1, r: 7 },
    saskin: { dx: 1, dy: 0, r: 4.5 },
    sinirli: { dx: 4, dy: 2, r: 7 },
    uzgun: { dx: 2, dy: 6, r: 7 },
  }[ifade];
  const gozCiz = (cx: number, cy: number, r0: number) => {
    const r = r0 * gozOlcek;
    const k = r0 / 18;
    if (goz < 0.18) {
      return (
        <path
          d={`M ${cx - r} ${cy} Q ${cx} ${cy + 6} ${cx + r} ${cy}`}
          stroke={MUREKKEP}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      );
    }
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * goz} fill={BEYAZ} stroke={MUREKKEP} strokeWidth={4} />
        <ellipse
          cx={cx + bebek.dx * k}
          cy={cy + bebek.dy * k * goz}
          rx={bebek.r * k}
          ry={bebek.r * k * goz}
          fill={MUREKKEP}
        />
      </g>
    );
  };

  // ---- white bushy brows ----
  const kas = (x: number, y: number, w: number, ic: "sag" | "sol") => {
    const h = w / 2;
    const yuk = ifade === "saskin" ? -14 : 0;
    let d: string;
    if (ifade === "sinirli") {
      d = ic === "sag" ? `M ${x - h} ${y - 6} L ${x + h} ${y + 10}` : `M ${x - h} ${y + 10} L ${x + h} ${y - 6}`;
    } else if (ifade === "uzgun") {
      d = ic === "sag" ? `M ${x - h} ${y + 8} L ${x + h} ${y - 8}` : `M ${x - h} ${y - 8} L ${x + h} ${y + 8}`;
    } else {
      d = `M ${x - h} ${y + 3 + yuk} Q ${x} ${y - 9 + yuk * 1.3} ${x + h} ${y + 3 + yuk}`;
    }
    return <path d={d} stroke={BEYAZ} strokeWidth={13} strokeLinecap="round" fill="none" />;
  };

  const agiz = {
    mutlu: { egri: 12, gen: 40 },
    saskin: { egri: 0, gen: 40 },
    sinirli: { egri: -6, gen: 34 },
    uzgun: { egri: -12, gen: 36 },
  }[ifade];

  // moustache lifts when smiling or talking, droops when sad
  const biyikY = (ifade === "mutlu" ? -3 : ifade === "uzgun" ? 4 : 0) - acik * 4;
  const gozlukY = ifade === "saskin" ? -8 : 0;
  const damla = (sn % 1.6) / 1.6;

  // chalk dust: three puffs that fade out behind the chalk tip while waving
  const toz = tebesirSalliyor
    ? [0, 1, 2].map((i) => {
        const p = (sn * 2.3 + i / 3) % 1;
        return (
          <circle
            key={i}
            cx={638 + i * 6 - p * 26}
            cy={384 - p * 46}
            r={5 + p * 8}
            fill={BEYAZ}
            stroke={MUREKKEP}
            strokeWidth={2}
            opacity={(1 - p) * 0.9}
          />
        );
      })
    : null;

  return (
    <svg width={size} height={size} viewBox="0 0 600 600" style={{ overflow: "visible" }}>
      <g transform={yon === "sol" ? "translate(600 0) scale(-1 1)" : undefined}>
        <ellipse cx={310} cy={ZEMIN + 6} rx={240} ry={14} fill={MUREKKEP} opacity={0.12} />
        {bacak(130, 110, 0)}
        {bacak(235, 225, 2)}
        {bacak(335, 340, 4)}

        {/* head (under the shell's front edge) */}
        <g transform={`${dondur(kafaSalla, 440, 470)} translate(0 ${-b * 2.5})`}>
          {/* short clubbed antennae */}
          <g transform={dondur(sallan * 6, 468, 300)}>
            <path d="M 468 300 Q 456 268 444 244" stroke={MUREKKEP} strokeWidth={8} strokeLinecap="round" fill="none" />
            <ellipse cx={442} cy={238} rx={9} ry={12} fill={MUREKKEP} />
          </g>
          <g transform={dondur(-sallan * 6, 508, 298)}>
            <path d="M 508 298 Q 516 266 530 246" stroke={MUREKKEP} strokeWidth={8} strokeLinecap="round" fill="none" />
            <ellipse cx={533} cy={240} rx={9} ry={12} fill={MUREKKEP} />
          </g>
          <circle cx={478} cy={392} r={102} fill={MUREKKEP} stroke={MUREKKEP} strokeWidth={KONTUR} />
          <path d="M 530 312 Q 562 326 574 356" stroke={BEYAZ} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.3} />

          {/* glasses */}
          <g transform={`translate(0 ${gozlukY})`}>
            <line x1={461} y1={368} x2={410} y2={360} stroke={ALTIN} strokeWidth={5} strokeLinecap="round" />
            <circle cx={492} cy={370} r={31} fill={CAM} stroke={ALTIN} strokeWidth={6} />
            <circle cx={552} cy={366} r={25} fill={CAM} stroke={ALTIN} strokeWidth={6} />
            <path d="M 522 366 Q 525 358 528 363" stroke={ALTIN} strokeWidth={5} fill="none" />
            {gozCiz(494, 371, 19)}
            {gozCiz(553, 367, 15)}
            <path d="M 474 352 L 482 346" stroke={BEYAZ} strokeWidth={4} strokeLinecap="round" opacity={0.9} />
          </g>
          {kas(492, 326 + gozlukY, 46, "sag")}
          {kas(552, 322 + gozlukY, 36, "sol")}

          <Agiz
            cx={524}
            cy={448}
            genislik={agiz.gen}
            egri={agiz.egri}
            acik={acik}
            yuvarlak={ifade === "saskin"}
            cizgi={KREM}
            kalinlik={5}
          />
          {/* moustache */}
          <path
            transform={`translate(0 ${biyikY})`}
            d="M 524 420 Q 505 403 481 416 Q 474 432 492 434 Q 510 438 524 429 Q 538 438 556 434 Q 574 432 567 416 Q 543 403 524 420 Z"
            fill={BEYAZ}
            stroke={MUREKKEP}
            strokeWidth={3}
          />

          {ifade === "sinirli" ? (
            <g stroke={KIRMIZI} strokeWidth={7} strokeLinecap="round" fill="none">
              <path d="M 412 330 Q 424 330 424 318" />
              <path d="M 434 318 Q 434 330 446 330" />
              <path d="M 446 340 Q 434 340 434 352" />
              <path d="M 424 352 Q 424 340 412 340" />
            </g>
          ) : null}
          {ifade === "uzgun" ? (
            <path
              d={`M 486 ${396 + damla * 50} q -10 16 0 22 q 10 -6 0 -22 Z`}
              fill="#7CC7F2"
              stroke={KREM}
              strokeWidth={3}
              opacity={damla < 0.85 ? 1 : 0}
            />
          ) : null}
          {ifade === "saskin" ? (
            <g stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round">
              <line x1={470} y1={214} x2={462} y2={186} />
              <line x1={505} y1={210} x2={512} y2={182} />
              <line x1={548} y1={222} x2={570} y2={200} />
            </g>
          ) : null}
        </g>

        {/* shell: red half dome with black spots */}
        <g transform={olcekle(1 + b * 0.008, 1 + b * 0.018, 235, 445)}>
          <ellipse cx={235} cy={448} rx={178} ry={22} fill={MUREKKEP} />
          <path
            d="M 55 445 A 180 180 0 0 1 415 445 Z"
            fill={KIRMIZI}
            stroke={MUREKKEP}
            strokeWidth={KONTUR}
            strokeLinejoin="round"
          />
          <circle cx={140} cy={362} r={28} fill={MUREKKEP} />
          <circle cx={240} cy={314} r={29} fill={MUREKKEP} />
          <circle cx={328} cy={366} r={25} fill={MUREKKEP} />
          <circle cx={215} cy={410} r={20} fill={MUREKKEP} />
          <circle cx={100} cy={422} r={14} fill={MUREKKEP} />
          <circle cx={318} cy={425} r={13} fill={MUREKKEP} />
          <path d="M 100 340 Q 140 282 208 270" stroke={BEYAZ} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.45} />
        </g>

        {/* bow tie */}
        <g transform={`translate(0 ${-b * 2.5})`}>
          <path d="M 470 500 L 438 484 L 438 516 Z M 470 500 L 502 484 L 502 516 Z" fill={MAVI} stroke={MUREKKEP} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={470} cy={500} r={8} fill={MAVI} stroke={MUREKKEP} strokeWidth={5} />
        </g>

        {/* arm with chalk */}
        <g transform={dondur(kolAci, 450, 510)}>
          <path d="M 450 510 Q 590 545 612 452" stroke={MUREKKEP} strokeWidth={12} strokeLinecap="round" fill="none" />
          <g transform={dondur(24, 614, 440)}>
            <rect x={604} y={384} width={20} height={58} rx={6} fill={BEYAZ} stroke={MUREKKEP} strokeWidth={5} />
          </g>
          <circle cx={612} cy={446} r={14} fill={MUREKKEP} />
          {toz}
        </g>
      </g>
    </svg>
  );
};
