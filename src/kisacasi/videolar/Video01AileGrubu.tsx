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
import { BODY_FONT, HEADLINE_FONT } from "../fonts";
import { Ifade, MAVI } from "../karakterler/animasyon";
import { NerminTeyze } from "../karakterler/NerminTeyze";
import { LogoBadge } from "../LogoBadge";
import {
  BildirimYigini,
  GrupMenusu,
  GunaydinGorseli,
  MesajEkrani,
  MesajOgesi,
  YuvarlakCerceve,
} from "../MesajEkrani";
import { PaperBackground } from "../PaperBackground";
import { ShortsCaptions } from "../ShortsCaptions";

// Video #1 "Aile grubu, sabah 06.12" (script strategy/senaryolar/03-gunaydin-cicekleri.md), 1080x1920, 30 fps.
// Same layout as the animatic (MesajEkraniOnizleme), re-timed to the real voiceover
// (public/voice/01-aile-grubu). Each voice file starts with 0.1-0.7 s of silence, so it is trimmed
// to start ~0.06 s before the first word and the scenes follow the spoken length.
//
// Scene starts (s): 1 lock screen 0 · 2 clock 1.8 · 3 pictures 3.9 · 4 seen 7.1 · 5 complaint 10.4 ·
// 6 typing 12.4 · 7 menu 15.1 · 8 she left 17.5 · 9 burst 19.3 · 10 where did I go 21.3 ·
// 11 cover 23.4 · 12 added back 24.2 · 13 rose + loop 26.1 · end 28.3 (849 frames).
// The last frames (a giant rose) are the first frames again, so the Short loops seamlessly.

const N = "Nermin Teyze";

// Phone on the left, Nermin's round frame top right, captions under the phone (y 1255-1430).
const TEL_X = 80;
const TEL_Y = 330;
const TEL_G = 820;
const TEL_H = 900;

const PATLAMA: [string, string][] = [
  ["Selin", "Günaydın teyzeciğim!"],
  ["Enişte", "Hayırlı sabahlar teyzem!"],
  ["Kuzen Mert", "Gül çok güzelmiş!"],
  ["Halil Dayı", "Kediye bayıldım!"],
  ["Selin", "Teyzem nereye gitti?"],
  ["Ayşe Yenge", "Günaydın canım teyzem"],
  ["Kuzen Mert", "Simli çay efsane"],
  ["Enişte", "Teyze?"],
  ["Halil Dayı", "Nermin cevap ver"],
  ["Ayşe Yenge", "Biri teyzeyi eklesin!"],
  ["Selin", "Ekliyorum ekliyorum"],
  ["Kuzen Mert", "Teyzeee"],
];

// 12 messages after half a second of silence (19.8 s to 21.13 s), speeding up.
// The "bildirim" pings on the sfx track use the same frames.
const PATLAMA_KARELERI = [594, 601, 606, 610, 614, 617, 620, 623, 626, 629, 631, 634];

