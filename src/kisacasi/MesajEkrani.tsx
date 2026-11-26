import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, HEADLINE_FONT } from "./fonts";
import { KIRMIZI, KOYU_SARI, KREM, MAVI, MUREKKEP, SARI } from "./karakterler/animasyon";

// A made-up family group chat in Kısacası's own collage look: cream paper, thick ink outlines,
// hard offset shadows, red/yellow/blue. It deliberately copies no real messaging app:
// no green theme, no patterned wallpaper, no bubble tails, no tick marks, no "last seen", no logo or app name.
// Everything is driven by useCurrentFrame, so it renders the same every time.

/* ------------------------------------------------------------------------------------------ */
/* Types                                                                                      */
/* ------------------------------------------------------------------------------------------ */

export type GorselTuru = "gul" | "cayKedi" | "simliCay";

/** One item in the chat stream. `kare` = the frame it appears; optional `bitis` = the frame it goes away. */
export type MesajOgesi =
  | {
      readonly tur: "metin";
      readonly kim: string;
      readonly metin: string;
      readonly kare: number;
      /** true = sent by the phone's owner (right side, yellow). */
      readonly ben?: boolean;
      readonly bitis?: number;
    }
  | {
      readonly tur: "gorsel";
      readonly kim: string;
      readonly gorsel: GorselTuru;
      /** Fancy caption on the picture ("Günaydın"). */
      readonly yazi?: string;
      readonly kare: number;
      readonly ben?: boolean;
      readonly bitis?: number;
    }
  | { readonly tur: "sistem"; readonly metin: string; readonly kare: number; readonly bitis?: number }
  | { readonly tur: "yaziyor"; readonly kim: string; readonly kare: number; readonly bitis: number }
  | {
      readonly tur: "goruldu";
      readonly sayi: number;
      readonly kare: number;
      readonly bitis?: number;
      /** Slowly grows after it pops in (the "12 people saw it and nobody answered" beat). */
      readonly vurgula?: boolean;
    };

/** Frames during which the whole phone buzzes. */
export type Titresim = { readonly bas: number; readonly bit: number };

/* ------------------------------------------------------------------------------------------ */
/* Shared bits                                                                                */
/* ------------------------------------------------------------------------------------------ */

const KAGIT = "#FBF6EC";
const GRI = "#E3DACB";
const GRI_YAZI = "#6B625A";
const KISI_RENKLERI = [MAVI, KIRMIZI, "#7B4BB7", "#F28C28", KOYU_SARI, "#C2185B", "#00838F"];

const kisiRengi = (kim: string, renkler?: Readonly<Record<string, string>>) => {
  if (renkler?.[kim]) return renkler[kim];
  let h = 0;
  for (const c of kim) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return KISI_RENKLERI[h % KISI_RENKLERI.length];
};

const bas = (kim: string) => kim.trim().charAt(0).toLocaleUpperCase("tr-TR");

/** Deterministic phone buzz offset (px). */
const titresimKaydir = (frame: number, t?: Titresim) => {
  if (!t || frame < t.bas || frame > t.bit) return { x: 0, y: 0, r: 0 };
  return {
    x: Math.sin(frame * 2.9) * 9,
    y: Math.cos(frame * 3.7) * 4,
    r: Math.sin(frame * 2.3) * 1.2,
  };
};

/** Word wrap by character count, so bubble heights are known without measuring the DOM. */
const sar = (metin: string, enFazla: number): string[] => {
  const satirlar: string[] = [];
  let satir = "";
  for (const kelime of metin.split(/\s+/)) {
    if (!satir) satir = kelime;
    else if ((satir + " " + kelime).length <= enFazla) satir += " " + kelime;
    else {
      satirlar.push(satir);
      satir = kelime;
    }
  }
  if (satir) satirlar.push(satir);
  return satirlar;
};

const Avatar: React.FC<{ readonly kim: string; readonly renk: string; readonly boyut: number }> = ({
  kim,
  renk,
  boyut,
}) => (
  <div
    style={{
      width: boyut,
      height: boyut,
      borderRadius: boyut,
      backgroundColor: renk,
      border: `4px solid ${MUREKKEP}`,
      color: "white",
      fontFamily: HEADLINE_FONT,
      fontWeight: 700,
      fontSize: boyut * 0.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxSizing: "border-box",
    }}
  >
    {bas(kim)}
  </div>
);

