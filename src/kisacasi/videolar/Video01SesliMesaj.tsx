import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { HEADLINE_FONT } from "../fonts";
import { Ifade, MAVI } from "../karakterler/animasyon";
import { NerminTeyze } from "../karakterler/NerminTeyze";
import { LogoBadge } from "../LogoBadge";
import { MesajEkrani, MesajOgesi, SesliMesajBalonu, sureYazisi, YuvarlakCerceve } from "../MesajEkrani";
import { PaperBackground } from "../PaperBackground";
import { ShortsCaptions } from "../ShortsCaptions";

// Video #1 v2 "Sesli mesaj 4:37" (script strategy/senaryolar/04-nermin-yeni.md), 1080x1920, 30 fps.
// Nermin Teyze sends a 4:37 voice message to ask something; all of it is "Alo, duyuyor musun?",
// and at the end she has forgotten the question. Timed to the real voiceover in
// public/voice/01-sesli-mesaj (leading silence already trimmed, so each <Audio> starts at its line).
//
// Scene starts (frame / s): 1 hook 0 / 0.0 · 2 "Alo?" 78 / 2.6 · 3 fast-forward 1:30 159 / 5.3 ·
// 4 fast-forward 3:10 246 / 8.2 · 5 fast-forward 4:30 336 / 11.2 · 6 4:37, punchline 420 / 14.0
// (punchline text 513 / 17.1) · 7 cover 564 / 18.8 · 8 new message 5:12 + loop 582 / 19.4 · end 672 / 22.4.
// The last frames zoom into the red play button; the first frames zoom out of it, so the Short loops.
//
// Layout (fixed): logo y 100-195 · screen text y 215-400 · Nermin's round frame y 410-800 ·
// captions y 818-910 · phone y 930-1530 (the voice bubble sits at y 1154-1352, input bar below 1390).

const N = "Nermin Teyze";

const TEL_X = 100;
const TEL_Y = 930;
const TEL_G = 840;
const TEL_H = 600;

/** The family group with the two voice messages. */
const Telefon: React.FC = () => {
  const mesajlar: MesajOgesi[] = [
    { tur: "metin", kim: "Selin", metin: "Teyzecim buradayım, sor", kare: -200 },
    {
      tur: "sesli",
      kim: N,
      sure: 277,
      kare: 0,
      oynatKaresi: 12,
      // elapsed time: 0:00 -> 0:09 (scene 1), real time, then three fast-forwards of 6 frames,
      // then slowly to the end 4:37 just as she says "unuttum"
      ilerleme: [
        { kare: 12, saniye: 0 },
        { kare: 78, saniye: 9 },
        { kare: 159, saniye: 11.6 },
        { kare: 165, saniye: 90 },
        { kare: 246, saniye: 92.6 },
        { kare: 252, saniye: 190 },
        { kare: 336, saniye: 192.6 },
        { kare: 342, saniye: 270 },
        { kare: 420, saniye: 271 },
        { kare: 512, saniye: 277 },
      ],
      sarmalar: [159, 246, 336],
    },
    // scene 8: she has remembered, a new and longer one
    { tur: "sesli", kim: N, sure: 312, kare: 585, oynatKaresi: 657, ilerleme: [{ kare: 657, saniye: 0 }, { kare: 672, saniye: 0.5 }] },
  ];

  return (
    <div style={{ position: "absolute", left: TEL_X, top: TEL_Y }}>
      <MesajEkrani
        grupAdi="Bizim Aile"
        uyeSayisi={14}
        mesajlar={mesajlar}
        genislik={TEL_G}
        yukseklik={TEL_H}
        kisiRenkleri={{ [N]: MAVI }}
        titresim={{ bas: 2, bit: 14 }}
      />
    </div>
  );
};

type Durum = { readonly ifade: Ifade };
const IFADELER: [number, Durum][] = [
  [0, { ifade: "mutlu" }],
  [2.6, { ifade: "saskin" }],
  [8.2, { ifade: "sinirli" }],
  [11.2, { ifade: "mutlu" }],
  [14.0, { ifade: "saskin" }],
  [19.4, { ifade: "mutlu" }],
];
// When her mouth moves: the spoken span of each of her lines (s), from zamanlama.json.
// The last span is scene 8: she is recording the next message.
const KONUSMA: [number, number][] = [
  [0.5, 2.32],
  [2.8, 4.58],
  [5.7, 7.74],
  [8.5, 10.42],
  [11.5, 13.42],
  [14.6, 17.07],
  [20.9, 22.4],
];