/** The phone: lock screen with the notification pile, then the family group chat. */
const Telefon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = (s: number) => Math.round(s * fps);

  const bildirimler = Array.from({ length: 14 }, (_, i) => ({
    baslik: N,
    metin: "Hayırlı sabahlar",
    kare: 3 + Math.round(i * 2.4),
  }));

  const mesajlar: MesajOgesi[] = [
    { tur: "metin", kim: "Kuzen Mert", metin: "Akşam maçı kim izliyor?", kare: -300 },
    { tur: "metin", kim: "Selin", metin: "Ben yokum, sınav var", kare: -200 },
    // scene 3: each picture lands on "Gül", "Kedi", "Simli"
    { tur: "gorsel", kim: N, gorsel: "gul", yazi: "Günaydın", kare: k(4.0) },
    { tur: "gorsel", kim: N, gorsel: "cayKedi", yazi: "Mutlu Sabahlar", kare: k(4.9) },
    { tur: "gorsel", kim: N, gorsel: "simliCay", yazi: "Güzel Bir Gün Dilerim", kare: k(5.8) },
    // scene 4-5: seen by 12, nobody writes
    { tur: "goruldu", sayi: 12, kare: k(7.1), bitis: k(12.4), vurgula: true },
    // scene 6: "Yazıyor… yazıyor… sustu." – the typing line follows her words
    { tur: "yaziyor", kim: "Selin", kare: k(12.4), bitis: k(13.05) },
    { tur: "yaziyor", kim: "Selin", kare: k(13.25), bitis: k(13.9) },
    // scene 8
    { tur: "sistem", metin: "Nermin Teyze gruptan ayrıldı", kare: k(17.55) },
    // scene 9
    ...PATLAMA.map(([kim, metin], i): MesajOgesi => ({ tur: "metin", kim, metin, kare: PATLAMA_KARELERI[i] })),
    // scene 12-13
    { tur: "sistem", metin: "Selin, Nermin Teyze'yi ekledi", kare: k(24.25) },
    { tur: "gorsel", kim: N, gorsel: "gul", yazi: "Günaydın", kare: k(26.6) },
  ];

  const kilitte = frame < k(1.8);
  const grupAcilis = interpolate(frame, [k(1.8), k(1.8) + 8], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <>
      <div style={{ position: "absolute", left: TEL_X, top: TEL_Y, scale: kilitte ? 1 : grupAcilis }}>
        {kilitte ? (
          <BildirimYigini
            saat="06.12"
            tarih="Pazartesi"
            bildirimler={bildirimler}
            genislik={TEL_G}
            yukseklik={TEL_H}
            titresim={{ bas: 3, bit: 40 }}
          />
        ) : (
          <MesajEkrani
            grupAdi="Bizim Aile"
            uyeSayisi={14}
            mesajlar={mesajlar}
            genislik={TEL_G}
            yukseklik={TEL_H}
            kisiRenkleri={{ [N]: MAVI }}
            titresim={{ bas: PATLAMA_KARELERI[0], bit: k(21.2) }}
          />
        )}
      </div>

      {/* scene 7: the group menu slides up inside the phone screen */}
      {frame >= k(15.1) && frame < k(17.8) ? (
        <div
          style={{
            position: "absolute",
            left: TEL_X + 22,
            top: TEL_Y + TEL_H - 22 - 470,
            width: TEL_G - 44,
            height: 470,
            overflow: "hidden",
            borderRadius: "0 0 66px 66px",
          }}
        >
          <div style={{ position: "absolute", bottom: 0 }}>
            <GrupMenusu kare={k(15.1)} basma={k(17.0)} genislik={TEL_G - 44} />
          </div>
        </div>
      ) : null}
    </>
  );
};

type Durum = { readonly ifade: Ifade };
const IFADELER: [number, Durum][] = [
  [0, { ifade: "mutlu" }],
  [7.1, { ifade: "uzgun" }],
  [10.4, { ifade: "sinirli" }],
  [21.3, { ifade: "saskin" }],
  [24.2, { ifade: "mutlu" }],
];
// When her mouth moves: the spoken span of each of her lines (s), from the voice files.
const KONUSMA: [number, number][] = [
  [0.07, 1.14],
  [3.96, 6.66],
  [7.16, 9.81],
  [10.47, 11.98],
  [12.46, 14.74],
  [15.18, 16.93],
  [21.37, 23.05],
  [26.19, 27.77],
];

/** Nermin's round "video call" frame: top right, grows in scenes 5-6, goes dark while she is out. */
const NerminCercevesi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { ifade } = IFADELER.reduce((acc, [s, d]) => (t >= s ? d : acc), IFADELER[0][1]);
  const konusuyor = KONUSMA.some(([a, b]) => t >= a && t < b);
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  // scenes 5-6: the frame grows to half the screen, phone pressed to her glasses
  const buyu = interpolate(t, [10.4, 10.8, 14.8, 15.1], [0, 1, 1, 0], { ...k, easing: Easing.bezier(0.34, 1.3, 0.64, 1) });
  // grown: x 230-830, y 400-1000, so the "Selin yazıyor…" line under it stays visible
  const cap = interpolate(buyu, [0, 1], [290, 600]);
  const cx = interpolate(buyu, [0, 1], [620, 230]);
  const cy = interpolate(buyu, [0, 1], [70, 400]);
  // scene 8: she leaves, the frame goes dark; scene 10: it comes back
  const karartma = interpolate(t, [17.5, 17.7, 21.3, 21.5], [0, 1, 1, 0], k);
  // scene 12: a little bounce when she is added back
  const zipla = interpolate(t, [24.2, 24.35, 24.55], [1, 1.08, 1], k);

  return (
    <div style={{ position: "absolute", left: cx, top: cy, scale: zipla }}>
      <YuvarlakCerceve boyut={cap} karartma={karartma}>
        <div style={{ position: "absolute", left: -cap * 0.22, top: -cap * 0.1 }}>
          <NerminTeyze size={cap * 1.45} ifade={ifade} konusuyor={konusuyor} telefonuYaklastiriyor={buyu} />
        </div>
      </YuvarlakCerceve>
    </div>
  );
};

