import { Audio } from "@remotion/media";
import { Sequence, staticFile, Track, useVideoConfig } from "remotion";
import "./fonts";
import { LogoBadge } from "./LogoBadge";
import { PaperBackground } from "./PaperBackground";
import { HookScene, OutroScene, StoryScene } from "./scenes";
import { ShortsCaptions } from "./ShortsCaptions";

// Kısacası Shorts template: hook -> story beats -> outro, 1080x1920, 30 fps.
// Sample content: an original joke about rent prices told with an ant (no real people).
// To make a new video: change the texts, the captions (match them to the voiceover)
// and the scene timings; add the voiceover on the "Seslendirme" track.
export const KisacasiShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Sequence name="Paper background" durationInFrames={12 * fps}>
        <PaperBackground />
      </Sequence>

      <Track name="Sahneler">
        <HookScene
          name="Hook"
          durationInFrames={3 * fps}
          line1="Kiralar öyle arttı ki"
          line2="karıncalar bile ev arkadaşı arıyor!"
        />
        <StoryScene
          name="İlan"
          from={3 * fps}
          durationInFrames={4.5 * fps}
          label="İLAN"
          line="Yuva kiralık. Şartlar biraz ağır."
          carry="TAŞINIYORUM"
          walking
        />
        <StoryScene
          name="Şartlar"
          from={7.5 * fps}
          durationInFrames={4.5 * fps}
          label="ŞARTLAR"
          line="Kira: 1 kırıntı. Depozito: 2 ay!"
          carry="KOMİSYON?!"
          walking={false}
        />
        <OutroScene
          name="Kapanış"
          from={12 * fps}
          durationInFrames={3 * fps}
          handle="@kisacasitv"
          cta="ABONE OL"
          style={{ backgroundColor: "#E51C0F" }}
        />
      </Track>

      <LogoBadge
        name="Logo"
        durationInFrames={12 * fps}
        style={{ position: "absolute", top: 100, left: 80 }}
      />

      <ShortsCaptions
        name="Altyazı"
        durationInFrames={12 * fps}
        style={{ position: "absolute", top: 1330, left: 90 }}
        captions={[
          { text: "Kiralar", startMs: 0, endMs: 400, timestampMs: null, confidence: null },
          { text: " öyle", startMs: 400, endMs: 750, timestampMs: null, confidence: null },
          { text: " arttı", startMs: 750, endMs: 1100, timestampMs: null, confidence: null },
          { text: " ki,", startMs: 1100, endMs: 1350, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " karıncalar", startMs: 1400, endMs: 1900, timestampMs: null, confidence: null },
          { text: " bile", startMs: 1900, endMs: 2200, timestampMs: null, confidence: null },
          { text: " ev", startMs: 2200, endMs: 2450, timestampMs: null, confidence: null },
          { text: " arkadaşı", startMs: 2450, endMs: 2850, timestampMs: null, confidence: null },
          { text: " arıyor!", startMs: 2850, endMs: 3300, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " İlan:", startMs: 3400, endMs: 3900, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Yuva", startMs: 4000, endMs: 4400, timestampMs: null, confidence: null },
          { text: " kiralık.", startMs: 4400, endMs: 5000, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Şartlar", startMs: 5200, endMs: 5700, timestampMs: null, confidence: null },
          { text: " biraz", startMs: 5700, endMs: 6100, timestampMs: null, confidence: null },
          { text: " ağır.", startMs: 6100, endMs: 6700, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bir", startMs: 7600, endMs: 7850, timestampMs: null, confidence: null },
          { text: " şeker", startMs: 7850, endMs: 8200, timestampMs: null, confidence: null },
          { text: " kırıntısı,", startMs: 8200, endMs: 8800, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " iki", startMs: 8900, endMs: 9150, timestampMs: null, confidence: null },
          { text: " ay", startMs: 9150, endMs: 9400, timestampMs: null, confidence: null },
          { text: " depozito.", startMs: 9400, endMs: 10100, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bir", startMs: 10300, endMs: 10500, timestampMs: null, confidence: null },
          { text: " de", startMs: 10500, endMs: 10700, timestampMs: null, confidence: null },
          { text: " komisyon!", startMs: 10700, endMs: 11700, timestampMs: null, confidence: null },
        ]}
      />

      <Track name="Ses efektleri">
        <Audio name="Hook pop" src={staticFile("sfx/pop.mp3")} from={0} volume={0.8} />
        <Audio name="Hook vuruş" src={staticFile("sfx/hit.mp3")} from={0.3 * fps} durationInFrames={1 * fps} volume={0.5} />
        <Audio name="Karınca giriş" src={staticFile("sfx/soft-whoosh.wav")} from={0.6 * fps} volume={0.7} />
        <Audio name="Geçiş 1" src={staticFile("sfx/whoosh.mp3")} from={3 * fps} volume={0.7} />
        <Audio name="Geçiş 2" src={staticFile("sfx/whoosh.mp3")} from={7.5 * fps} volume={0.7} />
        <Audio name="Komisyon vuruş" src={staticFile("sfx/hit.mp3")} from={10.7 * fps} durationInFrames={1 * fps} volume={0.6} />
        <Audio name="Gerilim" src={staticFile("sfx/riser.mp3")} from={11 * fps} durationInFrames={1 * fps} volume={0.4} />
        <Audio name="Logo" src={staticFile("sfx/logo-hit.wav")} from={12 * fps} volume={0.9} />
        <Audio name="Abone ol" src={staticFile("sfx/success.wav")} from={12.8 * fps} volume={0.8} />
      </Track>

      <Track name="Seslendirme">{/* voiceover goes here: <Audio name="Seslendirme" src={staticFile("voice/ses.mp3")} /> */}</Track>
    </>
  );
};