/** Nermin inside the voice message: round frame with a REC label. */
const NerminCercevesi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { ifade } = IFADELER.reduce((acc, [s, d]) => (t >= s ? d : acc), IFADELER[0][1]);
  const konusuyor = KONUSMA.some(([a, b]) => t >= a && t < b);
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const cap = 390;

  // scene 3: phone half-way to her glasses; scene 4: pressed against them; scene 5: back to her chin
  const yaklas = interpolate(t, [5.3, 5.6, 8.2, 8.4, 11.2, 11.5], [0, 0.5, 0.5, 1, 1, 0], k);
  // scene 3: two finger taps on the screen -> the frame hops twice
  const zipla =
    interpolate(t, [7.8, 7.87, 7.97], [1, 1.06, 1], k) * interpolate(t, [8.0, 8.07, 8.17], [1, 1.06, 1], k);
  // scene 4: she shouts, the frame shakes
  const sallaGuc = interpolate(t, [8.2, 8.5, 9.3, 11.2], [0, 12, 4, 0], k);
  const sx = Math.sin(frame * 2.9) * sallaGuc;
  const sy = Math.cos(frame * 3.7) * sallaGuc * 0.5;
  const kayitGorunur = t < 18.8 || t >= 19.4;
  const nokta = Math.floor(frame / 15) % 2 === 0;

  return (
    <div style={{ position: "absolute", left: 345, top: 410, scale: zipla, translate: `${sx}px ${sy}px` }}>
      <YuvarlakCerceve boyut={cap}>
        <div style={{ position: "absolute", left: -cap * 0.22, top: -cap * 0.1 }}>
          <NerminTeyze size={cap * 1.45} ifade={ifade} konusuyor={konusuyor} telefonuYaklastiriyor={yaklas} />
        </div>
      </YuvarlakCerceve>
      {kayitGorunur ? (
        <div
          style={{
            position: "absolute",
            left: -105,
            top: 150,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 18px 6px 12px",
            backgroundColor: "white",
            border: "5px solid #111111",
            borderRadius: 999,
            boxShadow: "0 5px 0 #111111",
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1,
            color: "#111111",
            rotate: "-6deg",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 24,
              backgroundColor: "#E51C0F",
              border: "4px solid #111111",
              opacity: nokta ? 1 : 0.25,
            }}
          />
          KAYIT
        </div>
      ) : null}
    </div>
  );
};

/* ---------- on-screen texts (each inside its own Sequence, so frames are scene-relative) ---------- */

const KancaYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Kanca yazısı"
      style={{
        position: "absolute",
        left: 110,
        top: 215,
        width: 830,
        boxSizing: "border-box",
        padding: "10px 16px 16px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "12px 14px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 66,
        lineHeight: 1.02,
        letterSpacing: -1,
        textAlign: "center",
        color: "#111111",
        rotate: "-3deg",
        scale: interpolate(frame, [3, 10], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 12 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [3, 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      TEYZEDEN SESLİ MESAJ:
      <br />
      <span style={{ fontSize: 104, color: "#E51C0F" }}>4:37</span>
    </Interactive.Div>
  );
};

const Sayac009: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Sayaç 0:09"
      style={{
        position: "absolute",
        left: 240,
        top: 240,
        width: 600,
        boxSizing: "border-box",
        padding: "4px 20px 12px",
        backgroundColor: "#FFFFFF",
        border: "8px solid #111111",
        borderRadius: 22,
        boxShadow: "10px 12px 0 #1E3FAE",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 100,
        lineHeight: 1,
        textAlign: "center",
        color: "#111111",
        rotate: "2deg",
        scale: interpolate(frame, [0, 7], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 11 }),
          output: "perceptual-scale",
        }),
      }}
    >
      0:09 / 4:37
    </Interactive.Div>
  );
};

const Sayac130: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Sayaç 1:30"
      style={{
        position: "absolute",
        left: 240,
        top: 240,
        width: 600,
        boxSizing: "border-box",
        padding: "4px 20px 12px",
        backgroundColor: "#FFFFFF",
        border: "8px solid #111111",
        borderRadius: 22,
        boxShadow: "10px 12px 0 #1E3FAE",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 100,
        lineHeight: 1,
        textAlign: "center",
        color: "#111111",
        rotate: "-2deg",
        scale: interpolate(frame, [0, 7], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 11 }),
          output: "perceptual-scale",
        }),
      }}
    >
      1:30 / 4:37
    </Interactive.Div>
  );
};

