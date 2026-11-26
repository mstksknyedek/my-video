import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Ifade, MAVI } from "./karakterler/animasyon";
import { NerminTeyze } from "./karakterler/NerminTeyze";
import { LogoBadge } from "./LogoBadge";
import { BildirimYigini, GrupMenusu, MesajEkrani, MesajOgesi, YuvarlakCerceve } from "./MesajEkrani";
import { PaperBackground } from "./PaperBackground";

// Animatic for script 03 "Günaydın çiçekleri" (Nermin Teyze #1), using the script's own timings at 30 fps.
// It shows how MesajEkrani, BildirimYigini, GrupMenusu and NerminTeyze fit together; no voice, captions or sfx yet.
// 1080x1920, 26 s (780 frames).

const sn = (s: number) => Math.round(s * 30);
const N = "Nermin Teyze";

const BILDIRIMLER = Array.from({ length: 14 }, (_, i) => ({
  baslik: N,
  metin: "Hayırlı sabahlar",
  kare: Math.round(i * 2.6),
}));

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

// 12 messages between 17.6 s and 19.2 s, speeding up
const patlamaKaresi = (i: number) => sn(17.6) + Math.round(48 * Math.pow(i / 11, 0.7));

const MESAJLAR: MesajOgesi[] = [
  { tur: "metin", kim: "Kuzen Mert", metin: "Akşam maçı kim izliyor?", kare: -300 },
  { tur: "metin", kim: "Selin", metin: "Ben yokum, sınav var", kare: -200 },
  { tur: "gorsel", kim: N, gorsel: "gul", yazi: "Günaydın", kare: sn(3.7) },
  { tur: "gorsel", kim: N, gorsel: "cayKedi", yazi: "Mutlu Sabahlar", kare: sn(4.8) },
  { tur: "gorsel", kim: N, gorsel: "simliCay", yazi: "Güzel Bir Gün Dilerim", kare: sn(5.9) },
  { tur: "goruldu", sayi: 12, kare: sn(6.8), bitis: sn(11.2), vurgula: true },
  { tur: "yaziyor", kim: "Selin", kare: sn(11.3), bitis: sn(12.1) },
  { tur: "yaziyor", kim: "Selin", kare: sn(12.4), bitis: sn(13.2) },
  { tur: "sistem", metin: "Nermin Teyze gruptan ayrıldı", kare: sn(15.7) },
  ...PATLAMA.map(([kim, metin], i): MesajOgesi => ({ tur: "metin", kim, metin, kare: patlamaKaresi(i) })),
  { tur: "sistem", metin: "Selin, Nermin Teyze'yi ekledi", kare: sn(22.1) },
  { tur: "gorsel", kim: N, gorsel: "gul", yazi: "Günaydın", kare: sn(24) },
];

type Durum = { readonly ifade: Ifade; readonly konusuyor: boolean };
const NERMIN: [number, Durum][] = [
  [0, { ifade: "mutlu", konusuyor: true }],
  [1.6, { ifade: "mutlu", konusuyor: false }],
  [3.6, { ifade: "mutlu", konusuyor: true }],
  [6.8, { ifade: "uzgun", konusuyor: true }],
  [9.4, { ifade: "sinirli", konusuyor: true }],
  [15.6, { ifade: "sinirli", konusuyor: false }],
  [19.4, { ifade: "saskin", konusuyor: true }],
  [21.2, { ifade: "saskin", konusuyor: false }],
  [22, { ifade: "mutlu", konusuyor: false }],
  [23.6, { ifade: "mutlu", konusuyor: true }],
];

const TEL_X = 80;
const TEL_Y = 330;
const TEL_G = 820;
const TEL_H = 1120;

export const MesajEkraniOnizleme: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const durum = NERMIN.reduce((acc, [s, d]) => (t >= s ? d : acc), NERMIN[0][1]);
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  // scene 5-6: frame grows to half the screen, phone pressed to her glasses
  const buyu = interpolate(t, [9.4, 9.8, 13.2, 13.6], [0, 1, 1, 0], k);
  const yaklas = interpolate(t, [9.4, 9.8, 13.3, 13.6], [0, 1, 1, 0], k);
  const cap = interpolate(buyu, [0, 1], [290, 620]);
  const cx = interpolate(buyu, [0, 1], [620, 200]);
  const cy = interpolate(buyu, [0, 1], [40, 520]);
  // scene 8: she leaves, her frame goes dark; scene 10: it comes back
  const karartma = interpolate(t, [15.6, 15.8, 19.4, 19.6], [0, 1, 1, 0], k);

  const kilitte = frame < sn(1.6);
  const grupAcilis = interpolate(frame, [sn(1.6), sn(1.6) + 8], [0.9, 1], k);

  return (
    <AbsoluteFill>
      <PaperBackground />
      <div style={{ position: "absolute", left: TEL_X, top: TEL_Y, transform: `scale(${kilitte ? 1 : grupAcilis})` }}>
        {kilitte ? (
          <BildirimYigini
            saat="06.12"
            tarih="Pazartesi"
            bildirimler={BILDIRIMLER}
            genislik={TEL_G}
            yukseklik={TEL_H}
            titresim={{ bas: 3, bit: 40 }}
          />
        ) : (
          <MesajEkrani
            grupAdi="Bizim Aile"
            uyeSayisi={14}
            mesajlar={MESAJLAR}
            genislik={TEL_G}
            yukseklik={TEL_H}
            kisiRenkleri={{ [N]: MAVI }}
            titresim={{ bas: sn(17.6), bit: sn(19.2) }}
          />
        )}
      </div>

      {frame >= sn(13.6) && frame < sn(15.9) ? (
        <div style={{ position: "absolute", left: TEL_X + 22, top: TEL_Y + TEL_H - 22 - 470, width: TEL_G - 44, height: 470, overflow: "hidden", borderRadius: "0 0 66px 66px" }}>
          <div style={{ position: "absolute", bottom: 0 }}>
            <GrupMenusu kare={sn(13.6)} basma={sn(15.4)} genislik={TEL_G - 44} />
          </div>
        </div>
      ) : null}

      <div style={{ position: "absolute", left: cx, top: cy }}>
        <YuvarlakCerceve boyut={cap} karartma={karartma}>
          <div style={{ position: "absolute", left: -cap * 0.22, top: -cap * 0.1 }}>
            <NerminTeyze
              size={cap * 1.45}
              ifade={durum.ifade}
              konusuyor={durum.konusuyor}
              telefonuYaklastiriyor={yaklas}
            />
          </div>
        </YuvarlakCerceve>
      </div>

      <LogoBadge style={{ position: "absolute", top: 60, left: 60 }} />
    </AbsoluteFill>
  );
};
