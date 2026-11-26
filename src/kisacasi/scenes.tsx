import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BODY_FONT, HEADLINE_FONT } from "./fonts";
import { Karinca } from "./Karinca";

// Layout for 1080x1920 Shorts. YouTube covers roughly the bottom 400px (title, channel)
// and a 140px strip on the right (like/comment buttons), so key content stays above
// y=1450 and inside x=80..940.

/* ---------- 1. Hook: the first 2-3 seconds decide whether people keep watching ---------- */

type HookProps = {
  readonly line1: string;
  readonly line2: string;
};

const HookSceneInner: React.FC<HookProps> = ({ line1, line2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 80,
          width: 860,
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 120,
          lineHeight: 1.02,
          color: "#111111",
          letterSpacing: -2,
        }}
      >
        <Interactive.Div
          name="Hook line 1"
          style={{
            scale: interpolate(frame, [0, 0.35 * fps], [0.6, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 12 }),
              output: "perceptual-scale",
            }),
            rotate: interpolate(frame, [0, 0.35 * fps], ["-8deg", "-3deg"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 12 }),
            }),
            transformOrigin: "left center",
          }}
        >
          {line1}
        </Interactive.Div>
        <Interactive.Div
          name="Hook line 2"
          style={{
            marginTop: 26,
            display: "inline-block",
            backgroundColor: "#F7C600",
            padding: "6px 22px 14px",
            boxShadow: "10px 10px 0 #111111",
            opacity: interpolate(frame, [0.3 * fps, 0.45 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: interpolate(frame, [0.3 * fps, 0.7 * fps], [1.5, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 9 }),
              output: "perceptual-scale",
            }),
            rotate: interpolate(frame, [0.3 * fps, 0.7 * fps], ["6deg", "2deg"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 9 }),
            }),
          }}
        >
          {line2}
        </Interactive.Div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 380,
          top: 880,
          translate: `${interpolate(frame, [0.5 * fps, 2 * fps], [700, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}px 0px`,
        }}
      >
        <Karinca size={470} walking carry="" />
      </div>
    </>
  );
};

export const HookScene = Interactive.create({
  Component: HookSceneInner,
  layout: "absolute-fill",
  schema: {
    line1: { type: "string", default: "", description: "Hook: first line" },
    line2: { type: "string", default: "", description: "Hook: highlighted line" },
  },
});

/* ---------- 2. Story beat: sticker label, big line, a comic panel for the animation ---------- */

type StoryProps = {
  readonly label: string;
  readonly line: string;
  readonly carry: string;
  readonly walking: boolean;
};

const StorySceneInner: React.FC<StoryProps> = ({ label, line, carry, walking }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Interactive.Div
        name="Sticker"
        style={{
          position: "absolute",
          top: 230,
          left: 80,
          backgroundColor: "#1E3FAE",
          color: "white",
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: 54,
          padding: "10px 30px",
          border: "6px solid #111111",
          borderRadius: 16,
          rotate: interpolate(frame, [0, 0.4 * fps], ["-14deg", "-5deg"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
          }),
          scale: interpolate(frame, [0, 0.4 * fps], [0.3, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
            output: "perceptual-scale",
          }),
        }}
      >
        {label}
      </Interactive.Div>
      <Interactive.Div
        name="Story line"
        style={{
          position: "absolute",
          top: 350,
          left: 80,
          width: 860,
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 1.04,
          color: "#111111",
          letterSpacing: -1,
          translate: interpolate(frame, [0.1 * fps, 0.5 * fps], ["0px 40px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          opacity: interpolate(frame, [0.1 * fps, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {line}
      </Interactive.Div>
      {/* comic panel: put the scene's animation in here */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 80,
          width: 860,
          height: 660,
          backgroundColor: "white",
          border: "8px solid #111111",
          borderRadius: 28,
          boxShadow: "14px 14px 0 #111111",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 150,
            backgroundColor: "#E8D9BD",
            borderTop: "6px solid #111111",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 140,
            bottom: 60,
            translate: `${interpolate(frame, [0, 1.6 * fps], [walking ? -700 : 0, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}px 0px`,
          }}
        >
          <Karinca size={560} walking={walking} carry={carry} />
        </div>
      </div>
    </>
  );
};

export const StoryScene = Interactive.create({
  Component: StorySceneInner,
  layout: "absolute-fill",
  schema: {
    label: { type: "string", default: "", description: "Sticker label" },
    line: { type: "string", default: "", description: "Big line" },
    carry: { type: "string", default: "", description: "Text on the ant's box" },
    walking: { type: "boolean", default: true, description: "Ant walks in" },
  },
});

/* ---------- 3. Outro: logo slam, handle, subscribe ---------- */

type OutroProps = {
  readonly handle: string;
  readonly cta: string;
};

const OutroSceneInner: React.FC<OutroProps> = ({ handle, cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Img
        name="Wordmark"
        src={staticFile("brand/kisacasi-white.png")}
        style={{
          position: "absolute",
          top: 640,
          left: 115,
          width: 850,
          scale: interpolate(frame, [0, 0.3 * fps], [2.4, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.5, 0, 0.75, 0),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0, 0.15 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <Interactive.Div
        name="Handle"
        style={{
          position: "absolute",
          top: 880,
          left: 80,
          width: 920,
          textAlign: "center",
          fontFamily: BODY_FONT,
          fontWeight: 700,
          fontSize: 64,
          color: "white",
          opacity: interpolate(frame, [0.4 * fps, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {handle}
      </Interactive.Div>
      <Interactive.Div
        name="Subscribe button"
        style={{
          position: "absolute",
          top: 1050,
          left: 290,
          width: 500,
          textAlign: "center",
          backgroundColor: "#F7C600",
          color: "#111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 70,
          padding: "22px 0 30px",
          borderRadius: 999,
          border: "7px solid #111111",
          boxShadow: "0 12px 0 #111111",
          scale: interpolate(frame, [0.8 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 8 }),
            output: "perceptual-scale",
          }),
        }}
      >
        {cta}
      </Interactive.Div>
    </>
  );
};

export const OutroScene = Interactive.create({
  Component: OutroSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    handle: { type: "string", default: "@kisacasitv", description: "Channel handle" },
    cta: { type: "string", default: "ABONE OL", description: "Call to action" },
  },
});
