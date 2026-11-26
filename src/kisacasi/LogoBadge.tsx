import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

type Props = {
  readonly style?: React.CSSProperties;
};

// Small channel wordmark kept on screen so a clip seen out of context still says "Kısacası".
const LogoBadgeInner: React.FC<Props> = ({ style }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 999,
        padding: "16px 30px",
        boxShadow: "0 6px 0 #111111",
        border: "5px solid #111111",
        opacity: interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        ...style,
      }}
    >
      <Img src={staticFile("brand/kisacasi-red.png")} style={{ height: 52, display: "block" }} />
    </div>
  );
};

export const LogoBadge = Interactive.create({
  Component: LogoBadgeInner,
  layout: "none",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