/* ---------- on-screen texts (each inside its own Sequence, so frames are scene-relative) ---------- */

const KancaYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="Kanca yazısı"
      style={{
        position: "absolute",
        left: 100,
        top: 880,
        width: 840,
        boxSizing: "border-box",
        padding: "14px 16px 18px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "12px 14px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 1.02,
        letterSpacing: -1,
        textAlign: "center",
        color: "#111111",
        rotate: "-4deg",
        scale: interpolate(frame, [0.1 * fps, 0.35 * fps], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 12 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0.1 * fps, 0.15 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      SAAT 06.12.
      <br />
      AİLE GRUBU UYANDI.
    </Interactive.Div>
  );
};

const SaatEtiketi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="Büyük saat"
      style={{
        position: "absolute",
        left: 560,
        top: 860,
        padding: "6px 30px 14px",
        backgroundColor: "#FFFFFF",
        border: "8px solid #111111",
        borderRadius: 26,
        boxShadow: "10px 12px 0 #E51C0F",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 128,
        lineHeight: 1,
        color: "#111111",
        rotate: "5deg",
        scale: interpolate(frame, [0.1 * fps, 0.35 * fps], [0.4, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 11 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0.1 * fps, 0.15 * fps, 1.85 * fps, 2 * fps], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      06.12
    </Interactive.Div>
  );
};

/** Scene 7: a big round thumb comes in and presses the red button. */
const Basparmak: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="Başparmak"
      style={{
        position: "absolute",
        left: 690,
        top: 1000,
        width: 152,
        height: 240,
        translate: interpolate(frame, [0, 0.35 * fps, 0.4 * fps, 0.5 * fps], ["260px 420px", "0px 0px", "0px 14px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.2, 0.9, 0.3, 1),
        }),
        rotate: "-18deg",
      }}
    >
      <svg width={152} height={240} viewBox="0 0 190 300" style={{ display: "block", overflow: "visible" }}>
        <path
          d="M 22 300 L 22 110 Q 22 14 95 14 Q 168 14 168 110 L 168 300 Z"
          fill="#F6C29A"
          stroke="#111111"
          strokeWidth={9}
          strokeLinejoin="round"
        />
        <path d="M 58 92 Q 58 46 95 46 Q 132 46 132 92 L 132 118 Q 95 132 58 118 Z" fill="#FFE3D2" stroke="#111111" strokeWidth={6} />
        <path d="M 46 196 Q 95 214 144 196" stroke="#E59F76" strokeWidth={7} strokeLinecap="round" fill="none" />
      </svg>
    </Interactive.Div>
  );
};