/** Plain eye icon (own drawing) for the "seen by" pill. */
const GozSimgesi: React.FC<{ readonly boyut: number }> = ({ boyut }) => (
  <svg width={boyut} height={boyut * 0.62} viewBox="0 0 100 62">
    <path d="M 6 31 Q 50 -14 94 31 Q 50 76 6 31 Z" fill="white" stroke={MUREKKEP} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={50} cy={31} r={15} fill={MAVI} stroke={MUREKKEP} strokeWidth={6} />
    <circle cx={55} cy={26} r={4} fill="white" />
  </svg>
);

/** Outer phone body: ink slab, rounded, a small speaker slot. Content fills the screen area. */
export const TelefonGovdesi: React.FC<{
  readonly genislik: number;
  readonly yukseklik: number;
  readonly titresim?: Titresim;
  readonly children: React.ReactNode;
}> = ({ genislik, yukseklik, titresim, children }) => {
  const frame = useCurrentFrame();
  const t = titresimKaydir(frame, titresim);
  return (
    <div
      style={{
        position: "relative",
        width: genislik,
        height: yukseklik,
        borderRadius: 86,
        backgroundColor: MUREKKEP,
        padding: 22,
        boxSizing: "border-box",
        boxShadow: `14px 16px 0 ${KIRMIZI}`,
        transform: `translate(${t.x}px, ${t.y}px) rotate(${t.r}deg)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 66,
          overflow: "hidden",
          backgroundColor: KAGIT,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: 34,
          left: "50%",
          width: 120,
          height: 22,
          marginLeft: -60,
          borderRadius: 11,
          backgroundColor: MUREKKEP,
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------------------------------ */
/* "Günaydın" pictures: own SVG drawings, no internet images, no religious greetings          */
/* ------------------------------------------------------------------------------------------ */

const Parilti: React.FC<{ readonly x: number; readonly y: number; readonly r: number; readonly faz: number }> = ({
  x,
  y,
  r,
  faz,
}) => {
  const frame = useCurrentFrame();
  const s = 0.55 + 0.45 * Math.abs(Math.sin(frame / 7 + faz));
  const a = (frame * 3 + faz * 40) % 360;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
      <path
        d={`M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`}
        fill={SARI}
        stroke={MUREKKEP}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </g>
  );
};

const CayBardagi: React.FC<{ readonly cx: number; readonly ust: number; readonly olcek: number; readonly simli?: boolean }> = ({
  cx,
  ust,
  olcek,
  simli,
}) => {
  // tulip-shaped tea glass on a saucer
  const k = olcek;
  const govde = `M ${cx - 70 * k} ${ust} Q ${cx - 66 * k} ${ust + 60 * k} ${cx - 42 * k} ${ust + 92 * k}
    Q ${cx - 64 * k} ${ust + 130 * k} ${cx - 58 * k} ${ust + 168 * k} L ${cx + 58 * k} ${ust + 168 * k}
    Q ${cx + 64 * k} ${ust + 130 * k} ${cx + 42 * k} ${ust + 92 * k} Q ${cx + 66 * k} ${ust + 60 * k} ${cx + 70 * k} ${ust} Z`;
  const cay = `M ${cx - 64 * k} ${ust + 34 * k} Q ${cx - 62 * k} ${ust + 66 * k} ${cx - 42 * k} ${ust + 92 * k}
    Q ${cx - 64 * k} ${ust + 130 * k} ${cx - 58 * k} ${ust + 168 * k} L ${cx + 58 * k} ${ust + 168 * k}
    Q ${cx + 64 * k} ${ust + 130 * k} ${cx + 42 * k} ${ust + 92 * k} Q ${cx + 62 * k} ${ust + 66 * k} ${cx + 64 * k} ${ust + 34 * k} Z`;
  return (
    <g>
      <ellipse cx={cx} cy={ust + 176 * k} rx={120 * k} ry={24 * k} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={7} />
      <ellipse cx={cx} cy={ust + 172 * k} rx={80 * k} ry={11 * k} fill="white" opacity={0.35} />
      <path d={govde} fill="#EAF6FB" stroke={MUREKKEP} strokeWidth={7} strokeLinejoin="round" />
      <path d={cay} fill={simli ? "#D2541B" : "#C8501E"} />
      <path d={govde} fill="none" stroke={MUREKKEP} strokeWidth={7} strokeLinejoin="round" />
      <path
        d={`M ${cx - 44 * k} ${ust + 44 * k} Q ${cx - 46 * k} ${ust + 70 * k} ${cx - 30 * k} ${ust + 88 * k}`}
        stroke="white"
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      {simli
        ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <circle
              key={i}
              cx={cx + (((i * 37) % 90) - 45) * k}
              cy={ust + (50 + ((i * 53) % 110)) * k}
              r={4 * k}
              fill={i % 2 ? SARI : "white"}
            />
          ))
        : null}
    </g>
  );
};

/** One "Günaydın" picture, square, drawn in SVG. `boyut` in px. */
export const GunaydinGorseli: React.FC<{
  readonly tur: GorselTuru;
  readonly boyut: number;
  readonly yazi?: string;
}> = ({ tur, boyut, yazi }) => {
  const frame = useCurrentFrame();
  const zemin = { gul: "#FFD9E2", cayKedi: "#CFE6FF", simliCay: "#2A2366" }[tur];
  const yaziRengi = tur === "simliCay" ? SARI : KIRMIZI;
  const sallan = Math.sin(frame / 9) * 2;
  return (
    <div style={{ position: "relative", width: boyut, height: boyut }}>
      <svg width={boyut} height={boyut} viewBox="0 0 400 400" style={{ display: "block" }}>
        <rect x={0} y={0} width={400} height={400} fill={zemin} />
        {tur === "gul" ? (
          <g transform={`rotate(${sallan} 200 380)`}>
            {/* stem and leaves */}
            <path d="M 200 380 Q 190 300 204 236" stroke="#2F7D3B" strokeWidth={14} strokeLinecap="round" fill="none" />
            <path d="M 196 316 Q 140 300 128 260 Q 176 262 196 300 Z" fill="#3E9B4F" stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 200 290 Q 258 270 272 232 Q 222 236 202 274 Z" fill="#3E9B4F" stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
            {/* bloom: two outer petals, then layered cup and a curled centre */}
            <path d="M 170 236 Q 96 222 100 150 Q 140 150 176 196 Z" fill="#C8170C" stroke={MUREKKEP} strokeWidth={7} strokeLinejoin="round" />
            <path d="M 230 236 Q 304 222 300 150 Q 260 150 224 196 Z" fill="#C8170C" stroke={MUREKKEP} strokeWidth={7} strokeLinejoin="round" />
            <path
              d="M 120 170 Q 116 90 200 84 Q 284 90 280 170 Q 270 250 200 252 Q 130 250 120 170 Z"
              fill={KIRMIZI}
              stroke={MUREKKEP}
              strokeWidth={8}
              strokeLinejoin="round"
            />
            <path d="M 140 150 Q 150 112 200 112 Q 250 112 260 150 Q 230 136 200 150 Q 170 136 140 150 Z" fill="#B3140A" />
            <path
              d="M 158 176 Q 160 132 200 130 Q 242 132 242 176 Q 236 214 200 214 Q 164 214 158 176 Z"
              fill={KIRMIZI}
              stroke={MUREKKEP}
              strokeWidth={6}
            />
            <path d="M 180 170 Q 182 150 200 150 Q 220 152 220 172 Q 214 190 200 186" stroke={MUREKKEP} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M 130 196 Q 150 236 200 240 Q 250 236 270 196" stroke="#B3140A" strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d="M 150 118 Q 162 100 184 96" stroke="white" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.5} />
          </g>
        ) : null}
        {tur === "cayKedi" ? (
          <g>
            <CayBardagi cx={200} ust={190} olcek={1} />
            {/* cat silhouette peeking out of the glass, paws over the rim */}
            <g transform={`translate(0 ${Math.sin(frame / 10) * 3})`}>
              <path d="M 138 140 L 142 78 L 182 112 Z" fill={MUREKKEP} stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
              <path d="M 262 140 L 258 78 L 218 112 Z" fill={MUREKKEP} stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
              <path d="M 150 92 L 166 112 L 152 116 Z" fill="#FF9C8A" />
              <path d="M 250 92 L 234 112 L 248 116 Z" fill="#FF9C8A" />
              <ellipse cx={200} cy={160} rx={78} ry={64} fill={MUREKKEP} />
              <ellipse cx={172} cy={152} rx={15} ry={17} fill={SARI} />
              <ellipse cx={228} cy={152} rx={15} ry={17} fill={SARI} />
              <ellipse cx={174} cy={154} rx={5} ry={12} fill={MUREKKEP} />
              <ellipse cx={226} cy={154} rx={5} ry={12} fill={MUREKKEP} />
              <path d="M 192 178 L 208 178 L 200 188 Z" fill="#FF9C8A" />
              <g stroke="white" strokeWidth={3} strokeLinecap="round" opacity={0.8}>
                <line x1={150} y1={184} x2={112} y2={178} />
                <line x1={150} y1={192} x2={114} y2={198} />
                <line x1={250} y1={184} x2={288} y2={178} />
                <line x1={250} y1={192} x2={286} y2={198} />
              </g>
            </g>
            <ellipse cx={162} cy={196} rx={24} ry={15} fill={MUREKKEP} stroke="white" strokeWidth={3} />
            <ellipse cx={238} cy={196} rx={24} ry={15} fill={MUREKKEP} stroke="white" strokeWidth={3} />
          </g>
        ) : null}
        {tur === "simliCay" ? (
          <g>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <circle key={i} cx={(i * 71) % 400} cy={(i * 113 + 40) % 400} r={3} fill="white" opacity={0.6} />
            ))}
            <CayBardagi cx={200} ust={150} olcek={1.15} simli />
            <Parilti x={90} y={130} r={30} faz={0} />
            <Parilti x={318} y={150} r={24} faz={1.7} />
            <Parilti x={300} y={300} r={34} faz={3.1} />
            <Parilti x={84} y={300} r={22} faz={4.4} />
            <Parilti x={200} y={110} r={18} faz={2.2} />
          </g>
        ) : null}
        {tur === "gul" ? (
          <>
            <Parilti x={80} y={90} r={26} faz={0.5} />
            <Parilti x={320} y={110} r={20} faz={2.5} />
            <Parilti x={316} y={290} r={24} faz={4} />
          </>
        ) : null}
      </svg>
      {yazi ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: tur === "gul" ? 8 : 14,
            textAlign: "center",
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: boyut * 0.135,
            color: tur === "simliCay" ? SARI : "white",
            WebkitTextStroke: `${boyut * 0.018}px ${yaziRengi === SARI ? KIRMIZI : yaziRengi}`,
            paintOrder: "stroke fill",
            transform: `rotate(-6deg)`,
            letterSpacing: 1,
            lineHeight: 1,
            textShadow: `0 ${boyut * 0.012}px 0 ${MUREKKEP}`,
          }}
        >
          {yazi}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------------------------------ */
/* The chat screen                                                                            */
/* ------------------------------------------------------------------------------------------ */

type Props = {
  readonly grupAdi: string;
  readonly uyeSayisi?: number;
  readonly mesajlar: readonly MesajOgesi[];
  /** Phone width/height in px (incl. the black body). Default 860x1240. */
  readonly genislik?: number;
  readonly yukseklik?: number;
  /** Fixed colours for senders, e.g. { "Nermin Teyze": "#1E3FAE" }. Others get a stable colour from the name. */
  readonly kisiRenkleri?: Readonly<Record<string, string>>;
  /** From this frame on the input bar says you can no longer write here (after leaving the group). */
  readonly yazamazKaresi?: number;
  readonly titresim?: Titresim;
};

const UST_BAR = 168;
const ALT_BAR = 132;
const BOSLUK = 22;
const YAZI = 38;
const SATIR = 48;
const KARAKTER = 24;

type Yerlesim = { readonly oge: MesajOgesi; readonly h: number; readonly satirlar: string[] };

const yukseklikHesapla = (oge: MesajOgesi, gorselBoyu: number): Yerlesim => {
  switch (oge.tur) {
    case "metin": {
      const satirlar = sar(oge.metin, KARAKTER);
      return { oge, satirlar, h: (oge.ben ? 10 : 46) + satirlar.length * SATIR + 46 };
    }
    case "gorsel":
      return { oge, satirlar: [], h: (oge.ben ? 4 : 40) + gorselBoyu + 28 };
    case "sistem": {
      const satirlar = sar(oge.metin, 34);
      return { oge, satirlar, h: satirlar.length * 40 + 34 };
    }
    case "yaziyor":
      return { oge, satirlar: [], h: 62 };
    case "goruldu":
      return { oge, satirlar: [], h: 64 };
  }
};

export const MesajEkrani: React.FC<Props> = ({
  grupAdi,
  uyeSayisi,
  mesajlar,
  genislik = 860,
  yukseklik = 1240,
  kisiRenkleri,
  yazamazKaresi,
  titresim,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ic = genislik - 44; // screen width inside the body
  const alanYuksekligi = yukseklik - 44 - UST_BAR - ALT_BAR;
  const gorselBoyu = Math.round(ic * 0.5);

  const sirali = [...mesajlar].sort((a, b) => a.kare - b.kare);
  const yer = sirali.map((o) => yukseklikHesapla(o, gorselBoyu));

  // q: how much of its slot an item takes (0..1, no overshoot, so the stack pushes smoothly)
  const girdi = (kare: number) =>
    spring({ frame: frame - kare, fps, config: { damping: 200, stiffness: 220 }, durationInFrames: 9 });
  const gs = yer.map((y) => (frame < y.oge.kare ? 0 : girdi(y.oge.kare)));
  const cs = yer.map((y) => (y.oge.bitis !== undefined && frame >= y.oge.bitis ? girdi(y.oge.bitis) : 0));
  const qs = gs.map((g, i) => g * (1 - cs[i]));

  // bottom offset of every item: the sum of the slots below it
  const altlar: number[] = new Array(yer.length).fill(0);
  let birikim = 18;
  for (let i = yer.length - 1; i >= 0; i--) {
    altlar[i] = birikim;
    birikim += (yer[i].h + BOSLUK) * qs[i];
  }

  const yazamaz = yazamazKaresi !== undefined && frame >= yazamazKaresi;

  return (
    <TelefonGovdesi genislik={genislik} yukseklik={yukseklik} titresim={titresim}>
      {/* header: group name in the channel's blue */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: UST_BAR,
          backgroundColor: MAVI,
          borderBottom: `6px solid ${MUREKKEP}`,
          display: "flex",
          alignItems: "flex-end",
          padding: "0 34px 22px",
          gap: 22,
          boxSizing: "border-box",
        }}
      >
        <svg width={86} height={86} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
          <circle cx={50} cy={50} r={46} fill={KREM} stroke={MUREKKEP} strokeWidth={6} />
          <circle cx={34} cy={58} r={17} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={5} />
          <circle cx={66} cy={58} r={17} fill={SARI} stroke={MUREKKEP} strokeWidth={5} />
          <circle cx={50} cy={36} r={17} fill={MAVI} stroke={MUREKKEP} strokeWidth={5} />
        </svg>
        <div style={{ color: "white", lineHeight: 1.05 }}>
          <div style={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: 50 }}>{grupAdi}</div>
          {uyeSayisi !== undefined ? (
            <div style={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: 30, color: SARI, marginTop: 4 }}>
              {uyeSayisi} kişi
            </div>
          ) : null}
        </div>
      </div>

      {/* message area: plain paper with the channel's fine grain, no app wallpaper */}
      <div
        style={{
          position: "absolute",
          top: UST_BAR,
          left: 0,
          right: 0,
          height: alanYuksekligi,
          overflow: "hidden",
          backgroundColor: KAGIT,
          backgroundImage: "radial-gradient(rgba(80,60,30,0.08) 1px, transparent 1.4px)",
          backgroundSize: "7px 7px",
        }}
      >
        {yer.map((y, i) => {
          const q = qs[i];
          if (q <= 0.001) return null;
          const giris =
            frame < y.oge.kare
              ? 0
              : spring({ frame: frame - y.oge.kare, fps, config: { damping: 11, stiffness: 160 } });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 26,
                right: 26,
                bottom: altlar[i],
                height: y.h,
                // a new item slides up from under the input bar while it pushes the stack; a leaving one fades
                transform: `translateY(${(1 - gs[i]) * (y.h + BOSLUK)}px)`,
                opacity: Math.min(1, gs[i] * 2) * (1 - cs[i]),
              }}
            >
              <Oge yer={y} giris={giris} ic={ic - 52} gorselBoyu={gorselBoyu} kisiRenkleri={kisiRenkleri} />
            </div>
          );
        })}
      </div>

      {/* input bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: ALT_BAR,
          borderTop: `6px solid ${MUREKKEP}`,
          backgroundColor: KREM,
          display: "flex",
          alignItems: "center",
          padding: "0 26px",
          gap: 18,
          boxSizing: "border-box",
        }}
      >
        {yazamaz ? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: BODY_FONT,
              fontWeight: 700,
              fontSize: 32,
              color: GRI_YAZI,
              backgroundColor: GRI,
              border: `4px solid ${MUREKKEP}`,
              borderRadius: 20,
              padding: "16px 10px",
            }}
          >
            Bu gruba mesaj gönderemezsiniz.
          </div>
        ) : (
          <>
            <div
              style={{
                flex: 1,
                height: 72,
                borderRadius: 18,
                border: `5px solid ${MUREKKEP}`,
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                paddingLeft: 24,
                fontFamily: BODY_FONT,
                fontWeight: 700,
                fontSize: 32,
                color: "#A79E92",
                boxSizing: "border-box",
              }}
            >
              Bir şey yaz…
            </div>
            <svg width={76} height={76} viewBox="0 0 76 76">
              <rect x={4} y={4} width={68} height={68} rx={18} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={5} />
              <path d="M 38 56 L 38 22 M 24 36 L 38 22 L 52 36" stroke="white" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </>
        )}
      </div>
    </TelefonGovdesi>
  );
};

const Oge: React.FC<{
  readonly yer: Yerlesim;
  readonly giris: number;
  readonly ic: number;
  readonly gorselBoyu: number;
  readonly kisiRenkleri?: Readonly<Record<string, string>>;
}> = ({ yer, giris, ic, gorselBoyu, kisiRenkleri }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const o = yer.oge;
  const olcek = interpolate(giris, [0, 1], [0.6, 1]);

  if (o.tur === "sistem") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            backgroundColor: GRI,
            border: `4px solid ${MUREKKEP}`,
            borderRadius: 999,
            padding: "14px 34px",
            fontFamily: BODY_FONT,
            fontWeight: 700,
            fontSize: 31,
            lineHeight: "40px",
            color: "#3D3631",
            textAlign: "center",
            transform: `scale(${olcek})`,
          }}
        >
          {yer.satirlar.map((s, i) => (
            <div key={i}>{s}</div>
          ))}
        </div>
      </div>
    );
  }

  if (o.tur === "goruldu") {
    const buyu = o.vurgula
      ? interpolate(frame - o.kare, [8, fps * 2.2], [1, 1.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "white",
            border: `4px solid ${MUREKKEP}`,
            borderRadius: 999,
            padding: "6px 22px",
            fontFamily: BODY_FONT,
            fontWeight: 700,
            fontSize: 30,
            color: MUREKKEP,
            transform: `scale(${olcek * buyu})`,
            transformOrigin: "right center",
            boxShadow: `0 5px 0 ${MUREKKEP}`,
          }}
        >
          <GozSimgesi boyut={44} />
          Görüldü: {o.sayi} kişi
        </div>
      </div>
    );
  }

  const renk = kisiRenkleri?.[o.kim] ?? kisiRengi(o.kim);

  if (o.tur === "yaziyor") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar kim={o.kim} renk={renk} boyut={52} />
        <div style={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: 31, color: GRI_YAZI }}>
          {o.kim} yazıyor
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 11,
                height: 11,
                borderRadius: 6,
                backgroundColor: GRI_YAZI,
                transform: `translateY(${Math.min(0, Math.sin(frame / 3.2 - i * 0.9)) * 8}px)`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const ben = o.ben === true;
  const balon: React.CSSProperties = {
    backgroundColor: ben ? SARI : "white",
    border: `5px solid ${MUREKKEP}`,
    borderRadius: 26,
    boxShadow: `0 6px 0 ${MUREKKEP}`,
    overflow: "hidden",
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: ben ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 14,
      }}
    >
      {!ben ? <Avatar kim={o.kim} renk={renk} boyut={64} /> : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: ben ? "flex-end" : "flex-start",
          maxWidth: ic * 0.8,
          transform: `scale(${olcek})`,
          transformOrigin: ben ? "right bottom" : "left bottom",
          marginBottom: 6,
        }}
      >
        {!ben ? (
          <div style={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: 28, color: renk, height: 36, paddingLeft: 8 }}>
            {o.kim}
          </div>
        ) : null}
        {o.tur === "metin" ? (
          <div
            style={{
              ...balon,
              padding: "12px 26px",
              fontFamily: BODY_FONT,
              fontWeight: 700,
              fontSize: YAZI,
              lineHeight: `${SATIR}px`,
              color: MUREKKEP,
              whiteSpace: "nowrap",
            }}
          >
            {yer.satirlar.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        ) : (
          <div style={{ ...balon, padding: 10, backgroundColor: ben ? SARI : "white" }}>
            <div style={{ borderRadius: 16, overflow: "hidden", border: `4px solid ${MUREKKEP}` }}>
              <GunaydinGorseli tur={o.gorsel} boyut={gorselBoyu - 28} yazi={o.yazi} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------------------------ */
/* Lock screen with piling notifications (hook of every Nermin Teyze episode)                 */
/* ------------------------------------------------------------------------------------------ */

export type Bildirim = {
  readonly baslik: string;
  readonly metin: string;
  readonly kare: number;
  /** Small picture on the card (a rose by default). */
  readonly gorsel?: GorselTuru;
};

const KART = 140;
const ADIM = 156; // spacing while the cards still fit
const YIGIN_ADIM = 14; // spacing once they pile up
const ACIK_KART = 3;

/** Continuous position for a card that has `e` newer cards above it. */
const kartY = (e: number) => (e <= ACIK_KART ? e * ADIM : ACIK_KART * ADIM + (e - ACIK_KART) * YIGIN_ADIM);

export const BildirimYigini: React.FC<{
  readonly saat: string;
  readonly tarih?: string;
  readonly bildirimler: readonly Bildirim[];
  readonly genislik?: number;
  readonly yukseklik?: number;
  readonly titresim?: Titresim;
}> = ({ saat, tarih, bildirimler, genislik = 860, yukseklik = 1240, titresim }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sirali = [...bildirimler].sort((a, b) => a.kare - b.kare);
  const q = sirali.map((b) =>
    frame < b.kare ? 0 : spring({ frame: frame - b.kare, fps, config: { damping: 15, stiffness: 190 } }),
  );
  const gorunen = q.filter((v) => v > 0).length;

  return (
    <TelefonGovdesi genislik={genislik} yukseklik={yukseklik} titresim={titresim}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: MAVI }}>
        {/* collage strips instead of a photo wallpaper */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: SARI,
            clipPath: "polygon(0 74%, 22% 71%, 47% 75%, 71% 70%, 100% 73%, 100% 100%, 0 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: KIRMIZI,
            clipPath: "polygon(0 84%, 30% 81%, 58% 85%, 82% 80%, 100% 83%, 100% 100%, 0 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 90,
            width: "100%",
            textAlign: "center",
            color: "white",
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: 190,
            lineHeight: 1,
            letterSpacing: -4,
            textShadow: `0 8px 0 ${MUREKKEP}`,
          }}
        >
          {saat}
        </div>
        {tarih ? (
          <div
            style={{
              position: "absolute",
              top: 300,
              width: "100%",
              textAlign: "center",
              color: SARI,
              fontFamily: BODY_FONT,
              fontWeight: 700,
              fontSize: 38,
            }}
          >
            {tarih}
          </div>
        ) : null}

        {sirali.map((b, i) => {
          if (q[i] <= 0) return null;
          // how many newer cards are already pushing this one down
          let e = 0;
          for (let j = i + 1; j < sirali.length; j++) e += Math.min(1, q[j]);
          if (e > ACIK_KART + 8) return null;
          // the newest card pops in at the top slot and pushes the others down into a pile
          const y = 350 + kartY(e);
          const s = (e <= ACIK_KART ? 1 : Math.max(0.82, 1 - (e - ACIK_KART) * 0.03)) * interpolate(q[i], [0, 1], [0.7, 1]);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 30,
                right: 30,
                top: y,
                height: KART,
                zIndex: 100 - Math.round(e),
                transform: `scale(${s})`,
                opacity: Math.min(1, q[i] * 3),
                backgroundColor: KAGIT,
                border: `5px solid ${MUREKKEP}`,
                borderRadius: 30,
                boxShadow: `0 7px 0 ${MUREKKEP}`,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 24px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  overflow: "hidden",
                  border: `4px solid ${MUREKKEP}`,
                  flexShrink: 0,
                }}
              >
                <GunaydinGorseli tur={b.gorsel ?? "gul"} boyut={92} />
              </div>
              <div style={{ lineHeight: 1.15, minWidth: 0 }}>
                <div style={{ fontFamily: HEADLINE_FONT, fontWeight: 700, fontSize: 36, color: MAVI, whiteSpace: "nowrap" }}>
                  {b.baslik}
                </div>
                <div style={{ fontFamily: BODY_FONT, fontWeight: 700, fontSize: 34, color: MUREKKEP, whiteSpace: "nowrap" }}>
                  {b.metin}
                </div>
              </div>
            </div>
          );
        })}

        {gorunen > ACIK_KART + 1 ? (
          <div
            style={{
              position: "absolute",
              right: 40,
              top: 300,
              zIndex: 200,
              backgroundColor: KIRMIZI,
              color: "white",
              border: `5px solid ${MUREKKEP}`,
              borderRadius: 999,
              padding: "4px 22px",
              fontFamily: HEADLINE_FONT,
              fontWeight: 700,
              fontSize: 40,
              transform: `rotate(6deg) scale(${1 + Math.max(0, 1 - (frame - sirali[gorunen - 1].kare) / 6) * 0.25})`,
            }}
          >
            {gorunen} yeni
          </div>
        ) : null}
      </div>
    </TelefonGovdesi>
  );
};

/* ------------------------------------------------------------------------------------------ */
/* Group menu (scene 7) and a round video-call frame for the character                         */
/* ------------------------------------------------------------------------------------------ */

/** Slide-up group menu: small grey "remove members", huge red "leave group". `basma` = frame the thumb hits it. */
export const GrupMenusu: React.FC<{ readonly kare: number; readonly basma?: number; readonly genislik?: number }> = ({
  kare,
  basma,
  genislik = 816,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ac = frame < kare ? 0 : spring({ frame: frame - kare, fps, config: { damping: 16, stiffness: 170 } });
  const basildi = basma !== undefined && frame >= basma;
  const basOlcek = basildi
    ? interpolate(frame - basma, [0, 3, 9], [1, 0.88, 1], { extrapolateRight: "clamp" })
    : 1;
  const kucuk: React.CSSProperties = {
    fontFamily: BODY_FONT,
    fontWeight: 700,
    fontSize: 28,
    color: GRI_YAZI,
    padding: "14px 0",
    borderBottom: `3px solid ${GRI}`,
  };
  return (
    <div
      style={{
        width: genislik,
        backgroundColor: KAGIT,
        border: `6px solid ${MUREKKEP}`,
        borderRadius: "36px 36px 0 0",
        padding: "26px 40px 50px",
        boxSizing: "border-box",
        transform: `translateY(${(1 - ac) * 110}%)`,
      }}
    >
      <div style={{ width: 90, height: 10, borderRadius: 5, backgroundColor: GRI, margin: "0 auto 18px" }} />
      <div style={kucuk}>Grup bilgisi</div>
      <div style={kucuk}>Üyeleri çıkar</div>
      <div
        style={{
          marginTop: 30,
          backgroundColor: basildi ? "#B3140A" : KIRMIZI,
          color: "white",
          border: `6px solid ${MUREKKEP}`,
          borderRadius: 30,
          boxShadow: basildi ? `0 2px 0 ${MUREKKEP}` : `0 10px 0 ${MUREKKEP}`,
          textAlign: "center",
          padding: "30px 0",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 72,
          transform: `scale(${basOlcek})`,
        }}
      >
        GRUPTAN ÇIK
      </div>
    </div>
  );
};

/** Round "video call" frame for a character in the corner. `karartma` 0..1 fades it to black (she left). */
export const YuvarlakCerceve: React.FC<{
  readonly boyut: number;
  readonly karartma?: number;
  readonly zemin?: string;
  readonly children: React.ReactNode;
}> = ({ boyut, karartma = 0, zemin = SARI, children }) => (
  <div
    style={{
      position: "relative",
      width: boyut,
      height: boyut,
      borderRadius: boyut,
      overflow: "hidden",
      backgroundColor: zemin,
      border: `9px solid ${MUREKKEP}`,
      boxShadow: `8px 10px 0 ${MAVI}`,
      boxSizing: "border-box",
    }}
  >
    {children}
    <div style={{ position: "absolute", inset: 0, backgroundColor: MUREKKEP, opacity: karartma }} />
  </div>
);
