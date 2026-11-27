import { useVideoConfig, useCurrentFrame } from "remotion";
import { HEADLINE_FONT } from "../fonts";
import { gozAcikligi, KIRMIZI, MUREKKEP, SARI } from "./animasyon";

export type KonukSac = "kisa" | "uzun" | "topuz" | "kir" | "kel" | "dalga";

type Props = {
  /** Width (and height) in px; the drawing is square, bust shot with the bottom edge at y=size. */
  readonly size: number;
  readonly sac: KonukSac;
  readonly sacRengi: string;
  readonly ten: string;
  readonly giysi: string;
  readonly biyik?: boolean;
  readonly gozluk?: boolean;
  /** Colour of a shawl over the shoulders (omit for none). */
  readonly sal?: string;
  /** Notebook: 0 = closed, 1 = open and facing us. */
  readonly defter?: number;
  /** Cover colour of the notebook. */
  readonly defterRengi?: string;
  /** Notebook scale (1 = normal; a pocket notebook is about 0.6). */
  readonly defterOlcek?: number;
  /** If set she holds up a thick notebook, cover towards us, with this label on it (instead of the open pages). */
  readonly kalinDefter?: string;
  /** The pen hand scribbles. */
  readonly yaziyor?: boolean;
  /** Reaches the arm out to the side (0 rest .. 1 fully stretched), e.g. to pin something. Leftwards. */
  readonly kolUzat?: number;
  /** Shifts the blink schedule (frames). */
  readonly kirpmaGecikmesi?: number;
  /** Seen from behind (hair covers the head, no face). Used for the bride and the groom. */
  readonly arkadan?: boolean;
};

const YANAK = "#FF9C8A";

/**
 * A simple bust of a wedding guest: round face, dot eyes, a few hair shapes, clothes from the palette,
 * and an optional notebook. One template, many variants. viewBox 200x200, bust cut at the bottom edge.
 */
