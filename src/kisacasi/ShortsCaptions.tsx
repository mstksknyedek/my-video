import type { Caption } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { useMemo } from "react";
import { Interactive, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT } from "./fonts";

type Props = {
  readonly captions: Caption[];
  readonly style?: React.CSSProperties;
  /** Optional: hide a page this many ms after its last word ends (default: keep it until the next page). */
  readonly beklemeMs?: number;
  /** Optional: words starting within this many ms of a page's first word share the page (default 900). */
  readonly birlestirmeMs?: number;
  /** Optional: colour of the words not being spoken (default white). */
  readonly renk?: string;
  /** Optional: words that always stay yellow and a little bigger (compared without punctuation, case-insensitive). */
  readonly vurguKelimeler?: string[];
};

// Shorts-style captions: a few words per page, the spoken word lifts and turns yellow.
const ShortsCaptionsInner: React.FC<Props> = ({
  captions,
  style,
  beklemeMs,
  birlestirmeMs = 900,
  renk = "white",
  vurguKelimeler,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: birlestirmeMs,
      }),
    [captions, birlestirmeMs],
  );

  const page = pages.find(
    (p) =>
      nowMs >= p.startMs &&
      nowMs < p.startMs + p.durationMs &&
      (beklemeMs === undefined ||
        p.tokens.length === 0 ||
        nowMs < p.tokens[p.tokens.length - 1].toMs + beklemeMs),
  );

  return (
    <div
      style={{
        width: 900,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        // the thick outline eats into spaces, so words get extra room
        columnGap: 34,
        wordSpacing: 22,
        textAlign: "center",
        fontFamily: BODY_FONT,
        fontWeight: 700,
        fontSize: 86,
        lineHeight: 1.12,
        color: "white",
        WebkitTextStroke: "14px #111111",
        paintOrder: "stroke fill",
        textShadow: "0 8px 0 rgba(0,0,0,0.25)",
        ...style,
      }}
    >
      {page
        ? page.tokens.map((t) => {
            const active = nowMs >= t.fromMs && nowMs < t.toMs;
            const vurgulu =
              vurguKelimeler?.includes(t.text.trim().toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]/gu, "")) ?? false;
            return (
              <span
                key={t.fromMs}
                style={{
                  display: "inline-block",
                  color: active || vurgulu ? "#F7C600" : renk,
                  scale: active ? "1.12" : vurgulu ? "1.08" : "1",
                  translate: active ? "0px -6px" : "0px 0px",
                }}
              >
                {t.text.trim()}
              </span>
            );
          })
        : null}
    </div>
  );
};

export const ShortsCaptions = Interactive.create({
  Component: ShortsCaptionsInner,
  layout: "none",
  schema: {
    ...Interactive.captionsSchema,
    ...Interactive.textSchema,
  },
});
