import { AGIZ_ICI, agizYolu, DIL } from "./animasyon";

type Props = {
  readonly cx: number;
  readonly cy: number;
  readonly genislik: number;
  /** > 0 smile, < 0 frown. */
  readonly egri: number;
  /** 0 shut .. 1 wide open. */
  readonly acik: number;
  /** Round "O" mouth (surprise). */
  readonly yuvarlak: boolean;
  readonly cizgi: string;
  readonly kalinlik: number;
};

// One mouth for every character: a line when shut, a dark shape with a tongue when open.
export const Agiz: React.FC<Props> = ({ cx, cy, genislik, egri, acik, yuvarlak, cizgi, kalinlik }) => {
  if (yuvarlak) {
    const rx = genislik * 0.26 + acik * genislik * 0.06;
    const ry = genislik * 0.26 + acik * genislik * 0.18;
    return (
      <ellipse
        cx={cx}
        cy={cy + ry * 0.6}
        rx={rx}
        ry={ry}
        fill={AGIZ_ICI}
        stroke={cizgi}
        strokeWidth={kalinlik}
      />
    );
  }

  const { ust, kapali, derinlik } = agizYolu({ cx, cy, genislik, egri, acik, cizgi, kalinlik });
  if (acik < 0.08) {
    return <path d={ust} stroke={cizgi} strokeWidth={kalinlik} strokeLinecap="round" fill="none" />;
  }
  const dibi = cy + derinlik / 2;
  return (
    <g>
      <path d={kapali} fill={AGIZ_ICI} stroke={cizgi} strokeWidth={kalinlik} strokeLinejoin="round" />
      {acik > 0.35 ? (
        <ellipse
          cx={cx + genislik * 0.04}
          cy={dibi - Math.max(4, derinlik * 0.12)}
          rx={genislik * 0.2}
          ry={Math.max(4, derinlik * 0.12)}
          fill={DIL}
        />
      ) : null}
    </g>
  );
};