export const Konuk: React.FC<Props> = ({
  size,
  sac,
  sacRengi,
  ten,
  giysi,
  biyik = false,
  gozluk = false,
  sal,
  defter = 0,
  defterRengi = KIRMIZI,
  defterOlcek = 1,
  kalinDefter,
  yaziyor = false,
  kolUzat = 0,
  kirpmaGecikmesi = 0,
  arkadan = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const goz = gozAcikligi(frame, fps, kirpmaGecikmesi);
  const sw = 5;

  const sacCiz = () => {
    switch (sac) {
      case "uzun":
        return (
          <g fill={sacRengi} stroke={MUREKKEP} strokeWidth={sw} strokeLinejoin="round">
            <path d="M 52 80 Q 44 140 60 170 L 78 150 L 78 80 Z" />
            <path d="M 148 80 Q 156 140 140 170 L 122 150 L 122 80 Z" />
          </g>
        );
      case "topuz":
        return <circle cx={100} cy={28} r={19} fill={sacRengi} stroke={MUREKKEP} strokeWidth={sw} />;
      default:
        return null;
    }
  };
  const sacUst = () => {
    const kapak = "M 54 84 Q 50 34 100 32 Q 150 34 146 84 Q 134 58 100 60 Q 66 58 54 84 Z";
    if (sac === "kel") {
      return (
        <g fill={sacRengi} stroke={MUREKKEP} strokeWidth={4}>
          <circle cx={56} cy={80} r={10} />
          <circle cx={144} cy={80} r={10} />
        </g>
      );
    }
    if (sac === "dalga") {
      return (
        <g fill={sacRengi} stroke={MUREKKEP} strokeWidth={4}>
          {[56, 72, 90, 110, 128, 144].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 === 0 ? 56 : 46} r={17} />
          ))}
        </g>
      );
    }
    return <path d={kapak} fill={sacRengi} stroke={MUREKKEP} strokeWidth={sw} strokeLinejoin="round" />;
  };

  // ---- notebook (in front of the chest) ----
  const d = Math.max(0, Math.min(1, defter));
  const yarim = 34 + 22 * d; // half width of the open book
  const defterCiz = () => {
    if (kalinDefter) {
      return (
        <g transform="translate(100 150)">
          <rect x={-58} y={-44} width={116} height={92} rx={8} fill={defterRengi} stroke={MUREKKEP} strokeWidth={sw} />
          <rect x={-58} y={-44} width={18} height={92} fill={MUREKKEP} opacity={0.25} />
          <rect x={-34} y={-24} width={84} height={34} rx={4} fill="#FFF6E6" stroke={MUREKKEP} strokeWidth={3} />
          <text
            x={8}
            y={0}
            textAnchor="middle"
            fontFamily={HEADLINE_FONT}
            fontWeight={700}
            fontSize={22}
            fill={MUREKKEP}
          >
            {kalinDefter}
          </text>
          <circle cx={32} cy={28} r={7} fill={SARI} stroke={MUREKKEP} strokeWidth={3} />
        </g>
      );
    }
    return (
      <g transform={`translate(100 160) scale(${defterOlcek})`}>
        <rect x={-yarim - 4} y={-26} width={yarim * 2 + 8} height={56} rx={6} fill={defterRengi} stroke={MUREKKEP} strokeWidth={sw} />
        {d > 0.08 ? (
          <g>
            <path
              d={`M ${-yarim} -22 L -2 -16 L -2 26 L ${-yarim} 20 Z`}
              fill="#FFFDF4"
              stroke={MUREKKEP}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <path
              d={`M ${yarim} -22 L 2 -16 L 2 26 L ${yarim} 20 Z`}
              fill="#FFFDF4"
              stroke={MUREKKEP}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            {d > 0.6 ? (
              <g stroke="#9AA8C8" strokeWidth={2} opacity={0.9}>
                {[-8, 2, 12].map((y) => (
                  <g key={y}>
                    <line x1={-yarim + 8} y1={y - 3} x2={-10} y2={y} />
                    <line x1={10} y1={y} x2={yarim - 8} y2={y - 3} />
                  </g>
                ))}
              </g>
            ) : null}
          </g>
        ) : (
          <rect x={-yarim + 4} y={-18} width={yarim * 2 - 8} height={8} fill="#FFF6E6" opacity={0.7} />
        )}
      </g>
    );
  };

  const kalemX = 56 + (yaziyor ? Math.sin(frame * 1.7) * 7 : 0);
  const kalemY = 166 + (yaziyor ? Math.cos(frame * 2.3) * 3 : 0);

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
      {/* hair behind the head (long hair) */}
      {sacCiz()}
      {/* body */}
      <path
        d="M 14 210 Q 18 148 70 140 L 130 140 Q 182 148 186 210 Z"
        fill={giysi}
        stroke={MUREKKEP}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {sal ? (
        <path
          d="M 30 200 Q 36 150 76 142 L 100 176 L 124 142 Q 164 150 170 200 Q 140 160 100 190 Q 60 160 30 200 Z"
          fill={sal}
          stroke={MUREKKEP}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      ) : null}
      {/* neck */}
      <rect x={88} y={116} width={24} height={30} fill={ten} stroke={MUREKKEP} strokeWidth={sw - 1} />
      {/* ears */}
      <circle cx={55} cy={90} r={9} fill={ten} stroke={MUREKKEP} strokeWidth={4} />
      <circle cx={145} cy={90} r={9} fill={ten} stroke={MUREKKEP} strokeWidth={4} />
      {/* face */}
      <circle cx={100} cy={84} r={46} fill={arkadan ? sacRengi : ten} stroke={MUREKKEP} strokeWidth={sw} />
      {arkadan ? null : (
        <g>
          <ellipse cx={74} cy={104} rx={9} ry={5} fill={YANAK} opacity={0.5} />
          <ellipse cx={126} cy={104} rx={9} ry={5} fill={YANAK} opacity={0.5} />
          <ellipse cx={82} cy={88} rx={5.2} ry={5.2 * Math.max(0.1, goz)} fill={MUREKKEP} />
          <ellipse cx={118} cy={88} rx={5.2} ry={5.2 * Math.max(0.1, goz)} fill={MUREKKEP} />
          {gozluk ? (
            <g stroke={MUREKKEP} strokeWidth={3.5} fill="none">
              <circle cx={82} cy={88} r={14} />
              <circle cx={118} cy={88} r={14} />
              <line x1={96} y1={88} x2={104} y2={88} />
            </g>
          ) : null}
          <path d="M 88 108 Q 100 119 112 108" stroke={MUREKKEP} strokeWidth={4} strokeLinecap="round" fill="none" />
          {biyik ? (
            <path d="M 80 103 Q 100 96 120 103 Q 100 111 80 103 Z" fill={sacRengi} stroke={MUREKKEP} strokeWidth={3} />
          ) : null}
        </g>
      )}
      {/* hair on top */}
      {sacUst()}
      {/* arm reaching to the side, hand with a pin */}
      {kolUzat > 0.01 ? (
        <g>
          <path
            d={`M 60 160 Q ${40 - 40 * kolUzat} ${150} ${38 - 70 * kolUzat} ${140 - 14 * kolUzat}`}
            stroke={MUREKKEP}
            strokeWidth={38}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M 60 160 Q ${40 - 40 * kolUzat} ${150} ${38 - 70 * kolUzat} ${140 - 14 * kolUzat}`}
            stroke={giysi}
            strokeWidth={28}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={38 - 70 * kolUzat} cy={140 - 14 * kolUzat} r={15} fill={ten} stroke={MUREKKEP} strokeWidth={4} />
        </g>
      ) : null}
      {defterCiz()}
      {/* hands on the notebook, pen */}
      {d > 0.05 || kalinDefter ? (
        <g>
          <circle cx={100 - (kalinDefter ? 56 : yarim)} cy={170} r={10} fill={ten} stroke={MUREKKEP} strokeWidth={4} />
          <circle cx={100 + (kalinDefter ? 56 : yarim)} cy={170} r={10} fill={ten} stroke={MUREKKEP} strokeWidth={4} />
        </g>
      ) : null}
      {d > 0.6 && !kalinDefter ? (
        <g transform={`translate(${100 + kalemX - 56} ${kalemY - 160 + 150}) rotate(35)`}>
          <rect x={-3.5} y={-22} width={7} height={26} rx={3} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={2.5} />
        </g>
      ) : null}
    </svg>
  );
};