const Sayac310: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Sayaç 3:10"
      style={{
        position: "absolute",
        left: 240,
        top: 240,
        width: 600,
        boxSizing: "border-box",
        padding: "4px 20px 12px",
        backgroundColor: "#FFFFFF",
        border: "8px solid #111111",
        borderRadius: 22,
        boxShadow: "10px 12px 0 #E51C0F",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 100,
        lineHeight: 1,
        textAlign: "center",
        color: "#111111",
        rotate: "2deg",
        scale: interpolate(frame, [0, 7], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 11 }),
          output: "perceptual-scale",
        }),
      }}
    >
      3:10 / 4:37
    </Interactive.Div>
  );
};

const SoruGeliyor: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Soru geliyor"
      style={{
        position: "absolute",
        left: 110,
        top: 240,
        width: 830,
        boxSizing: "border-box",
        padding: "8px 20px 14px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 22,
        boxShadow: "10px 12px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 66,
        lineHeight: 1,
        letterSpacing: -1,
        textAlign: "center",
        color: "#111111",
        rotate: "-2deg",
        scale: interpolate(frame, [0, 7], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 11 }),
          output: "perceptual-scale",
        }),
      }}
    >
      4:30 · SORU GELİYOR…
    </Interactive.Div>
  );
};

/** Scene 6: the counter ticks slowly to the end. The time is computed per frame, so it is not editable text. */
const CanliSayac: React.FC = () => {
  const frame = useCurrentFrame();
  const saniye = interpolate(frame, [0, 92], [271, 277], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bitti = saniye >= 277;
  return (
    <Interactive.Div
      name="Canlı sayaç"
      style={{
        position: "absolute",
        left: 240,
        top: 240,
        width: 600,
        boxSizing: "border-box",
        padding: "4px 20px 12px",
        backgroundColor: "#FFFFFF",
        border: "8px solid #111111",
        borderRadius: 22,
        boxShadow: "10px 12px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 100,
        lineHeight: 1,
        textAlign: "center",
        color: "#111111",
        rotate: "0deg",
      }}
    >
      <span style={{ color: bitti ? "#E51C0F" : "#111111" }}>{sureYazisi(saniye)}</span> / 4:37
    </Interactive.Div>
  );
};

/** Scene 5: a yellow arrow points at the end of the waveform, "the question is coming". */
const SoruOku: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Soru oku"
      style={{
        position: "absolute",
        left: 800,
        top: 1050,
        width: 110,
        height: 140,
        translate: interpolate(frame, [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84], ["0px -60px", "0px 0px", "0px -14px", "0px 0px", "0px -14px", "0px 0px", "0px -14px", "0px 0px", "0px -14px", "0px 0px", "0px -14px", "0px 0px", "0px -14px", "0px 0px", "0px -14px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        opacity: interpolate(frame, [0, 4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <svg width={110} height={140} viewBox="0 0 110 140" style={{ display: "block", overflow: "visible" }}>
        <path
          d="M 33 6 L 77 6 L 77 70 L 104 70 L 55 134 L 6 70 L 33 70 Z"
          fill="#F7C600"
          stroke="#111111"
          strokeWidth={9}
          strokeLinejoin="round"
        />
      </svg>
    </Interactive.Div>
  );
};

/** Scenes 3-5: a big fast-forward sign flashes over the phone while the time jumps. */
const IleriSarIsareti: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="İleri sarma işareti"
      style={{
        position: "absolute",
        left: 600,
        top: 985,
        width: 300,
        height: 130,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111111",
        border: "7px solid #F7C600",
        borderRadius: 999,
        rotate: "-5deg",
        scale: interpolate(frame, [0, 4], [0.4, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 10 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0, 2, 11, 14], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <svg width={180} height={100} viewBox="0 0 180 100" style={{ display: "block", overflow: "visible" }}>
        <path d="M 8 8 L 88 50 L 8 92 Z" fill="#F7C600" stroke="#111111" strokeWidth={6} strokeLinejoin="round" />
        <path d="M 88 8 L 168 50 L 88 92 Z" fill="#F7C600" stroke="#111111" strokeWidth={6} strokeLinejoin="round" />
      </svg>
    </Interactive.Div>
  );
};

/** Scene 6: the punchline, big and held ~1.7 s. */
const PunchlineYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Punchline yazısı"
      style={{
        position: "absolute",
        left: 100,
        top: 770,
        width: 840,
        boxSizing: "border-box",
        padding: "16px 20px 24px",
        backgroundColor: "#F7C600",
        border: "10px solid #111111",
        borderRadius: 22,
        boxShadow: "16px 18px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 108,
        lineHeight: 1,
        letterSpacing: -2,
        textAlign: "center",
        color: "#111111",
        rotate: "-4deg",
        scale: interpolate(frame, [0, 6], [1.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 10 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0, 2], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      4 DAKİKA
      <br />
      37 SANİYE.
      <br />
      <span style={{ color: "#E51C0F" }}>SORU: YOK.</span>
    </Interactive.Div>
  );
};

const YeniMesajYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Yeni mesaj yazısı"
      style={{
        position: "absolute",
        left: 110,
        top: 215,
        width: 830,
        boxSizing: "border-box",
        padding: "10px 16px 16px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "12px 14px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 66,
        lineHeight: 1.02,
        letterSpacing: -1,
        textAlign: "center",
        color: "#111111",
        rotate: "3deg",
        scale: interpolate(frame, [3, 10], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 12 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [3, 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      YENİ SESLİ MESAJ:
      <br />
      <span style={{ fontSize: 104, color: "#E51C0F" }}>5:12</span>
    </Interactive.Div>
  );
};

/** Scene 7: the still cover frame (script §5). No captions: it sits above the caption layer. */
const KapakKaresi: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#E51C0F" }}>
      {/* cream paper grain on the brand red */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(243,235,221,0.22) 1.2px, transparent 1.7px)",
          backgroundSize: "9px 9px",
        }}
      />
      <div style={{ position: "absolute", left: 120, top: 520 }}>
        <NerminTeyze size={820} ifade="sinirli" konusuyor={false} telefonuYaklastiriyor={1} kirpmaGecikmesi={40} />
      </div>
      {/* torn cream paper over her waist */}
      <AbsoluteFill
        style={{
          backgroundColor: "#F3EBDD",
          clipPath:
            "polygon(0 62%, 12% 60.9%, 27% 62.3%, 44% 60.8%, 61% 62.2%, 78% 60.9%, 100% 62%, 100% 100%, 0 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 80, top: 1100 }}>
        <SesliMesajBalonu genislik={860} sure={277} saniye={277} oynuyor={false} />
      </div>
      <Interactive.Div
        name="Kapak süre"
        style={{
          position: "absolute",
          left: 80,
          top: 230,
          width: 860,
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 210,
          lineHeight: 1,
          letterSpacing: -4,
          color: "#FFFFFF",
          WebkitTextStroke: "18px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 14px 0 #111111",
          textAlign: "center",
        }}
      >
        4:37
      </Interactive.Div>
      <Interactive.Div
        name="Kapak başlığı"
        style={{
          position: "absolute",
          left: 80,
          top: 440,
          width: 860,
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 112,
          lineHeight: 1,
          letterSpacing: -2,
          color: "#FFFFFF",
          WebkitTextStroke: "14px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 10px 0 #111111",
          textAlign: "center",
        }}
      >
        SESLİ MESAJ
      </Interactive.Div>
      <Interactive.Div
        name="Kapak soru bloğu"
        style={{
          position: "absolute",
          left: 250,
          top: 1290,
          padding: "2px 40px 12px",
          backgroundColor: "#F7C600",
          border: "9px solid #111111",
          borderRadius: 20,
          boxShadow: "14px 16px 0 #111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 120,
          lineHeight: 1,
          letterSpacing: -3,
          color: "#111111",
          rotate: "-3deg",
        }}
      >
        0 SORU
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/** Loop: the red play button grows over the screen (end) and shrinks back into the button (start). */
const DonguSonu: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Döngü sonu: oynat düğmesi büyür"
      style={{
        position: "absolute",
        left: -1205,
        top: -232,
        width: 3000,
        height: 3000,
        borderRadius: 3000,
        backgroundColor: "#E51C0F",
        scale: interpolate(frame, [0, 12], [0.03, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.5, 0, 0.75, 0),
        }),
      }}
    />
  );
};

const DonguBasi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Döngü başı: oynat düğmesi küçülür"
      style={{
        position: "absolute",
        left: -1205,
        top: -232,
        width: 3000,
        height: 3000,
        borderRadius: 3000,
        backgroundColor: "#E51C0F",
        scale: interpolate(frame, [0, 7], [1, 0.03], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.25, 1, 0.5, 1),
        }),
        opacity: interpolate(frame, [5, 7], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

export const Video01SesliMesaj: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Sequence name="Kâğıt zemin" durationInFrames={durationInFrames}>
        <PaperBackground />
      </Sequence>

      <Sequence name="Telefon" durationInFrames={durationInFrames}>
        <Telefon />
      </Sequence>

      <Sequence name="Nermin çerçevesi" durationInFrames={durationInFrames}>
        <NerminCercevesi />
      </Sequence>

      <Track name="Ekran yazıları">
        <Sequence name="Kanca" durationInFrames={78}>
          <KancaYazisi />
        </Sequence>
        <Sequence name="Sayaç 0:09" from={78} durationInFrames={81}>
          <Sayac009 />
        </Sequence>
        <Sequence name="Sayaç 1:30" from={159} durationInFrames={87}>
          <Sayac130 />
        </Sequence>
        <Sequence name="Sayaç 3:10" from={246} durationInFrames={90}>
          <Sayac310 />
        </Sequence>
        <Sequence name="Soru geliyor" from={336} durationInFrames={84}>
          <SoruGeliyor />
        </Sequence>
        <Sequence name="Canlı sayaç" from={420} durationInFrames={144}>
          <CanliSayac />
        </Sequence>
        <Sequence name="Yeni sesli mesaj" from={582} durationInFrames={90}>
          <YeniMesajYazisi />
        </Sequence>
      </Track>

      <Track name="İleri sarma">
        <Sequence name="İleri sar 1:30" from={159} durationInFrames={14}>
          <IleriSarIsareti />
        </Sequence>
        <Sequence name="İleri sar 3:10" from={246} durationInFrames={14}>
          <IleriSarIsareti />
        </Sequence>
        <Sequence name="İleri sar 4:30" from={336} durationInFrames={14}>
          <IleriSarIsareti />
        </Sequence>
      </Track>

      <Sequence name="Soru oku" from={336} durationInFrames={84}>
        <SoruOku />
      </Sequence>

      <ShortsCaptions
        name="Altyazı"
        durationInFrames={durationInFrames}
        beklemeMs={500}
        birlestirmeMs={1500}
        style={{ position: "absolute", top: 818, left: 90, width: 900, fontSize: 76 }}
        captions={[
          { text: "Kızım,", startMs: 500, endMs: 956, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " bir", startMs: 956, endMs: 1260, timestampMs: null, confidence: null },
          { text: " şey", startMs: 1260, endMs: 1564, timestampMs: null, confidence: null },
          { text: " soracağım.", startMs: 1564, endMs: 2324, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Alo?", startMs: 2800, endMs: 3195, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Duyuyor", startMs: 3195, endMs: 3984, timestampMs: null, confidence: null },
          { text: " musun?", startMs: 3984, endMs: 4576, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Alo?", startMs: 5700, endMs: 6089, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bu", startMs: 6089, endMs: 6380, timestampMs: null, confidence: null },
          { text: " kaydediyor", startMs: 6380, endMs: 7449, timestampMs: null, confidence: null },
          { text: " mu?", startMs: 7449, endMs: 7740, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Kızım!", startMs: 8500, endMs: 9076, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Duyuyor", startMs: 9076, endMs: 9844, timestampMs: null, confidence: null },
          { text: " musun?", startMs: 9844, endMs: 10420, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Hah,", startMs: 11500, endMs: 11795, timestampMs: null, confidence: null },
          { text: " tamam.", startMs: 11795, endMs: 12238, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Şimdi", startMs: 12238, endMs: 12682, timestampMs: null, confidence: null },
          { text: " soruyorum.", startMs: 12682, endMs: 13420, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Ne", startMs: 14600, endMs: 14832, timestampMs: null, confidence: null },
          { text: " soracaktım", startMs: 14832, endMs: 15682, timestampMs: null, confidence: null },
          { text: " ben?", startMs: 15682, endMs: 15991, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Neyse,", startMs: 15991, endMs: 16454, timestampMs: null, confidence: null },
          { text: " unuttum.", startMs: 16454, endMs: 17072, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Hatırladı.", startMs: 20000, endMs: 20840, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />

      <Sequence name="Punchline" from={513} durationInFrames={51}>
        <PunchlineYazisi />
      </Sequence>

      <Sequence name="Kapak karesi" from={564} durationInFrames={18}>
        <KapakKaresi />
      </Sequence>

      <Track name="Döngü">
        <Sequence name="Döngü başı" durationInFrames={8}>
          <DonguBasi />
        </Sequence>
        <Sequence name="Döngü sonu" from={658} durationInFrames={14}>
          <DonguSonu />
        </Sequence>
      </Track>

      <LogoBadge name="Logo" durationInFrames={durationInFrames} style={{ position: "absolute", top: 100, left: 80 }} />

      {/* The voice files have no leading silence: each starts on its line's first word. */}
      <Track name="Seslendirme">
        <Audio name="01 Nermin: Bir şey soracağım" src={staticFile("voice/01-sesli-mesaj/01-nermin-teyze.mp3")} volume={0.9} from={15} />
        <Audio name="02 Nermin: Alo? Duyuyor musun?" src={staticFile("voice/01-sesli-mesaj/02-nermin-teyze.mp3")} volume={0.9} from={84} />
        <Audio name="03 Nermin: Bu kaydediyor mu?" src={staticFile("voice/01-sesli-mesaj/03-nermin-teyze.mp3")} volume={0.9} from={171} />
        <Audio name="04 Nermin: Kızım! Duyuyor musun?" src={staticFile("voice/01-sesli-mesaj/04-nermin-teyze.mp3")} volume={0.9} from={255} />
        <Audio name="05 Nermin: Şimdi soruyorum" src={staticFile("voice/01-sesli-mesaj/05-nermin-teyze.mp3")} volume={0.9} from={345} />
        <Audio name="06 Nermin: Neyse, unuttum" src={staticFile("voice/01-sesli-mesaj/06-nermin-teyze.mp3")} volume={0.9} from={438} />
        <Audio name="07 Anlatıcı: Hatırladı" src={staticFile("voice/01-sesli-mesaj/07-anlatici.mp3")} volume={0.9} from={600} />
      </Track>

      <Track name="Ses efektleri">
        {/* scene 1: the voice message lands, the phone buzzes, play is pressed */}
        <Audio name="Bildirim" src={staticFile("sfx/bildirim.wav")} volume={0.4} />
        <Audio name="Titreşim" src={staticFile("sfx/hit.mp3")} from={3} durationInFrames={24} volume={0.3} />
        <Audio name="Oynat tık" src={staticFile("sfx/tik.wav")} from={12} volume={0.5} />
        {/* scene 2: awkward silence */}
        <Audio
          name="Cırcır 1"
          src={staticFile("sfx/circir.wav")}
          from={138}
          durationInFrames={24}
          volume={(f) =>
            interpolate(f, [0, 4, 18, 24], [0, 0.5, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }
        />
        {/* scene 3 */}
        <Audio name="Hızlı sar 1" src={staticFile("sfx/hizli-sar.wav")} from={159} volume={0.5} />
        <Audio name="Parmak tık 1" src={staticFile("sfx/tik.wav")} from={234} volume={0.45} />
        <Audio name="Parmak tık 2" src={staticFile("sfx/tik.wav")} from={240} volume={0.45} />
        {/* scene 4 */}
        <Audio name="Hızlı sar 2" src={staticFile("sfx/hizli-sar.wav")} from={246} volume={0.5} />
        <Audio name="Bağırış vuruşu" src={staticFile("sfx/hit.mp3")} from={255} durationInFrames={30} volume={0.4} />
        {/* scene 5: the question is coming */}
        <Audio name="Hızlı sar 3" src={staticFile("sfx/hizli-sar.wav")} from={336} volume={0.5} />
        <Audio name="Gerilim" src={staticFile("sfx/riser.mp3")} from={372} trimBefore={13} durationInFrames={48} volume={0.35} />
        {/* scene 6: half a second of silence, then the punchline lands */}
        <Audio
          name="Cırcır 2"
          src={staticFile("sfx/circir.wav")}
          from={420}
          durationInFrames={18}
          volume={(f) =>
            interpolate(f, [0, 3, 13, 18], [0, 0.45, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }
        />
        <Audio name="Punchline vuruşu" src={staticFile("sfx/hit.mp3")} from={513} durationInFrames={45} volume={0.55} />
        {/* scene 7: cover frame */}
        <Audio name="Kapak" src={staticFile("sfx/logo-hit.wav")} from={564} volume={0.5} />
        {/* scene 8: a new voice message, play -> loop */}
        <Audio name="Yeni bildirim" src={staticFile("sfx/bildirim.wav")} from={585} volume={0.4} />
        <Audio name="Oynat tık (döngü)" src={staticFile("sfx/tik.wav")} from={657} volume={0.5} />
        <Audio name="Döngü" src={staticFile("sfx/soft-whoosh.wav")} from={659} volume={0.35} />
      </Track>
    </>
  );
};