/** Scene 10: what Nermin sees on her own phone. */
const YazamazEtiketi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="Nermin'in ekranı"
      style={{
        position: "absolute",
        left: 500,
        top: 372,
        width: 420,
        boxSizing: "border-box",
        padding: "16px 20px",
        backgroundColor: "#E3DACB",
        border: "7px solid #111111",
        borderRadius: 24,
        boxShadow: "8px 10px 0 #1E3FAE",
        fontFamily: BODY_FONT,
        fontWeight: 700,
        fontSize: 38,
        lineHeight: 1.15,
        textAlign: "center",
        color: "#3D3631",
        rotate: "-2deg",
        scale: interpolate(frame, [0.15 * fps, 0.4 * fps], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 13 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0.15 * fps, 0.2 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      Bu gruba mesaj gönderemezsiniz.
    </Interactive.Div>
  );
};

const ImzaYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="İmza yazısı"
      style={{
        position: "absolute",
        left: 110,
        top: 520,
        width: 820,
        boxSizing: "border-box",
        padding: "16px 26px 20px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "12px 14px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 76,
        lineHeight: 1.02,
        letterSpacing: -1,
        textAlign: "center",
        color: "#E51C0F",
        rotate: "3deg",
        scale: interpolate(frame, [0.05 * fps, 0.3 * fps], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 12 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0.05 * fps, 0.1 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      GRUBA ATIYORUM,
      <br />
      HERKES GÖRSÜN!
    </Interactive.Div>
  );
};

/** Scene 11: the still cover frame (script §5). No captions: it sits above the caption layer. */
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
      <div style={{ position: "absolute", left: 40, top: 540 }}>
        <NerminTeyze size={1000} ifade="sinirli" konusuyor={false} telefonuYaklastiriyor={1} kirpmaGecikmesi={40} />
      </div>
      {/* torn cream paper over her waist */}
      <AbsoluteFill
        style={{
          backgroundColor: "#F3EBDD",
          clipPath:
            "polygon(0 79%, 12% 77.9%, 27% 79.3%, 44% 77.8%, 61% 79.2%, 78% 77.9%, 100% 79%, 100% 100%, 0 100%)",
        }}
      />
      <Interactive.Div
        name="Kapak göz simgesi"
        style={{
          position: "absolute",
          left: 770,
          top: 640,
          width: 170,
          height: 170,
          borderRadius: 170,
          backgroundColor: "#FFFFFF",
          border: "8px solid #111111",
          boxShadow: "8px 10px 0 #1E3FAE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <svg width={120} height={74} viewBox="0 0 100 62">
          <path d="M 6 31 Q 50 -14 94 31 Q 50 76 6 31 Z" fill="white" stroke="#111111" strokeWidth={8} strokeLinejoin="round" />
          <circle cx={50} cy={31} r={15} fill="#1E3FAE" stroke="#111111" strokeWidth={6} />
          <circle cx={55} cy={26} r={4} fill="white" />
        </svg>
      </Interactive.Div>
      <Interactive.Div
        name="Kapak başlığı"
        style={{
          position: "absolute",
          left: 80,
          top: 250,
          width: 860,
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 1,
          letterSpacing: -3,
          color: "#FFFFFF",
          WebkitTextStroke: "16px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 12px 0 #111111",
          textAlign: "center",
        }}
      >
        GÖRÜLDÜ:
      </Interactive.Div>
      <Interactive.Div
        name="Kapak sayı bloğu"
        style={{
          position: "absolute",
          left: 190,
          top: 420,
          padding: "4px 40px 14px",
          backgroundColor: "#F7C600",
          border: "9px solid #111111",
          borderRadius: 20,
          boxShadow: "14px 16px 0 #111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 1,
          letterSpacing: -3,
          color: "#111111",
          rotate: "-3deg",
        }}
      >
        12 KİŞİ
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/** Loop: a giant rose that covers the screen (end) and shrinks into the notification pile (start). */
const GulPerdesiSonu: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Dev gül (son)"
      style={{
        position: "absolute",
        left: -460,
        top: -40,
        width: 2000,
        height: 2000,
        transformOrigin: "43% 44%",
        scale: interpolate(frame, [0, 17], [0.12, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.5, 0, 0.75, 0),
        }),
      }}
    >
      <GunaydinGorseli tur="gul" boyut={2000} />
    </Interactive.Div>
  );
};

const GulPerdesiBasi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Dev gül (baş)"
      style={{
        position: "absolute",
        left: -460,
        top: -40,
        width: 2000,
        height: 2000,
        transformOrigin: "38% 40%",
        scale: interpolate(frame, [0, 8], [1, 0.1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.25, 1, 0.5, 1),
        }),
        opacity: interpolate(frame, [4, 8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <GunaydinGorseli tur="gul" boyut={2000} />
    </Interactive.Div>
  );
};

export const Video01AileGrubu: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <>
      <Sequence name="Kâğıt zemin" durationInFrames={durationInFrames}>
        <PaperBackground />
      </Sequence>

      <Sequence name="Telefon" durationInFrames={durationInFrames}>
        <Telefon />
      </Sequence>

      <Track name="Ekran yazıları">
        <Sequence name="Kanca" durationInFrames={1.8 * fps}>
          <KancaYazisi />
        </Sequence>
        <Sequence name="Saat 06.12" from={1.8 * fps} durationInFrames={2.1 * fps}>
          <SaatEtiketi />
        </Sequence>
        <Sequence name="Başparmak basar" from={16.6 * fps} durationInFrames={0.9 * fps}>
          <Basparmak />
        </Sequence>
        <Sequence name="Gönderemezsiniz" from={21.3 * fps} durationInFrames={2.1 * fps}>
          <YazamazEtiketi />
        </Sequence>
        <Sequence name="İmza" from={26.1 * fps} durationInFrames={1.7 * fps}>
          <ImzaYazisi />
        </Sequence>
      </Track>

      <Sequence name="Nermin çerçevesi" durationInFrames={durationInFrames}>
        <NerminCercevesi />
      </Sequence>

      <ShortsCaptions
        name="Altyazı"
        durationInFrames={durationInFrames}
        beklemeMs={800}
        style={{ position: "absolute", top: 1255, left: 90, width: 850, fontSize: 78 }}
        captions={[
          { text: "Hayırlı", startMs: 73, endMs: 445, timestampMs: null, confidence: null },
          { text: " sabahlar", startMs: 445, endMs: 864, timestampMs: null, confidence: null },
          { text: " ailem!", startMs: 864, endMs: 1143, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Saat,", startMs: 1867, endMs: 2164, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " altıyı", startMs: 2164, endMs: 2582, timestampMs: null, confidence: null },
          { text: " on", startMs: 2582, endMs: 2761, timestampMs: null, confidence: null },
          { text: " iki", startMs: 2761, endMs: 3000, timestampMs: null, confidence: null },
          { text: " geçiyor.", startMs: 3000, endMs: 3477, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Gül", startMs: 3963, endMs: 4253, timestampMs: null, confidence: null },
          { text: " attım.", startMs: 4373, endMs: 4543, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Kedi", startMs: 4853, endMs: 5183, timestampMs: null, confidence: null },
          { text: " attım.", startMs: 5313, endMs: 5473, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Simli", startMs: 5813, endMs: 6168, timestampMs: null, confidence: null },
          { text: " çay", startMs: 6168, endMs: 6403, timestampMs: null, confidence: null },
          { text: " attım.", startMs: 6523, endMs: 6663, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " On", startMs: 7160, endMs: 7360, timestampMs: null, confidence: null },
          { text: " iki", startMs: 7470, endMs: 7705, timestampMs: null, confidence: null },
          { text: " kişi", startMs: 7705, endMs: 7999, timestampMs: null, confidence: null },
          { text: " görmüş.", startMs: 7999, endMs: 8410, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Kimse", startMs: 9010, endMs: 9330, timestampMs: null, confidence: null },
          { text: " yazmamış.", startMs: 9330, endMs: 9810, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Görüyorsunuz", startMs: 10467, endMs: 11100, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " ama", startMs: 11100, endMs: 11295, timestampMs: null, confidence: null },
          { text: " yazmıyorsunuz!", startMs: 11295, endMs: 11977, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Yazıyor…", startMs: 12460, endMs: 12960, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " yazıyor…", startMs: 13280, endMs: 13720, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " sustu.", startMs: 14300, endMs: 14740, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Tamam!", startMs: 15183, endMs: 15483, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Hepinizi", startMs: 15483, endMs: 15934, timestampMs: null, confidence: null },
          { text: " gruptan", startMs: 15934, endMs: 16333, timestampMs: null, confidence: null },
          { text: " çıkarıyorum!", startMs: 16333, endMs: 16933, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Nermin", startMs: 17573, endMs: 17972, timestampMs: null, confidence: null },
          { text: " gruptan", startMs: 17972, endMs: 18428, timestampMs: null, confidence: null },
          { text: " ayrıldı.", startMs: 18428, endMs: 18883, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Aaa.", startMs: 21367, endMs: 21997, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Ben", startMs: 22257, endMs: 22438, timestampMs: null, confidence: null },
          { text: " nereye", startMs: 22438, endMs: 22757, timestampMs: null, confidence: null },
          { text: " gittim?", startMs: 22897, endMs: 23047, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Selin,", startMs: 24290, endMs: 24710, timestampMs: null, confidence: null },
          { text: " Nermin'i", startMs: 24870, endMs: 25337, timestampMs: null, confidence: null },
          { text: " ekledi.", startMs: 25337, endMs: 25700, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Gruba", startMs: 26187, endMs: 26514, timestampMs: null, confidence: null },
          { text: " atıyorum,", startMs: 26514, endMs: 27004, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " herkes", startMs: 27004, endMs: 27385, timestampMs: null, confidence: null },
          { text: " görsün!", startMs: 27385, endMs: 27767, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />

      <Sequence name="Kapak karesi" from={23.4 * fps} durationInFrames={0.8 * fps}>
        <KapakKaresi />
      </Sequence>

      <Track name="Döngü">
        <Sequence name="Döngü başı: gül küçülür" durationInFrames={0.3 * fps}>
          <GulPerdesiBasi />
        </Sequence>
        <Sequence name="Döngü sonu: gül ekranı kaplar" from={27.7 * fps} durationInFrames={0.6 * fps}>
          <GulPerdesiSonu />
        </Sequence>
      </Track>

      <LogoBadge
        name="Logo"
        durationInFrames={durationInFrames}
        style={{ position: "absolute", top: 100, left: 80 }}
      />

      {/* Each voice file is trimmed to ~0.06 s before its first word (trimBefore, in frames). */}
      <Track name="Seslendirme">
        <Audio name="01 Nermin: Hayırlı sabahlar" src={staticFile("voice/01-aile-grubu/01-nermin-teyze.mp3")} volume={0.9} trimBefore={17} />
        <Audio name="02 Anlatıcı: Saat" src={staticFile("voice/01-aile-grubu/02-anlatici.mp3")} volume={0.9} from={1.8 * fps} trimBefore={4} />
        <Audio name="03 Nermin: Gül attım" src={staticFile("voice/01-aile-grubu/03-nermin-teyze.mp3")} volume={0.9} from={3.9 * fps} trimBefore={11} />
        <Audio name="04 Nermin: On iki kişi" src={staticFile("voice/01-aile-grubu/04-nermin-teyze.mp3")} volume={0.9} from={7.1 * fps} trimBefore={12} />
        <Audio name="05 Nermin: Görüyorsunuz" src={staticFile("voice/01-aile-grubu/05-nermin-teyze.mp3")} volume={0.9} from={10.4 * fps} trimBefore={19} />
        <Audio name="06 Nermin: Yazıyor" src={staticFile("voice/01-aile-grubu/06-nermin-teyze.mp3")} volume={0.9} from={12.4 * fps} trimBefore={9} />
        <Audio name="07 Nermin: Tamam!" src={staticFile("voice/01-aile-grubu/07-nermin-teyze.mp3")} volume={0.9} from={15.1 * fps} trimBefore={17} />
        <Audio name="08 Anlatıcı: Ayrıldı" src={staticFile("voice/01-aile-grubu/08-anlatici.mp3")} volume={0.9} from={17.5 * fps} trimBefore={5} />
        <Audio name="09 Nermin: Nereye gittim" src={staticFile("voice/01-aile-grubu/09-nermin-teyze.mp3")} volume={0.9} from={21.3 * fps} trimBefore={10} />
        <Audio name="10 Anlatıcı: Ekledi" src={staticFile("voice/01-aile-grubu/10-anlatici.mp3")} volume={0.9} from={24.2 * fps} />
        <Audio name="11 Nermin: Gruba atıyorum" src={staticFile("voice/01-aile-grubu/11-nermin-teyze.mp3")} volume={0.9} from={26.1 * fps} trimBefore={7} />
      </Track>

      <Track name="Ses efektleri">
        {/* scene 1: notifications pile up, the phone buzzes */}
        <Audio name="Bildirim 1" src={staticFile("sfx/bildirim.wav")} from={0.1 * fps} volume={0.22} />
        <Audio name="Bildirim 2" src={staticFile("sfx/bildirim.wav")} from={0.3 * fps} volume={0.2} />
        <Audio name="Bildirim 3" src={staticFile("sfx/bildirim.wav")} from={0.5 * fps} volume={0.2} />
        <Audio name="Bildirim 4" src={staticFile("sfx/bildirim.wav")} from={0.7 * fps} volume={0.2} />
        <Audio name="Bildirim 5" src={staticFile("sfx/bildirim.wav")} from={0.9 * fps} volume={0.2} />
        <Audio name="Bildirim 6" src={staticFile("sfx/bildirim.wav")} from={1.1 * fps} volume={0.2} />
        <Audio name="Titreşim" src={staticFile("sfx/hit.mp3")} from={0.1 * fps} durationInFrames={1 * fps} volume={0.35} />
        {/* scene 2 */}
        <Audio name="Grup açılır" src={staticFile("sfx/soft-whoosh.wav")} from={1.8 * fps} volume={0.45} />
        {/* scene 3 */}
        <Audio name="Gül" src={staticFile("sfx/pop.mp3")} from={4 * fps} volume={0.5} />
        <Audio name="Kedi" src={staticFile("sfx/pop.mp3")} from={4.9 * fps} volume={0.5} />
        <Audio name="Simli çay" src={staticFile("sfx/pop.mp3")} from={5.8 * fps} volume={0.5} />
        {/* scene 4: awkward silence */}
        <Audio
          name="Cırcır"
          src={staticFile("sfx/circir.wav")}
          from={8.4 * fps}
          durationInFrames={2 * fps}
          volume={(f) =>
            interpolate(f, [0, 0.2 * fps, 1.6 * fps, 2 * fps], [0, 0.6, 0.6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        {/* scene 5 */}
        <Audio name="Zoom vuruş" src={staticFile("sfx/hit.mp3")} from={10.4 * fps} durationInFrames={1 * fps} volume={0.45} />
        {/* scene 6 */}
        <Audio name="Yazıyor 1" src={staticFile("sfx/soft-whoosh.wav")} from={12.4 * fps} volume={0.3} />
        <Audio name="Yazıyor 2" src={staticFile("sfx/soft-whoosh.wav")} from={13.3 * fps} volume={0.3} />
        {/* scene 7: tension, then the thumb presses */}
        <Audio name="Gerilim" src={staticFile("sfx/riser.mp3")} from={15.1 * fps} trimBefore={4} volume={0.35} />
        <Audio name="Basış" src={staticFile("sfx/hit.mp3")} from={17 * fps} durationInFrames={1 * fps} volume={0.55} />
        {/* scene 8 */}
        <Audio name="Ayrıldı" src={staticFile("sfx/pop.mp3")} from={17.6 * fps} volume={0.5} />
        {/* scene 9: the burst, pings speeding up (same frames as the messages) */}
        <Audio name="Patlama 1" src={staticFile("sfx/bildirim.wav")} from={594} volume={0.18} />
        <Audio name="Patlama 2" src={staticFile("sfx/bildirim.wav")} from={601} volume={0.18} />
        <Audio name="Patlama 3" src={staticFile("sfx/bildirim.wav")} from={606} volume={0.18} />
        <Audio name="Patlama 4" src={staticFile("sfx/bildirim.wav")} from={610} volume={0.18} />
        <Audio name="Patlama 5" src={staticFile("sfx/bildirim.wav")} from={614} volume={0.18} />
        <Audio name="Patlama 6" src={staticFile("sfx/bildirim.wav")} from={617} volume={0.18} />
        <Audio name="Patlama 7" src={staticFile("sfx/bildirim.wav")} from={620} volume={0.18} />
        <Audio name="Patlama 8" src={staticFile("sfx/bildirim.wav")} from={623} volume={0.18} />
        <Audio name="Patlama 9" src={staticFile("sfx/bildirim.wav")} from={626} volume={0.18} />
        <Audio name="Patlama 10" src={staticFile("sfx/bildirim.wav")} from={629} volume={0.18} />
        <Audio name="Patlama 11" src={staticFile("sfx/bildirim.wav")} from={631} volume={0.18} />
        <Audio name="Patlama 12" src={staticFile("sfx/bildirim.wav")} from={634} volume={0.18} />
        {/* scene 10 */}
        <Audio name="Şaşkın vuruş" src={staticFile("sfx/hit.mp3")} from={21.3 * fps} durationInFrames={1 * fps} volume={0.3} />
        {/* scene 11: cover frame */}
        <Audio name="Kapak" src={staticFile("sfx/logo-hit.wav")} from={23.4 * fps} volume={0.35} />
        {/* scene 12 */}
        <Audio name="Eklendi" src={staticFile("sfx/success.wav")} from={24.2 * fps} volume={0.5} />
        {/* scene 13: she sends the rose, it fills the screen and the video starts over */}
        <Audio name="Gül gönder" src={staticFile("sfx/pop.mp3")} from={26.6 * fps} volume={0.4} />
        <Audio name="Döngü" src={staticFile("sfx/whoosh.mp3")} from={27.7 * fps} durationInFrames={0.6 * fps} volume={0.55} />
      </Track>
    </>
  );
};
