import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  readonly size: number;
  readonly walking: boolean;
  /** Text on a cardboard box the ant carries; empty for none. */
  readonly carry: string;
};

// A simple cartoon ant drawn in SVG. Legs and antennae move every frame,
// so the drawing itself is computed and not editable piece by piece in Studio.
export const Karinca: React.FC<Props> = ({ size, walking, carry }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const step = walking ? Math.sin((frame / fps) * Math.PI * 6) : 0;
  const bob = walking
    ? Math.abs(Math.sin((frame / fps) * Math.PI * 6)) * 6
    : Math.sin((frame / fps) * Math.PI * 1.5) * 4;
  const antenna = Math.sin((frame / fps) * Math.PI * 2.5) * 6;
  const ink = "#2B1A10";

  const leg = (x: number, phase: number) => {
    const swing = step * 14 * phase;
    return (
      <path
        d={`M ${x} 300 Q ${x + swing} 345 ${x + 18 + swing * 1.6} 392`}
        stroke={ink}
        strokeWidth={11}
        strokeLinecap="round"
        fill="none"
      />
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 520 440" style={{ overflow: "visible" }}>
      <g style={{ translate: `0px ${-bob}px` }}>
        {leg(170, 1)}
        {leg(215, -1)}
        {leg(255, 1)}
        {leg(290, -1)}
        {leg(325, 1)}
        {leg(360, -1)}
        {/* abdomen, thorax, head */}
        <ellipse cx={150} cy={280} rx={105} ry={72} fill={ink} />
        <ellipse cx={128} cy={258} rx={34} ry={16} fill="#6B4A33" opacity={0.6} />
        <ellipse cx={280} cy={285} rx={62} ry={44} fill={ink} />
        <circle cx={392} cy={250} r={62} fill={ink} />
        {/* antennae */}
        <path
          d={`M 405 195 Q ${420 + antenna} 130 ${470 + antenna} 112`}
          stroke={ink}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M 380 192 Q ${372 - antenna} 128 ${410 - antenna} 96`}
          stroke={ink}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
        />
        {/* face */}
        <circle cx={410} cy={238} r={20} fill="white" />
        <circle cx={416} cy={240} r={10} fill={ink} />
        <path d="M 404 278 Q 424 292 444 274" stroke="white" strokeWidth={6} strokeLinecap="round" fill="none" />
        {carry ? (
          <g style={{ rotate: `${interpolate(step, [-1, 1], [-3, 3])}deg`, transformOrigin: "290px 160px" }}>
            <rect x={185} y={70} width={210} height={150} rx={8} fill="#C8925A" stroke={ink} strokeWidth={7} />
            <line x1={185} y1={112} x2={395} y2={112} stroke={ink} strokeWidth={5} opacity={0.5} />
            <text
              x={290}
              y={175}
              textAnchor="middle"
              fontFamily="Outfit"
              fontWeight={700}
              fontSize={28}
              fill={ink}
            >
              {carry}
            </text>
          </g>
        ) : null}
      </g>
    </svg>
  );
};
