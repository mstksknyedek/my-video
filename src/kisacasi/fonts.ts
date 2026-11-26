import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Both fonts are SIL Open Font License (see public/fonts/*-OFL.txt) and include Turkish letters.
// Headlines: Bricolage Grotesque Bold. Captions and small text: Outfit Bold (round, like the logo).
export const HEADLINE_FONT = "Bricolage Grotesque";
export const BODY_FONT = "Outfit";

await Promise.all([
  loadFont({
    family: HEADLINE_FONT,
    url: staticFile("fonts/BricolageGrotesque-Bold.ttf"),
    weight: "700",
  }),
  loadFont({
    family: BODY_FONT,
    url: staticFile("fonts/Outfit-Bold.ttf"),
    weight: "700",
  }),
]);
