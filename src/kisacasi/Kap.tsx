import { useId } from "react";
import { KIRMIZI, MAVI, MUREKKEP, SARI } from "./karakterler/animasyon";

// A plain, brand-less food container (video #5 "Annenin kapları geri dönmez"): translucent cream body,
// coloured lid with a small tab, no logo, no embossed text. Drawn in a 200 x 100 box (200 x 132 when `uzun`).
// Food shows through the body; `dolum` 0..1 raises it from the bottom.

export type Icerik =
  | "fasulye"
  | "pilav"
  | "sarma"
  | "borek"
  | "kofte"
  | "dolma"
  | "kurabiye"
  | "kek"
  | "tursu";

type Props = {
  /** Width in px; the height follows (0.5 x width, or 0.66 x width when `uzun`). */
  readonly genislik: number;
  /** 0 = lid on, 1 = lid popped up and tilted off the rim. */
  readonly kapakAcik?: number;
  readonly icerik?: Icerik | null;
  /** How full: 0 empty .. 1 full (default 1 when there is food). */
  readonly dolum?: number;
  readonly kapakRenk?: string;
  /** The odd lid: wider than the box, a different colour, sits crooked. */
  readonly uyumsuz?: boolean;
  /** Tall box (for the pickles). */
  readonly uzun?: boolean;
};

export const KAP_RENKLERI = [KIRMIZI, MAVI, SARI] as const;

/** Height / width of the drawing. */
export const kapOrani = (uzun: boolean): number => (uzun ? 0.66 : 0.5);

const Yemek: React.FC<{ readonly tur: Icerik; readonly y0: number; readonly y1: number }> = ({ tur, y0, y1 }) => {
  const h = y1 - y0;
  switch (tur) {
    case "fasulye":
      return (
        <g>
          <rect x={20} y={y0} width={160} height={h + 10} fill="#B5482A" />
          {[
            [48, 0.3, 20],
            [86, 0.55, -10],
            [124, 0.3, 30],
            [156, 0.6, 0],
            [66, 0.8, 40],
            [108, 0.85, -25],
            [142, 0.9, 15],
          ].map(([x, t, r]) => (
            <ellipse key={`${x}-${t}`} cx={x} cy={y0 + h * t} rx={10} ry={6.5} fill="#FFF1D0" stroke="#6E2A14" strokeWidth={2.6} transform={`rotate(${r} ${x} ${y0 + h * t})`} />
          ))}
        </g>
      );
    case "pilav":
      return (
        <g>
          <rect x={20} y={y0 + 4} width={160} height={h + 6} fill="#FFF3C9" />
          <path d={`M 20 ${y0 + 4} Q 60 ${y0 - 8} 100 ${y0 + 2} T 180 ${y0 + 4} L 180 ${y0 + 12} L 20 ${y0 + 12} Z`} fill="#FFF3C9" />
          {[
            [44, 0.3],
            [78, 0.6],
            [112, 0.35],
            [144, 0.7],
            [60, 0.85],
            [128, 0.9],
          ].map(([x, t]) => (
            <path key={`${x}-${t}`} d={`M ${x} ${y0 + h * t} l 12 -4 M ${x + 6} ${y0 + h * t + 8} l 12 -4`} stroke="#D9C37A" strokeWidth={3.2} strokeLinecap="round" />
          ))}
        </g>
      );
    case "sarma":
      return (
        <g>
          <rect x={20} y={y0 + 6} width={160} height={h + 4} fill="#DDE8B8" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={34 + i * 46} y={y0 + 2} width={40} height={h * 0.46} rx={13} fill="#6E9B3C" stroke="#3C5B1F" strokeWidth={3} />
              <rect x={34 + i * 46} y={y0 + h * 0.5} width={40} height={h * 0.46} rx={13} fill="#7DAE48" stroke="#3C5B1F" strokeWidth={3} />
            </g>
          ))}
        </g>
      );
    case "borek":
      return (
        <g>
          <rect x={20} y={y0 + 8} width={160} height={h + 4} fill="#F3D9A0" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <path d={`M ${34 + i * 46} ${y0 + h} L ${58 + i * 46} ${y0 + 2} L ${84 + i * 46} ${y0 + h} Z`} fill="#E8A83A" stroke="#8A5A18" strokeWidth={3} strokeLinejoin="round" />
              <path d={`M ${50 + i * 46} ${y0 + h * 0.6} L ${66 + i * 46} ${y0 + h * 0.6}`} stroke="#B97A22" strokeWidth={3} strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
    case "kofte":
      return (
        <g>
          <rect x={20} y={y0 + 10} width={160} height={h} fill="#F3D9A0" />
          {[
            [46, 0.45],
            [80, 0.3],
            [114, 0.45],
            [148, 0.3],
            [62, 0.85],
            [100, 0.8],
            [136, 0.85],
          ].map(([x, t]) => (
            <circle key={`${x}-${t}`} cx={x} cy={y0 + h * t} r={15} fill="#8A4B26" stroke="#4E2A12" strokeWidth={3} />
          ))}
        </g>
      );
    case "dolma":
      return (
        <g>
          <rect x={20} y={y0 + 8} width={160} height={h + 4} fill="#D7E4A8" />
          {[
            [42, 0.3, -15],
            [78, 0.55, 10],
            [114, 0.3, -8],
            [150, 0.55, 14],
            [60, 0.9, 6],
            [100, 0.9, -12],
            [138, 0.95, 8],
          ].map(([x, t, r]) => (
            <ellipse key={`${x}-${t}`} cx={x} cy={y0 + h * t} rx={17} ry={11} fill="#4B7A2E" stroke="#2A4818" strokeWidth={3} transform={`rotate(${r} ${x} ${y0 + h * t})`} />
          ))}
        </g>
      );
    case "kurabiye":
      return (
        <g>
          <rect x={20} y={y0 + 10} width={160} height={h} fill="#F6E6C2" />
          {[
            [48, 0.4],
            [92, 0.3],
            [136, 0.4],
            [70, 0.85],
            [116, 0.85],
          ].map(([x, t]) => (
            <g key={`${x}-${t}`}>
              <circle cx={x} cy={y0 + h * t} r={19} fill="#E0B070" stroke="#8A6030" strokeWidth={3} />
              <circle cx={x - 6} cy={y0 + h * t - 4} r={2.6} fill="white" />
              <circle cx={x + 5} cy={y0 + h * t + 5} r={2.6} fill="white" />
              <circle cx={x + 6} cy={y0 + h * t - 7} r={2.6} fill="white" />
            </g>
          ))}
        </g>
      );
    case "kek":
      return (
        <g>
          <rect x={20} y={y0 + 6} width={160} height={h + 6} fill="#F0C14B" />
          <path d={`M 20 ${y0 + 6} Q 50 ${y0 - 10} 100 ${y0 + 2} T 180 ${y0 + 6} L 180 ${y0 + 24} Q 150 ${y0 + 34} 100 ${y0 + 24} T 20 ${y0 + 24} Z`} fill="#8A5A2E" stroke="#4E2E14" strokeWidth={3} />
          {[
            [56, 0.62],
            [100, 0.8],
            [142, 0.62],
          ].map(([x, t]) => (
            <circle key={x} cx={x} cy={y0 + h * t} r={4} fill="#B5792E" />
          ))}
        </g>
      );
    case "tursu":
      return (
        <g>
          <rect x={20} y={y0} width={160} height={h + 10} fill="#DCE79A" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={32 + i * 29} y={y0 + 6 + (i % 2) * 8} width={20} height={h - 8 - (i % 2) * 6} rx={10} fill="#6E9B3C" stroke="#3C5B1F" strokeWidth={3} />
              <circle cx={42 + i * 29} cy={y0 + 26 + (i % 2) * 8} r={2.4} fill="#A6CC6A" />
              <circle cx={42 + i * 29} cy={y0 + 44 + (i % 2) * 8} r={2.4} fill="#A6CC6A" />
            </g>
          ))}
        </g>
      );
  }
};

