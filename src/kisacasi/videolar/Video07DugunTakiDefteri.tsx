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
import { Ifade, KIRMIZI, MAVI, MUREKKEP, SARI } from "../karakterler/animasyon";
import { Konuk, KonukSac } from "../karakterler/Konuk";
import { NerminTeyze } from "../karakterler/NerminTeyze";
import { LogoBadge } from "../LogoBadge";
import { PaperBackground } from "../PaperBackground";
import { ShortsCaptions } from "../ShortsCaptions";

// Video #7 "Düğünde takı muhasebesi" (script strategy/senaryolar/07-dugun-taki-defteri.md), 1080x1920, 30 fps.
// Nermin Teyze keeps the gift ledger at a wedding; when it is her turn the whole hall opens a notebook.
// Timed to the real voiceover in public/voice/07-dugun (leading silence trimmed, each <Audio> starts on its
// line's first word). The 5th line starts a little later than the script's table, so it does not overlap
// the announcer's 4th line.
//
// Scene starts (frame / s): 1 hook 0 / 0.0 · 2 Kenan Amca pins 90 / 3.0 · 3 Sevim Teyze, the old page 186 / 6.2 ·
// 4 "SEVİM: KAYDEDİLDİ" 312 / 10.4 · 5 spotlight, Nermin stands 378 / 12.6 · 6 whip-pan, 40 notebooks open
// 456 / 15.2 (punchline text 513 / 17.1) · 7 bangle 576 / 19.2 · 7b back at the table 648 / 21.6 ·
// 8 cover 660 / 22.0 · end 684 / 22.8.
// Loop: scene 7b shows the table pose from before frame 0; the cover is the last card, then the Short restarts
// with the same table, the notebook cover closed.
//
// Layout (fixed): logo y 100-195 · screen text y 215-490 · scene window y 440-1250 · captions y 1275-1450.

const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PX = 40;
const PY = 440;
const PW = 1000;
const PH = 810;

const KREM_DUVAR = "#F6E7C8";
const MAVI_MUREKKEP = "#1E3FAE";

// When Nermin's mouth moves: each of her voice lines' start and end frame (global frames).
const KONUSMA: [number, number][] = [
  [9, 72],
  [156, 180],
  [246, 306],
  [318, 346],
  [465, 510],
  [588, 655],
];
const konusuyorMu = (f: number) => KONUSMA.some(([a, b]) => f >= a && f < b);

/* ---------- the framed window the scene lives in ---------- */

const Pencere: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: PX, top: PY, width: PW, height: PH }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: 28,
        boxShadow: "12px 14px 0 #111111",
      }}
    >
      {children}
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 28,
        border: "8px solid #111111",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    />
  </div>
);