export const Kap: React.FC<Props> = ({
  genislik,
  kapakAcik = 0,
  icerik = null,
  dolum = 1,
  kapakRenk = KIRMIZI,
  uyumsuz = false,
  uzun = false,
}) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const H = uzun ? 132 : 100;
  const govde = `M 12 30 L 188 30 L 177 ${H - 10} Q 175 ${H - 2} 165 ${H - 2} L 35 ${H - 2} Q 25 ${H - 2} 23 ${H - 10} Z`;
  const y0 = 40;
  const y1 = H - 8;
  const doluY = y1 - (y1 - y0) * Math.max(0, Math.min(1, dolum));
  const lidGen = uyumsuz ? 1.16 : 1;
  const lidX = 100 - 94 * lidGen;
  const lidW = 188 * lidGen;
  const lidR = uyumsuz ? -3 : 0;
  const lidTy = -kapakAcik * 30;
  const lidTx = -kapakAcik * 16;
  const lidRot = -kapakAcik * 24 + lidR;
  return (
    <svg width={genislik} height={genislik * (H / 200)} viewBox={`0 0 200 ${H}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <clipPath id={`govde-${id}`}>
          <path d={govde} />
        </clipPath>
      </defs>
      {/* the open rim shows when the lid is up */}
      {kapakAcik > 0.05 ? <ellipse cx={100} cy={31} rx={88} ry={9} fill="#E9DDBF" stroke={MUREKKEP} strokeWidth={5} /> : null}
      <path d={govde} fill="#FBF7EC" fillOpacity={0.9} />
      <g clipPath={`url(#govde-${id})`}>
        {icerik && dolum > 0.02 ? (
          <g clipPath={`url(#dolu-${id})`}>
            <Yemek tur={icerik} y0={y0} y1={y1} />
          </g>
        ) : null}
        <clipPath id={`dolu-${id}`}>
          <rect x={0} y={doluY} width={200} height={H} />
        </clipPath>
        <path d={`M 28 ${H - 14} Q 24 54 36 42`} stroke="white" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.55} />
      </g>
      <path d={govde} fill="none" stroke={MUREKKEP} strokeWidth={7} strokeLinejoin="round" />
      {/* the lid */}
      <g transform={`translate(${lidTx} ${lidTy}) rotate(${lidRot} 100 24)`}>
        <rect x={lidX} y={12} width={lidW} height={24} rx={10} fill={kapakRenk} stroke={MUREKKEP} strokeWidth={7} />
        <rect x={86} y={3} width={28} height={12} rx={6} fill={kapakRenk} stroke={MUREKKEP} strokeWidth={6} />
        <path d={`M ${lidX + 14} 20 L ${lidX + 56} 20`} stroke="white" strokeWidth={5} strokeLinecap="round" opacity={0.5} />
      </g>
    </svg>
  );
};