/** Cream wall with a faint halftone and the string of red and yellow lanterns. */
const Duvar: React.FC<{ readonly kare: number; readonly koyu?: boolean }> = ({ kare, koyu = false }) => (
  <AbsoluteFill style={{ backgroundColor: KREM_DUVAR }}>
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(circle, rgba(229,28,15,0.13) 22%, transparent 24%)",
        backgroundSize: "34px 34px",
        maskImage: "linear-gradient(180deg, black 0%, transparent 60%)",
        WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 60%)",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(80,60,30,0.08) 1px, transparent 1.4px)",
        backgroundSize: "7px 7px",
      }}
    />
    <svg width={PW} height={150} viewBox="0 0 1000 150" style={{ position: "absolute", left: 0, top: 0 }}>
      <path d="M -10 14 Q 500 90 1010 14" stroke={MUREKKEP} strokeWidth={5} fill="none" />
      {Array.from({ length: 11 }, (_, i) => {
        const x = 50 + i * 90;
        const u = x / 1000;
        const y = 14 + 76 * 4 * u * (1 - u) * 0.5 * 1.0 + 6;
        const sallan = Math.sin(kare * 0.09 + i * 1.3) * 4;
        const kirmizi = i % 2 === 0;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${sallan})`}>
            <line x1={0} y1={0} x2={0} y2={14} stroke={MUREKKEP} strokeWidth={4} />
            <rect x={-10} y={12} width={20} height={8} rx={3} fill={MUREKKEP} />
            <ellipse cx={0} cy={42} rx={20} ry={26} fill={kirmizi ? KIRMIZI : SARI} stroke={MUREKKEP} strokeWidth={5} />
            <path d="M -12 30 Q 0 44 12 30" stroke={MUREKKEP} strokeWidth={3} fill="none" opacity={0.35} />
            <rect x={-8} y={66} width={16} height={7} rx={3} fill={MUREKKEP} />
          </g>
        );
      })}
    </svg>
    {koyu ? <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.0)" }} /> : null}
  </AbsoluteFill>
);

/* ---------- the notebook close-up (bottom right of the window) ---------- */

const DEFTER_W = 470;
const DEFTER_H = 310;
const DEFTER_X = 510;
const DEFTER_Y = 490;

const SayfaCizgileri: React.FC = () => (
  <>
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{ position: "absolute", left: 28, right: 18, top: 96 + i * 52, height: 3, backgroundColor: "rgba(60,90,170,0.28)" }}
      />
    ))}
  </>
);

const Tik: React.FC<{ readonly renk?: string; readonly boyut?: number }> = ({ renk = MAVI_MUREKKEP, boyut = 34 }) => (
  <svg width={boyut} height={boyut} viewBox="0 0 40 40" style={{ marginLeft: 10, verticalAlign: "middle" }}>
    <path d="M 6 22 L 16 32 L 35 8" stroke={renk} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/** One handwritten line that is revealed left to right between two frames. */
const YaziSatiri: React.FC<{
  readonly kare: number;
  readonly bas: number;
  readonly bit: number;
  readonly top: number;
  readonly soluk?: boolean;
  readonly children: React.ReactNode;
}> = ({ kare, bas, bit, top, soluk = false, children }) => {
  const ac = interpolate(kare, [bas, bit], [0, 100], k);
  const tikGorunur = kare >= bit;
  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        top,
        height: 52,
        whiteSpace: "nowrap",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 33,
        lineHeight: "52px",
        color: soluk ? "rgba(30,63,174,0.55)" : MAVI_MUREKKEP,
        clipPath: `inset(0 ${100 - ac}% 0 0)`,
      }}
    >
      {children}
      {tikGorunur || soluk ? <Tik renk={soluk ? "rgba(30,63,174,0.55)" : MAVI_MUREKKEP} /> : null}
    </div>
  );
};

const SayfaCerceve: React.FC<{ readonly renk: string; readonly children?: React.ReactNode; readonly style?: React.CSSProperties }> = ({
  renk,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: 34,
      top: 8,
      width: DEFTER_W - 34 - 8,
      height: DEFTER_H - 16,
      backgroundColor: renk,
      borderRadius: "4px 14px 14px 4px",
      border: "4px solid #111111",
      boxSizing: "border-box",
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const SarCicek: React.FC<{ readonly boyut: number }> = ({ boyut }) => (
  <svg width={boyut} height={boyut} viewBox="-30 -30 60 60">
    {[0, 72, 144, 216, 288].map((a) => (
      <circle
        key={a}
        cx={Math.cos((a * Math.PI) / 180) * 15}
        cy={Math.sin((a * Math.PI) / 180) * 15}
        r={12}
        fill={SARI}
        stroke={MUREKKEP}
        strokeWidth={3.5}
      />
    ))}
    <circle r={9} fill="white" stroke={MUREKKEP} strokeWidth={3.5} />
  </svg>
);

/** The ledger: closed cover "TAKI DEFTERİ" -> opens -> Kenan's line -> page flip -> the yellow 1996 page -> underline. */
const DefterKarti: React.FC<{ readonly kare: number }> = ({ kare }) => {
  const kapakAci = interpolate(kare, [8, 18], [0, -172], { ...k, easing: Easing.bezier(0.4, 0, 0.2, 1) });
  const kapakOpak = interpolate(kare, [8, 12, 15], [1, 1, 0], k);
  const ciz1 = interpolate(kare, [320, 328], [0, 100], k);
  const ciz2 = interpolate(kare, [332, 340], [0, 100], k);
  const cikis = interpolate(kare, [378, 392], [0, 340], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  const giris = interpolate(kare, [0, 1], [0, 1], k);
  return (
    <div
      style={{
        position: "absolute",
        left: DEFTER_X,
        top: DEFTER_Y,
        width: DEFTER_W,
        height: DEFTER_H,
        translate: `0px ${cikis}px`,
        opacity: giris,
        perspective: 1500,
      }}
    >
      {/* red binding strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 56,
          height: DEFTER_H,
          backgroundColor: KIRMIZI,
          border: "4px solid #111111",
          borderRadius: 14,
          boxSizing: "border-box",
          boxShadow: "8px 10px 0 #111111",
        }}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 14,
            top: 24 + i * 46,
            width: 26,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#F3EBDD",
            border: "3px solid #111111",
            boxSizing: "border-box",
          }}
        />
      ))}

      {/* the old yellow page that the flip lands on (1996) */}
      <SayfaCerceve renk="#F0D88E">
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 22,
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: 33,
            lineHeight: "44px",
            color: MAVI_MUREKKEP,
            whiteSpace: "nowrap",
          }}
        >
          1996 – <span style={{ position: "relative", display: "inline-block" }}>
            Sevim&apos;in
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: -2,
                height: 7,
                width: `${ciz1}%`,
                backgroundColor: KIRMIZI,
                borderRadius: 4,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 6,
                bottom: -12,
                height: 7,
                width: `${ciz2 * 0.92}%`,
                backgroundColor: KIRMIZI,
                borderRadius: 4,
              }}
            />
          </span>{" "}
          oğluna:
        </div>
        <div
          style={{
            position: "absolute",
            left: 28,
            top: 100,
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: 86,
            lineHeight: 1,
            color: KIRMIZI,
            rotate: "-3deg",
            whiteSpace: "nowrap",
          }}
        >
          BİZ YARIM
        </div>
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 40px rgba(150,100,20,0.35)" }} />
      </SayfaCerceve>

      {/* today's page and four blank pages on top of it: they flip over from frame 234 */}
      {[4, 3, 2, 1, 0].map((i) => {
        const bas = 234 + i * 3;
        const aci = interpolate(kare, [bas, bas + 9], [0, -176], { ...k, easing: Easing.bezier(0.4, 0, 0.6, 1) });
        const opak = interpolate(kare, [bas + 4, bas + 9], [1, 0], k);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "34px 50%",
              transform: `rotateY(${aci}deg)`,
              opacity: opak,
              backfaceVisibility: "hidden",
            }}
          >
            <SayfaCerceve renk="#FFFDF4">
              <SayfaCizgileri />
              {i === 0 ? (
                <>
                  <YaziSatiri kare={kare} bas={-10} bit={-1} top={34} soluk>
                    Zeynep – 1 çeyrek
                  </YaziSatiri>
                  <YaziSatiri kare={kare} bas={-10} bit={-1} top={86} soluk>
                    Ali Dayı – yarım
                  </YaziSatiri>
                  <YaziSatiri kare={kare} bas={146} bit={170} top={138}>
                    Kenan Amca – 1 çeyrek
                  </YaziSatiri>
                </>
              ) : null}
            </SayfaCerceve>
          </div>
        );
      })}

      {/* the closed cover, which swings open to the left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "0px 50%",
          transform: `rotateY(${kapakAci}deg)`,
          opacity: kapakOpak,
          backfaceVisibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: KIRMIZI,
            border: "6px solid #111111",
            borderRadius: 16,
            boxSizing: "border-box",
            boxShadow: "8px 10px 0 #111111",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 74,
            top: 52,
            width: 330,
            height: 150,
            backgroundColor: "#FFF6E6",
            border: "5px solid #111111",
            borderRadius: 10,
            boxSizing: "border-box",
            textAlign: "center",
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: 66,
            lineHeight: 1,
            color: MUREKKEP,
            paddingTop: 16,
          }}
        >
          TAKI
          <br />
          DEFTERİ
        </div>
        <div style={{ position: "absolute", left: 360, top: 200 }}>
          <SarCicek boyut={90} />
        </div>
      </div>
    </div>
  );
};

/* ---------- the couple (from behind) and the ribbon ---------- */

const Cift: React.FC<{ readonly kare: number }> = ({ kare }) => {
  const sallan = Math.sin(kare * 0.08) * 1.2;
  return (
    <>
      {/* groom: dark suit, black hair */}
      <div style={{ position: "absolute", left: 305, top: 200, rotate: `${-sallan}deg` }}>
        <Konuk size={250} sac="kisa" sacRengi="#1A1A1A" ten="#E8B08A" giysi="#26324D" arkadan />
      </div>
      {/* red ribbon on the groom */}
      <svg width={250} height={250} viewBox="0 0 200 200" style={{ position: "absolute", left: 305, top: 200 }}>
        <path d="M 30 140 L 54 146 L 50 210 L 24 210 Z" fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={4} strokeLinejoin="round" />
      </svg>
      {/* bride: white dress, hair bun and veil */}
      <div style={{ position: "absolute", left: 415, top: 200, rotate: `${sallan}deg` }}>
        <Konuk size={250} sac="topuz" sacRengi="#5A3A22" ten="#F6C29A" giysi="#FFFDF6" arkadan />
      </div>
      <svg width={250} height={250} viewBox="0 0 200 200" style={{ position: "absolute", left: 415, top: 200 }}>
        <path
          d="M 62 52 Q 100 22 138 52 L 170 196 L 30 196 Z"
          fill="white"
          opacity={0.55}
          stroke={MUREKKEP}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M 150 138 L 178 146 L 184 210 L 156 210 Z" fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={4} strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** A plain yellow round pin on the ribbon: no pattern, no inscription. */
const Pin: React.FC<{ readonly kare: number; readonly bas: number; readonly x: number; readonly y: number }> = ({
  kare,
  bas,
  x,
  y,
}) => {
  if (kare < bas) return null;
  const olcek = interpolate(kare, [bas, bas + 6], [0.2, 1], { ...k, easing: Easing.spring({ damping: 10 }) });
  return (
    <div style={{ position: "absolute", left: x - 19, top: y - 19, scale: olcek }}>
      <svg width={38} height={38} viewBox="0 0 38 38">
        <circle cx={19} cy={19} r={16} fill={SARI} stroke={MUREKKEP} strokeWidth={4.5} />
        <path d="M 12 13 Q 16 9 21 9" stroke="white" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      </svg>
    </div>
  );
};

const KONUK_TENLERI = ["#F6C29A", "#E8B08A", "#D99A6C", "#C98A5E", "#F0C9A8"];

type KuyrukKisi = {
  readonly sac: KonukSac;
  readonly sacRengi: string;
  readonly ten: string;
  readonly giysi: string;
  readonly biyik?: boolean;
  readonly gozluk?: boolean;
  readonly sal?: string;
};

const KENAN: KuyrukKisi = { sac: "kir", sacRengi: "#A9A39B", ten: "#E0A87C", giysi: "#7A4B2A", biyik: true };
const SEVIM: KuyrukKisi = { sac: "kisa", sacRengi: "#9A3B22", ten: "#F2C6A0", giysi: "#2A8C82", sal: KIRMIZI };
const ILKOKUL_AMCASI: KuyrukKisi = { sac: "kel", sacRengi: "#E8E4DC", ten: "#D99A6C", giysi: "#1E3FAE", gozluk: true };

const SLOT = [740, 850, 960];
const KUYRUK_Y = 450;
const KUYRUK_BOY = 150;

/** One queue guest: slides between the slots and (for the two named guests) pins a plain round piece on the ribbon. */
const KuyrukKonugu: React.FC<{
  readonly kisi: KuyrukKisi;
  readonly x: number;
  readonly opak: number;
  readonly kol: number;
  readonly yuru: boolean;
  readonly kare: number;
}> = ({ kisi, x, opak, kol, yuru, kare }) => {
  const zipla = yuru ? Math.abs(Math.sin(kare * 0.6)) * 8 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x - KUYRUK_BOY / 2,
        top: KUYRUK_Y - KUYRUK_BOY - zipla,
        opacity: opak,
      }}
    >
      <Konuk size={KUYRUK_BOY} {...kisi} kolUzat={kol} kirpmaGecikmesi={Math.round(x)} />
    </div>
  );
};

/** The coin the guest holds out until it lands on the ribbon. */
const ElindekiPara: React.FC<{ readonly kare: number; readonly bas: number; readonly bit: number; readonly x: number }> = ({
  kare,
  bas,
  bit,
  x,
}) => {
  if (kare < bas || kare >= bit) return null;
  return (
    <div style={{ position: "absolute", left: x - 17, top: KUYRUK_Y - 70, width: 34, height: 34 }}>
      <svg width={34} height={34} viewBox="0 0 38 38">
        <circle cx={19} cy={19} r={16} fill={SARI} stroke={MUREKKEP} strokeWidth={4.5} />
      </svg>
    </div>
  );
};

/** A leather handbag whose front hides the hand going in. */
const Canta: React.FC<{ readonly top: number }> = ({ top }) => (
  <div style={{ position: "absolute", left: 230, top, width: 200, height: 120 }}>
    <svg width={200} height={120} viewBox="0 0 200 120" style={{ overflow: "visible" }}>
      <path d="M 50 14 Q 100 -34 150 14" stroke={MUREKKEP} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M 50 14 Q 100 -34 150 14" stroke="#B5703A" strokeWidth={6} fill="none" strokeLinecap="round" />
      <rect x={6} y={14} width={188} height={110} rx={22} fill="#B5703A" stroke={MUREKKEP} strokeWidth={6} />
      <path d="M 10 50 Q 100 72 190 50" stroke={MUREKKEP} strokeWidth={5} fill="none" />
      <circle cx={100} cy={64} r={13} fill={SARI} stroke={MUREKKEP} strokeWidth={5} />
    </svg>
  </div>
);

/* ---------- scenes 1-5: the gift corner (frame = global frame) ---------- */

const SahneA: React.FC<{ readonly ofset?: number; readonly agizAcik?: boolean }> = ({ ofset = 0, agizAcik }) => {
  const yerel = useCurrentFrame();
  const f = yerel + ofset;
  const e = interpolate(f, [456, 462], [0, 1], { ...k, easing: Easing.bezier(0.6, 0, 0.8, 0.3) });
  const kayma = -PW * e;

  // ---- Nermin: who she is at each moment ----
  let ifade: Ifade = "mutlu";
  if (f >= 232 && f < 316) ifade = "saskin";
  if (f >= 426) ifade = "mutlu";
  const hesap = f >= 322 && f < 378;
  const yaziyor = (f >= 148 && f < 178) || (f >= 318 && f < 346);

  let elinde: "kalem" | "ceyrek" = "kalem";
  let kol = 0;
  if (f >= 378 && f < 388) kol = interpolate(f, [378, 386], [0, -0.4], k);
  if (f >= 388) {
    elinde = "ceyrek";
    kol = interpolate(f, [388, 410], [-0.4, 0.85], { ...k, easing: Easing.bezier(0.2, 0.7, 0.3, 1) });
  }
  const ayaga = interpolate(f, [380, 392], [0, 1], k);
  const yuru = interpolate(f, [412, 452], [0, 1], { ...k, easing: Easing.inOut(Easing.quad) });
  const yuruyor = yuru > 0 && yuru < 1;
  const nerminOlcek = (1 + 0.07 * ayaga) * (1 - 0.55 * yuru);
  const nerminX = 470 * yuru;
  const nerminY = -330 * yuru - (yuruyor ? Math.abs(Math.sin(f * 0.55)) * 12 : 0);

  // ---- queue ----
  const kenanBitis = interpolate(f, [164, 180], [0, 1], k);
  const kenanKol = interpolate(f, [124, 134, 150, 160], [0, 1, 1, 0], k);
  const sevimX = interpolate(f, [170, 196], [SLOT[1], SLOT[0]], { ...k, easing: Easing.inOut(Easing.quad) });
  const sevimBitis = interpolate(f, [250, 266], [0, 1], k);
  const sevimKol = interpolate(f, [214, 224, 236, 246], [0, 1, 1, 0], k);
  const ucuncuX =
    f < 250
      ? interpolate(f, [170, 196], [SLOT[2], SLOT[1]], { ...k, easing: Easing.inOut(Easing.quad) })
      : interpolate(f, [258, 282], [SLOT[1], SLOT[0]], { ...k, easing: Easing.inOut(Easing.quad) });
  const sevimGorunur = f >= 120;

  // ---- spotlight (scene 5) ----
  const spot = interpolate(f, [380, 392], [0, 1], k);
  const spotX = 230 + nerminX * 0.9;
  const spotY = 520 + nerminY * 0.9;

  const cantaTop = 810 - interpolate(f, [378, 388, 408, 420], [0, 112, 112, 0], k);

  return (
    <Pencere>
      <AbsoluteFill style={{ translate: `${kayma}px 0px` }}>
        <Duvar kare={f} />

        {/* the gift table: a red cloth with a yellow trim */}
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 450,
            width: 720,
            height: 40,
            backgroundColor: KIRMIZI,
            borderTop: "6px solid #111111",
            borderBottom: "6px solid #111111",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 300,
            top: 466,
            width: 720,
            height: 8,
            backgroundImage: "repeating-linear-gradient(90deg, #F7C600 0 22px, transparent 22px 40px)",
          }}
        />

        <Cift kare={f} />
        <Pin kare={f} bas={138} x={631} y={392} />
        <Pin kare={f} bas={230} x={633} y={428} />

        {/* queue: Kenan Amca, Sevim Teyze and a bald uncle with glasses */}
        <KuyrukKonugu kisi={ILKOKUL_AMCASI} x={ucuncuX} opak={1} kol={0} yuru={false} kare={f} />
        {sevimGorunur ? (
          <KuyrukKonugu
            kisi={SEVIM}
            x={sevimX}
            opak={1 - sevimBitis}
            kol={sevimKol}
            yuru={f >= 170 && f < 196}
            kare={f}
          />
        ) : null}
        <KuyrukKonugu kisi={KENAN} x={SLOT[0]} opak={1 - kenanBitis} kol={kenanKol} yuru={false} kare={f} />
        <ElindekiPara kare={f} bas={128} bit={138} x={655} />
        <ElindekiPara kare={f} bas={219} bit={230} x={655} />

        {/* Nermin Teyze, bust, bottom edge on the frame line */}
        <div
          style={{
            position: "absolute",
            left: -60,
            top: 230,
            translate: `${nerminX}px ${nerminY}px`,
            scale: nerminOlcek,
            transformOrigin: "50% 100%",
          }}
        >
          <NerminTeyze
            size={580}
            ifade={ifade}
            konusuyor={agizAcik ?? konusuyorMu(f)}
            telefonuYaklastiriyor={false}
            elinde={elinde}
            kolKaldir={kol}
            yaziyor={yaziyor}
            hesapYapiyor={hesap}
          />
        </div>

        <Canta top={cantaTop} />
        <DefterKarti kare={f} />

        {/* spotlight: the hall goes dark, Nermin stays lit */}
        <AbsoluteFill
          style={{
            opacity: spot,
            background: `radial-gradient(ellipse 230px 330px at ${spotX}px ${spotY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(25,12,35,0.62) 100%)`,
          }}
        />
      </AbsoluteFill>
    </Pencere>
  );
};

/* ---------- scenes 6-7: the hall turns round, 40 notebooks open ---------- */

const KONUK_RENKLERI = ["#1E3FAE", "#2A8C82", "#D9A400", "#4A4A5A", "#E86A8A", "#4C8C4A", "#E51C0F", "#7A4B2A"];
const KONUK_SACLARI = ["#2B2118", "#5A3A22", "#8C3B22", "#1A1A1A"];
const KONUK_SAC_TIPLERI: KonukSac[] = ["kisa", "uzun", "topuz", "kir", "dalga", "uzun", "kel", "kisa", "topuz", "dalga"];
const DEFTER_RENKLERI = ["#E51C0F", "#1E3FAE", "#2A8C82", "#F7C600", "#4A4A5A", "#E86A8A"];

type Misafir = {
  readonly x: number;
  readonly size: number;
  readonly bottom: number;
  readonly sac: KonukSac;
  readonly sacRengi: string;
  readonly ten: string;
  readonly giysi: string;
  readonly biyik: boolean;
  readonly gozluk: boolean;
  readonly cilt: string;
  readonly gecikme: number;
};

const SIRALAR = [
  { adet: 13, aralik: 78, x0: 24, size: 92, bottom: 262 },
  { adet: 12, aralik: 86, x0: 58, size: 108, bottom: 345 },
  { adet: 11, aralik: 94, x0: 20, size: 128, bottom: 458 },
  { adet: 9, aralik: 114, x0: 40, size: 152, bottom: 600 },
];

const MISAFIRLER: Misafir[] = (() => {
  const liste: Misafir[] = [];
  let n = 0;
  SIRALAR.forEach((sira, ri) => {
    for (let j = 0; j < sira.adet; j++) {
      const x = sira.x0 + j * sira.aralik + (ri % 2) * (sira.aralik / 2) + 40;
      n++;
      // Nermin and the two named guests cover the middle of the front row
      if (ri === 3 && Math.abs(x - 500) < 150) continue;
      const tip = KONUK_SAC_TIPLERI[(n * 7 + ri * 3) % KONUK_SAC_TIPLERI.length];
      const yasli = tip === "kir" || tip === "kel";
      liste.push({
        x,
        size: sira.size,
        bottom: sira.bottom,
        sac: tip,
        sacRengi: yasli ? (n % 2 === 0 ? "#A9A39B" : "#E8E4DC") : KONUK_SACLARI[(n * 5) % KONUK_SACLARI.length],
        ten: KONUK_TENLERI[(n * 3) % KONUK_TENLERI.length],
        giysi: KONUK_RENKLERI[(n * 5 + ri) % KONUK_RENKLERI.length],
        biyik: tip === "kir" || (tip === "kel" && n % 2 === 0),
        gozluk: n % 5 === 0,
        cilt: DEFTER_RENKLERI[(n * 3) % DEFTER_RENKLERI.length],
        // the wave runs from left to right: about 14 frames from one side to the other
        gecikme: Math.round((x / PW) * 14) + (n % 2),
      });
    }
  });
  return liste;
})();

const HizCizgileri: React.FC<{ readonly kare: number }> = ({ kare }) => {
  const g = interpolate(kare, [0, 2, 5, 7], [0, 1, 1, 0], k);
  if (g <= 0) return null;
  return (
    <>
      {[190, 430, 650].map((y, i) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: 90 + i * 40,
            top: y,
            width: 860 - i * 60,
            height: 12 + i * 3,
            borderRadius: 8,
            backgroundColor: i === 1 ? "#FFFFFF" : MUREKKEP,
            opacity: g * 0.8,
          }}
        />
      ))}
    </>
  );
};

const SahneB: React.FC = () => {
  const yerel = useCurrentFrame();
  const f = yerel + 456; // global frame
  const e = interpolate(yerel, [0, 6], [1, 0], { ...k, easing: Easing.bezier(0.2, 0.7, 0.4, 1) });
  const kayma = PW * e;

  const yaz1 = f >= 474 && f < 498;
  const yaz2 = f >= 618 && f < 652;

  // Nermin: coin up, then coin into the bag, then the bangle
  let elinde: "ceyrek" | "bilezik" = "ceyrek";
  let kol = 0.8;
  if (f >= 576 && f < 590) kol = interpolate(f, [576, 588], [0.8, -0.4], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  if (f >= 590) {
    elinde = "bilezik";
    kol = interpolate(f, [592, 614], [-0.4, 0.9], { ...k, easing: Easing.bezier(0.2, 0.7, 0.3, 1) });
  }
  const cantaY = interpolate(f, [572, 580, 624, 634], [140, 0, 0, 140], k);
  const ter = f >= 596;
  // she stays frozen at "saskin" for the whole scene; at the bangle she grins nervously
  const ifade: Ifade = f >= 592 ? "mutlu" : "saskin";

  const sevimDef = interpolate(f, [462 + 5, 462 + 8], [0, 1], k);
  const kenanDef = interpolate(f, [462 + 11, 462 + 14], [0, 1], k);
  const kenanPop = interpolate(f, [462 + 11, 462 + 16, 462 + 22], [0.7, 1.12, 1], { ...k, easing: Easing.bezier(0.2, 0.7, 0.3, 1) });

  return (
    <Pencere>
      <AbsoluteFill style={{ translate: `${kayma}px 0px` }}>
        <Duvar kare={f} />

        {MISAFIRLER.map((m, i) => {
          const d = interpolate(f, [462 + m.gecikme, 462 + m.gecikme + 3], [0, 1], k);
          return (
            <div key={i} style={{ position: "absolute", left: m.x - m.size / 2, top: m.bottom - m.size }}>
              <Konuk
                size={m.size}
                sac={m.sac}
                sacRengi={m.sacRengi}
                ten={m.ten}
                giysi={m.giysi}
                biyik={m.biyik}
                gozluk={m.gozluk}
                defter={d}
                defterRengi={m.cilt}
                yaziyor={yaz1 || yaz2}
                kirpmaGecikmesi={i * 5}
              />
            </div>
          );
        })}

        {/* Sevim Teyze: the thickest notebook, "NERMİN" on its cover */}
        <div style={{ position: "absolute", left: -40, top: 500, scale: 1 }}>
          <Konuk
            size={320}
            {...SEVIM}
            defter={sevimDef}
            defterRengi="#8A2A1A"
            kalinDefter={sevimDef > 0.05 ? "NERMİN" : undefined}
            yaziyor={yaz1 || yaz2}
            kirpmaGecikmesi={11}
          />
        </div>

        {/* Kenan Amca takes a small pocket notebook out of his jacket */}
        <div style={{ position: "absolute", left: 745, top: 552, scale: kenanPop, transformOrigin: "50% 100%" }}>
          <Konuk
            size={260}
            {...KENAN}
            defter={kenanDef}
            defterRengi="#2A2A2A"
            defterOlcek={0.8}
            yaziyor={yaz1 || yaz2}
            kirpmaGecikmesi={23}
          />
        </div>

        {/* Nermin Teyze, frozen, glasses on the tip of her nose, coin in the air */}
        <div style={{ position: "absolute", left: 280, top: 370 }}>
          <NerminTeyze
            size={440}
            ifade={ifade}
            konusuyor={konusuyorMu(f)}
            telefonuYaklastiriyor={false}
            elinde={elinde}
            kolKaldir={kol}
            ter={ter}
          />
        </div>
        <div style={{ position: "absolute", left: 560, top: 810 - 120 + cantaY, scale: 0.9, transformOrigin: "50% 100%" }}>
          <Canta top={0} />
        </div>
      </AbsoluteFill>
      <HizCizgileri kare={yerel} />
    </Pencere>
  );
};

/* ---------- on-screen texts ---------- */

type BlokProps = {
  readonly name: string;
  readonly kare?: number;
  readonly children: React.ReactNode;
  readonly golge?: string;
  readonly zemin?: string;
  readonly aci?: number;
  readonly top?: number;
  readonly left?: number;
  readonly width?: number;
  readonly cikis?: number;
};

const Blok: React.FC<BlokProps> = ({
  name,
  children,
  golge = "#111111",
  zemin = "#F7C600",
  aci = -3,
  top = 215,
  left = 110,
  width = 830,
  cikis,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const son = cikis ?? durationInFrames;
  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        left,
        top,
        width,
        boxSizing: "border-box",
        padding: "10px 16px 16px",
        backgroundColor: zemin,
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: `12px 14px 0 ${golge}`,
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 66,
        lineHeight: 1.02,
        letterSpacing: -1,
        textAlign: "center",
        color: "#111111",
        rotate: `${aci}deg`,
        scale:
          interpolate(frame, [0, 7], [0.5, 1], {
            ...k,
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }) * interpolate(frame, [son - 8, son], [1, 0.6], k),
        opacity: interpolate(frame, [0, 2], [0, 1], k) * interpolate(frame, [son - 6, son], [1, 0], k),
      }}
    >
      {children}
    </Interactive.Div>
  );
};

const KancaYazisi: React.FC = () => (
  <Blok name="Kanca yazısı" cikis={198}>
    DÜĞÜNDE
    <br />
    <span style={{ fontSize: 112, color: KIRMIZI }}>TAKI DEFTERİ</span>
  </Blok>
);

const YarimYazisi: React.FC = () => (
  <Blok name="1996: biz yarım" zemin="#FFFFFF" golge={MAVI} aci={2}>
    <span style={{ fontSize: 110, color: KIRMIZI }}>1996:</span>
    <br />
    BİZ YARIM TAKMIŞTIK
  </Blok>
);

const KaydedildiYazisi: React.FC = () => (
  <Blok name="Sevim: kaydedildi" zemin="#FFFFFF" golge={KIRMIZI} aci={-2}>
    <span style={{ fontSize: 112 }}>SEVİM:</span>
    <br />
    <span style={{ fontSize: 96, color: KIRMIZI }}>KAYDEDİLDİ</span>
  </Blok>
);

const PunchlineYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  const sars = interpolate(frame, [0, 3, 6, 10], [0, 9, -6, 0], k);
  return (
    <Interactive.Div
      name="Punchline: herkes defter tutuyor"
      style={{
        position: "absolute",
        left: 80,
        top: 205,
        width: 920,
        boxSizing: "border-box",
        padding: "6px 10px 16px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "14px 16px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 92,
        lineHeight: 1.02,
        letterSpacing: -2,
        textAlign: "center",
        color: "#111111",
        rotate: `${-2 + sars * 0.2}deg`,
        translate: `${sars}px 0px`,
        scale: interpolate(frame, [0, 8], [0.4, 1], { ...k, easing: Easing.spring({ damping: 9 }), output: "perceptual-scale" }),
        opacity: interpolate(frame, [0, 2], [0, 1], k) * interpolate(frame, [104, 111], [1, 0], k),
      }}
    >
      <span style={{ fontSize: 176, color: KIRMIZI, display: "block", lineHeight: 0.98 }}>HERKES</span>
      DEFTER TUTUYOR.
    </Interactive.Div>
  );
};

const BilezikYazisi: React.FC = () => (
  <Blok name="Nermin: bilezik" zemin="#FFFFFF" golge={MAVI} aci={2} top={235}>
    <span style={{ fontSize: 80 }}>NERMİN:</span>
    <br />
    <span style={{ fontSize: 96, color: KIRMIZI }}>
      BİLEZİK
      <Tik renk="#2A8C4A" boyut={84} />
    </span>
  </Blok>
);

/* ---------- scene 8: the cover ---------- */

const KapakKaresi: React.FC = () => {
  const frame = useCurrentFrame();
  const cilt = ["#1E3FAE", "#F3EBDD", "#2A8C82", "#F7C600", "#4A4A5A", "#E86A8A", "#F3EBDD", "#1E3FAE", "#2A8C82", "#F7C600", "#4A4A5A"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#E51C0F" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 22%, transparent 24%)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(circle at 50% 100%, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 100%, black 0%, transparent 70%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,240,210,0.16) 1px, transparent 1.4px)",
          backgroundSize: "7px 7px",
        }}
      />
      {/* a fan of notebooks behind her */}
      {cilt.map((c, i) => {
        const aci = -62 + i * 12.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - 105,
              top: 1130 - 330,
              width: 210,
              height: 330,
              backgroundColor: c,
              border: "7px solid #111111",
              borderRadius: 14,
              boxSizing: "border-box",
              boxShadow: "6px 8px 0 #111111",
              transformOrigin: "50% 100%",
              rotate: `${aci}deg`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 36,
                width: 138,
                height: 70,
                backgroundColor: "#FFF6E6",
                border: "5px solid #111111",
                borderRadius: 8,
                boxSizing: "border-box",
              }}
            />
            <div style={{ position: "absolute", left: 120, top: 230 }}>
              <SarCicek boyut={60} />
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 150, top: 1450 - 780 }}>
        <NerminTeyze
          size={780}
          ifade="saskin"
          konusuyor={false}
          telefonuYaklastiriyor={false}
          elinde="ceyrek"
          kolKaldir={0.75}
        />
      </div>
      <Interactive.Div
        name="Kapak: herkesin"
        style={{
          position: "absolute",
          left: 120,
          top: 250,
          width: 840,
          boxSizing: "border-box",
          padding: "6px 16px 14px",
          backgroundColor: "#F7C600",
          border: "9px solid #111111",
          borderRadius: 20,
          boxShadow: "14px 16px 0 #111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 170,
          lineHeight: 1.0,
          letterSpacing: -3,
          textAlign: "center",
          color: "#111111",
          rotate: "-3deg",
          scale: interpolate(frame, [0, 6], [0.7, 1], { ...k, easing: Easing.spring({ damping: 11 }), output: "perceptual-scale" }),
        }}
      >
        HERKESİN
      </Interactive.Div>
      <Interactive.Div
        name="Kapak: defteri var"
        style={{
          position: "absolute",
          left: 90,
          top: 470,
          width: 900,
          boxSizing: "border-box",
          padding: "6px 16px 14px",
          backgroundColor: "#F7C600",
          border: "9px solid #111111",
          borderRadius: 20,
          boxShadow: "14px 16px 0 #111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 134,
          lineHeight: 1.0,
          letterSpacing: -3,
          textAlign: "center",
          color: "#E51C0F",
          rotate: "2deg",
          scale: interpolate(frame, [2, 8], [0.7, 1], { ...k, easing: Easing.spring({ damping: 11 }), output: "perceptual-scale" }),
        }}
      >
        DEFTERİ VAR
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/* ---------- the composition ---------- */

/** Scene 7b: the table pose from just before frame 0 (loop). */
const SahneASon: React.FC = () => {
  const f = useCurrentFrame();
  return <SahneA ofset={-12} agizAcik={f < 7} />;
};

export const Video07DugunTakiDefteri: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <PaperBackground />

      <Track name="Sahneler">
        <Sequence name="1-5 Takı noktası: Kenan, Sevim, Nermin kalkar" durationInFrames={456}>
          <SahneA />
        </Sequence>
        <Sequence name="6-7 Ters dönüş: salon defter açar, bilezik" from={456} durationInFrames={192}>
          {/* the last frames of the gift corner slide out while the hall slides in (whip-pan) */}
          <Sequence name="Whip-pan: takı noktası çıkar" from={-456} durationInFrames={462} layout="none">
            <SahneA />
          </Sequence>
          <SahneB />
        </Sequence>
        <Sequence name="7b Döngü: masaya dön" from={648} durationInFrames={12}>
          <SahneASon />
        </Sequence>
        <Sequence name="8 Kapak karesi" from={660} durationInFrames={24}>
          <KapakKaresi />
        </Sequence>
      </Track>

      <Track name="Ekran yazıları">
        <Sequence name="Kanca" from={3} durationInFrames={198}>
          <KancaYazisi />
        </Sequence>
        <Sequence name="1996: biz yarım" from={240} durationInFrames={72}>
          <YarimYazisi />
        </Sequence>
        <Sequence name="Sevim: kaydedildi" from={322} durationInFrames={56}>
          <KaydedildiYazisi />
        </Sequence>
        <Sequence name="Punchline" from={513} durationInFrames={111}>
          <PunchlineYazisi />
        </Sequence>
        <Sequence name="Nermin: bilezik" from={630} durationInFrames={18}>
          <BilezikYazisi />
        </Sequence>
      </Track>

      {/* Announcer: grey and italic. Nermin: white with a blue shadow. The question is bigger, "defteri var?" stays yellow. */}
      <ShortsCaptions
        name="Altyazı: sunucu"
        durationInFrames={648}
        beklemeMs={400}
        birlestirmeMs={1500}
        renk="#D4D4D4"
        style={{ position: "absolute", top: 1285, left: 90, width: 900, fontSize: 76, fontStyle: "italic" }}
        captions={[
          { text: "Kenan", startMs: 3200, endMs: 3566, timestampMs: null, confidence: null },
          { text: " Amca'dan", startMs: 3566, endMs: 4114, timestampMs: null, confidence: null },
          { text: " bir", startMs: 4114, endMs: 4358, timestampMs: null, confidence: null },
          { text: " çeyrek!", startMs: 4358, endMs: 4784, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: "Sevim", startMs: 6400, endMs: 6763, timestampMs: null, confidence: null },
          { text: " Teyze'den", startMs: 6763, endMs: 7367, timestampMs: null, confidence: null },
          { text: " bir", startMs: 7367, endMs: 7609, timestampMs: null, confidence: null },
          { text: " çeyrek!", startMs: 7609, endMs: 8032, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: "Sıra", startMs: 12800, endMs: 13126, timestampMs: null, confidence: null },
          { text: " Nermin", startMs: 13126, endMs: 13582, timestampMs: null, confidence: null },
          { text: " Teyze'de!", startMs: 13582, endMs: 14168, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />
      <ShortsCaptions
        name="Altyazı: Nermin"
        durationInFrames={648}
        beklemeMs={400}
        birlestirmeMs={1500}
        style={{ position: "absolute", top: 1285, left: 90, width: 900, fontSize: 76, textShadow: "0 8px 0 #1E3FAE" }}
        captions={[
          { text: "Kim", startMs: 300, endMs: 573, timestampMs: null, confidence: null },
          { text: " ne", startMs: 573, endMs: 777, timestampMs: null, confidence: null },
          { text: " taktı,", startMs: 777, endMs: 1186, timestampMs: null, confidence: null },
          { text: " hepsini", startMs: 1186, endMs: 1731, timestampMs: null, confidence: null },
          { text: " yazıyorum.", startMs: 1731, endMs: 2412, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: "Yazdım.", startMs: 5200, endMs: 5992, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: "Biz", startMs: 8200, endMs: 8449, timestampMs: null, confidence: null },
          { text: " onun", startMs: 8449, endMs: 8760, timestampMs: null, confidence: null },
          { text: " oğluna", startMs: 8760, endMs: 9196, timestampMs: null, confidence: null },
          { text: " yarım", startMs: 9196, endMs: 9569, timestampMs: null, confidence: null },
          { text: " takmıştık!", startMs: 9569, endMs: 10192, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: "Not", startMs: 10600, endMs: 10965, timestampMs: null, confidence: null },
          { text: " ettim.", startMs: 10965, endMs: 11512, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: "Çeyrek", startMs: 19600, endMs: 20104, timestampMs: null, confidence: null },
          { text: " değil…", startMs: 20104, endMs: 20536, timestampMs: null, confidence: null },
          { text: " bilezik", startMs: 20536, endMs: 21112, timestampMs: null, confidence: null },
          { text: " takıyorum!", startMs: 21112, endMs: 21832, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />
      <ShortsCaptions
        name="Altyazı: Herkesin mi defteri var?"
        durationInFrames={648}
        beklemeMs={500}
        birlestirmeMs={1500}
        vurguKelimeler={["defteri", "var"]}
        style={{ position: "absolute", top: 1270, left: 90, width: 900, fontSize: 92, textShadow: "0 8px 0 #1E3FAE" }}
        captions={[
          { text: "Herkesin", startMs: 15500, endMs: 16058, timestampMs: null, confidence: null },
          { text: " mi", startMs: 16058, endMs: 16244, timestampMs: null, confidence: null },
          { text: " defteri", startMs: 16244, endMs: 16740, timestampMs: null, confidence: null },
          { text: " var?", startMs: 16740, endMs: 16988, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />

      <LogoBadge name="Logo" durationInFrames={durationInFrames} style={{ position: "absolute", top: 100, left: 80 }} />

      {/* The voice files have no leading silence: each starts on its line's first word. */}
      <Track name="Seslendirme">
        <Audio name="01 Nermin: Kim ne taktı" src={staticFile("voice/07-dugun/01-nermin-teyze.mp3")} volume={0.9} from={9} />
        <Audio name="02 Sunucu: Kenan Amca'dan" src={staticFile("voice/07-dugun/02-anlatici.mp3")} volume={0.9} from={96} />
        <Audio name="03 Nermin: Yazdım" src={staticFile("voice/07-dugun/03-nermin-teyze.mp3")} volume={0.9} from={156} />
        <Audio name="04 Sunucu: Sevim Teyze'den" src={staticFile("voice/07-dugun/04-anlatici.mp3")} volume={0.9} from={192} />
        <Audio name="05 Nermin: Biz yarım takmıştık" src={staticFile("voice/07-dugun/05-nermin-teyze.mp3")} volume={0.9} from={246} />
        <Audio name="06 Nermin: Not ettim" src={staticFile("voice/07-dugun/06-nermin-teyze.mp3")} volume={0.9} from={318} />
        <Audio name="07 Sunucu: Sıra Nermin Teyze'de" src={staticFile("voice/07-dugun/07-anlatici.mp3")} volume={0.9} from={384} />
        <Audio name="08 Nermin: Herkesin mi defteri var" src={staticFile("voice/07-dugun/08-nermin-teyze.mp3")} volume={0.9} from={465} />
        <Audio name="09 Nermin: Çeyrek değil, bilezik" src={staticFile("voice/07-dugun/09-nermin-teyze.mp3")} volume={0.9} from={588} />
      </Track>

      <Track name="Ses efektleri">
        {/* the hall murmur, low and continuous */}
        <Audio
          name="Salon uğultusu"
          src={staticFile("sfx/salon-ugultu.wav")}
          loop
          volume={(f) => interpolate(f, [0, 12, 640, 660], [0, 0.1, 0.1, 0], k)}
        />
        {/* scene 1: the pen clicks */}
        <Audio name="Kalem çıt" src={staticFile("sfx/tik.wav")} from={12} volume={0.5} />
        {/* scene 2: Kenan pins, Nermin writes */}
        <Audio name="İğne (Kenan)" src={staticFile("sfx/tik.wav")} from={138} volume={0.5} />
        <Audio name="Kalem cızırtısı (Kenan)" src={staticFile("sfx/kalem-ciziltisi.wav")} from={148} volume={0.5} />
        {/* scene 3: Sevim pins, pages fly, soft hit */}
        <Audio name="İğne (Sevim)" src={staticFile("sfx/tik.wav")} from={230} volume={0.5} />
        <Audio name="Sayfa çevirme" src={staticFile("sfx/hizli-sar.wav")} from={234} volume={0.5} />
        <Audio name="Sayfa durur" src={staticFile("sfx/hit.mp3")} from={258} durationInFrames={20} volume={0.25} />
        {/* scene 4: two red strokes */}
        <Audio name="Kırmızı çizgi 1" src={staticFile("sfx/kalem-ciziltisi.wav")} from={320} durationInFrames={9} volume={0.5} />
        <Audio name="Kırmızı çizgi 2" src={staticFile("sfx/kalem-ciziltisi.wav")} from={332} durationInFrames={9} volume={0.5} />
        {/* scene 5: the spotlight tension */}
        <Audio
          name="Gerilim"
          src={staticFile("sfx/riser.mp3")}
          from={390}
          durationInFrames={66}
          volume={(f) => interpolate(f, [0, 6, 56, 66], [0, 0.35, 0.35, 0], k)}
        />
        {/* scene 6: whip-pan, 40 notebooks open, pens tick */}
        <Audio name="Whip-pan" src={staticFile("sfx/whoosh.mp3")} from={453} durationInFrames={14} volume={0.4} />
        <Audio name="Defterler açılır" src={staticFile("sfx/defter-dalgasi.wav")} from={462} volume={0.55} />
        <Audio name="Kalem 1" src={staticFile("sfx/tik.wav")} from={474} volume={0.4} />
        <Audio name="Kalem 2" src={staticFile("sfx/tik.wav")} from={478} volume={0.4} />
        <Audio name="Kalem 3" src={staticFile("sfx/tik.wav")} from={481} volume={0.4} />
        <Audio name="Kalem 4" src={staticFile("sfx/tik.wav")} from={485} volume={0.4} />
        <Audio name="Kalem 5" src={staticFile("sfx/tik.wav")} from={488} volume={0.4} />
        <Audio name="Kalem 6" src={staticFile("sfx/tik.wav")} from={492} volume={0.4} />
        <Audio name="Punchline vuruşu" src={staticFile("sfx/hit.mp3")} from={513} durationInFrames={26} volume={0.5} />
        {/* scene 7: the bag, the bangle, everyone writes */}
        <Audio name="Çanta" src={staticFile("sfx/soft-whoosh.wav")} from={576} volume={0.35} />
        <Audio name="Bilezik" src={staticFile("sfx/success.wav")} from={630} volume={0.45} />
        <Audio name="Kalemler yazar 1" src={staticFile("sfx/kalem-ciziltisi.wav")} from={638} volume={0.4} />
        <Audio name="Kalemler yazar 2" src={staticFile("sfx/kalem-ciziltisi.wav")} from={643} volume={0.35} />
        <Audio name="Kalemler yazar 3" src={staticFile("sfx/kalem-ciziltisi.wav")} from={648} volume={0.3} />
        {/* scene 7b / 8: back to the table, then the cover */}
        <Audio name="Masaya dön" src={staticFile("sfx/soft-whoosh.wav")} from={648} volume={0.3} />
        <Audio name="Kapak" src={staticFile("sfx/logo-hit.wav")} from={660} volume={0.5} />
      </Track>
    </>
  );
};
