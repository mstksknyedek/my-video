import { Audio } from "@remotion/media";
import { useId } from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  interpolateColors,
  Sequence,
  staticFile,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../fonts";
import { BODY_FONT, HEADLINE_FONT } from "../fonts";
import { Ifade, KIRMIZI, MUREKKEP, SARI } from "../karakterler/animasyon";
import { Kazim } from "../karakterler/Kazim";
import { LogoBadge } from "../LogoBadge";
import { ShortsCaptions } from "../ShortsCaptions";

// Video #6 "Karınca olarak doğdun" (script strategy/senaryolar/06-karinca-olarak-dogdun.md), 1080x1920, 30 fps, 23 s.
// Timed to the real voiceover in public/voice/06-karinca (leading silence trimmed, each <Audio> starts on its
// line's first word). Kazım is a guest; the narrator (Orus) is off screen.
//
// Scene starts (frame / s): 1 hook, the cocoon cracks 0 / 0.0 · 2 "GÜNDE 250 UYKU!" mat + sleep counter 90 / 3.0 ·
// 3 "kötü haber" giant hourglass 186 / 6.2 · 4 three fast sleeps 270 / 9.0 · 5 "Beş dakika daha…" 390 / 13.0 ·
// 6 giant alarm clock + punchline 474 / 15.8 (punchline block 528 / 17.6) · 7 cover 582 / 19.4 ·
// 8 "Günaydın… yine." 600 / 20.0 · end 690 / 23.0.
// Loop: the last frames shrink the mat wrap into the cream cocoon of frame 0 (same place, same size, the
// shake carries on across the loop point), the sleep badge and the clock are gone, so the cocoon cracks again.
//
// Layout: logo y 100-195 (left) · sleep badge y 100-195 (right) · screen text y 215-430 · scene y 440-1262 ·
// source line y ~1300 · captions y 1340-1440.

const CREAM = "#F3EBDD";
const SIYAH = MUREKKEP;
const MAVI_SILTE = "#3F63D6";
const TOPRAK = "#9C6B43";
const TUNEL = "#E8CDA0";
const TUNEL_KENAR = "#4B2F1C";

const K = { left: 230, top: 692, size: 620 } as const; // Kazım's box (feet on y 1250)

const KL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Piecewise-linear value of `f` through [frame, value] keyframes. */
const anahtar = (f: number, pts: [number, number][]) =>
  interpolate(
    f,
    pts.map((p) => p[0]),
    pts.map((p) => p[1]),
    KL,
  );

/* ---------- Kazım's day, as a function of the absolute frame ---------- */

// 0 standing, 1 asleep on the mat
const UYKU: [number, number][] = [
  [0, 0], [114, 0], [122, 1], [214, 1], [220, 0], [270, 0], [276, 1], [300, 1], [304, 0], [318, 0], [324, 1],
  [336, 1], [340, 0], [350, 0], [356, 1], [372, 1], [376, 0], [382, 1], [388, 0], [393, 1], [474, 1], [478, 0], [690, 0],
];
// the three fast rounds: standing + carrying a crumb
const KIRINTI_ARALIKLARI: [number, number][] = [
  [300, 318],
  [340, 350],
  [376, 392],
];
const kirintiVar = (f: number) => KIRINTI_ARALIKLARI.some(([a, b]) => f >= a && f < b);
// alarm clock rings: [first frame, last frame)
const CALMA: [number, number][] = [
  [294, 306],
  [330, 342],
  [366, 378],
];
const calarMi = (f: number) => CALMA.some(([a, b]) => f >= a && f < b);

const hop = (f: number, s: number, h: number) => interpolate(f, [s, s + 4, s + 11], [0, -h, 0], KL);

/** Vertical offset of Kazım: the jump out of the cocoon, small hops on waking, the big start at the giant alarm. */
const kazimY = (f: number) =>
  interpolate(f, [14, 22], [0, -190], { ...KL, easing: Easing.out(Easing.quad) }) +
  interpolate(f, [22, 34], [0, 190], { ...KL, easing: Easing.in(Easing.quad) }) +
  interpolate(f, [34, 38, 42], [0, -14, 0], KL) +
  hop(f, 300, 26) +
  hop(f, 336, 26) +
  hop(f, 372, 26) +
  hop(f, 474, 120);

const kazimIfade = (f: number): Ifade => {
  if (f < 34) return "saskin";
  if (f < 216) return "mutlu";
  if (f < 318) return "saskin";
  if (f < 474) return "sinirli";
  if (f < 582) return "saskin";
  return "uzgun";
};

// frames in which Kazım's voice plays (from zamanlama.json)
const KAZIM_SESI: [number, number][] = [
  [300, 336],
  [396, 436],
  [612, 648],
];

/** The sleep counter: [frame, value] keyframes. */
const uykuSayisi = (f: number) =>
  Math.round(
    f < 372
      ? f < 294
        ? 0
        : f < 330
          ? 1
          : f < 366
            ? 2
            : 3
      : f < 405
        ? interpolate(f, [372, 405], [3, 249], { ...KL, easing: Easing.out(Easing.quad) })
        : f < 482
          ? 249
          : f < 618
            ? 250
            : 1,
  );

/* ---------- the nest ---------- */

const DALGA = (y: number, g: number, amp: number) =>
  `M 0 ${y} Q 135 ${y - amp} 270 ${y} T 540 ${y} T 810 ${y} T 1080 ${y} L 1080 ${y + g} Q 945 ${y + g + amp} 810 ${y + g} T 540 ${y + g} T 270 ${y + g} T 0 ${y + g} Z`;

// fixed pebbles in the soil (outside the chamber), from a tiny seeded generator
const TASLAR: [number, number, number][] = (() => {
  let s = 7;
  const r = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const out: [number, number, number][] = [];
  while (out.length < 70) {
    const x = r() * 1080;
    const y = 90 + r() * 1830;
    const odada = x > 20 && x < 1060 && y > 440 && y < 1290;
    const koridorda = y > 1460 && y < 1580;
    const kanca = (x < 340 && y < 210) || (y < 450 && x > 480);
    if (odada || koridorda || kanca) continue;
    out.push([x, y, 5 + r() * 12]);
  }
  return out;
})();

/** A blurred worker-ant silhouette, 100x50 at scale 1. */
const KarincaSiluet: React.FC<{ readonly x: number; readonly y: number; readonly olcek: number; readonly sola?: boolean; readonly aci?: number }> = ({
  x,
  y,
  olcek,
  sola = false,
  aci = 0,
}) => (
  <svg
    width={100 * olcek}
    height={50 * olcek}
    viewBox="0 0 100 50"
    style={{ position: "absolute", left: x, top: y, opacity: 0.4, rotate: `${aci}deg`, scale: sola ? "-1 1" : "1 1" }}
  >
    <g stroke="#2B1A10" strokeWidth={3} strokeLinecap="round" fill="none">
      <path d="M 40 30 L 30 46 M 48 31 L 48 48 M 56 30 L 66 46 M 40 26 L 28 12 M 62 26 L 76 14" />
      <path d="M 74 22 Q 84 6 94 8 M 76 24 Q 90 14 98 20" />
    </g>
    <circle cx={22} cy={28} r={15} fill="#2B1A10" />
    <circle cx={46} cy={28} r={9} fill="#2B1A10" />
    <circle cx={68} cy={26} r={11} fill="#2B1A10" />
  </svg>
);

/** The nest cross-section: soil strata, a tan chamber, a shaft to the surface, side tunnels, a corridor below. */
const YuvaArkaPlan: React.FC = () => {
  const frame = useCurrentFrame();
  // silhouettes move with a speed that makes their path repeat exactly every 690 frames (the loop)
  const yatay = (frame * 2) % 1380;
  const dusey = (frame * 1.3913) % 480;
  return (
    <AbsoluteFill style={{ backgroundColor: TOPRAK }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {/* soil strata */}
        <path d={DALGA(210, 120, 16)} fill="#8A5B38" />
        <path d={DALGA(560, 70, 18)} fill="#B07A4D" opacity={0.7} />
        <path d={DALGA(1330, 90, 16)} fill="#8A5B38" />
        <path d={DALGA(1620, 80, 20)} fill="#B07A4D" opacity={0.7} />
        <path d={DALGA(1790, 140, 16)} fill="#7A4D2D" />
        {TASLAR.map(([x, y, r]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#C9A06A" stroke="#6E4528" strokeWidth={3} />
        ))}
        {/* grass strip on the surface */}
        <path d="M 0 0 L 1080 0 L 1080 58 Q 1020 80 960 56 T 840 58 T 720 56 T 600 60 T 480 56 T 360 58 T 240 56 T 120 60 T 0 56 Z" fill="#5E9A3C" stroke={TUNEL_KENAR} strokeWidth={6} />
        {/* shaft to the surface (right edge) and the corridors */}
        <rect x={956} y={50} width={94} height={440} fill={TUNEL} stroke={TUNEL_KENAR} strokeWidth={8} />
        <rect x={-20} y={1476} width={1120} height={86} rx={30} fill={TUNEL} stroke={TUNEL_KENAR} strokeWidth={8} />
        <rect x={-20} y={1690} width={700} height={70} rx={26} fill={TUNEL} stroke={TUNEL_KENAR} strokeWidth={8} />
        <rect x={190} y={1540} width={80} height={170} fill={TUNEL} stroke={TUNEL_KENAR} strokeWidth={8} />
        {/* the chamber */}
        <rect x={60} y={470} width={960} height={792} rx={120} ry={120} fill={TUNEL} stroke={TUNEL_KENAR} strokeWidth={12} />
        <rect x={72} y={482} width={936} height={150} rx={110} fill="#C9A06A" opacity={0.55} />
        <rect x={66} y={1236} width={948} height={26} fill="#C9A06A" />
        <path d="M 66 1236 L 1014 1236" stroke={TUNEL_KENAR} strokeWidth={5} />
        {/* side tunnels into the chamber */}
        <rect x={-30} y={1090} width={110} height={160} rx={50} fill="#4A2D1A" stroke={TUNEL_KENAR} strokeWidth={8} />
        <rect x={1000} y={980} width={110} height={160} rx={50} fill="#4A2D1A" stroke={TUNEL_KENAR} strokeWidth={8} />
        {/* paper grain */}
      </svg>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(60,35,15,0.10) 1px, transparent 1.4px)",
          backgroundSize: "11px 11px",
        }}
      />
      {/* the crowd: blurred silhouettes in the corridors and the shaft */}
      <div style={{ position: "absolute", left: 0, top: 0, filter: "blur(1.5px)" }}>
        <KarincaSiluet x={yatay - 160} y={1496} olcek={1.1} />
        <KarincaSiluet x={((yatay + 700) % 1380) - 160} y={1496} olcek={0.9} />
        <KarincaSiluet x={1160 - ((yatay + 300) % 1380)} y={1706} olcek={1} sola />
        <KarincaSiluet x={960} y={dusey + 60} olcek={0.9} aci={90} />
        <KarincaSiluet x={990} y={((dusey + 240) % 480) + 60} olcek={0.8} aci={90} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- props ---------- */

/** Giant hourglass: yellow frame, blue sand. `akis` 0 (all sand on top) .. 1 (all sand at the bottom). viewBox 200x300. */
const KumSaati: React.FC<{ readonly genislik: number; readonly akis: number }> = ({ genislik, akis }) => {
  const id = useId().replace(/:/g, "");
  const cam = "M 42 38 L 158 38 C 158 100 116 130 106 150 C 116 170 158 200 158 262 L 42 262 C 42 200 84 170 94 150 C 84 130 42 100 42 38 Z";
  const ustSeviye = 38 + 112 * akis;
  const altSeviye = 262 - 112 * akis;
  return (
    <svg width={genislik} height={(genislik * 300) / 200} viewBox="0 0 200 300" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <clipPath id={`cam-${id}`}>
          <path d={cam} />
        </clipPath>
      </defs>
      <path d={cam} fill="#FFFFFF" fillOpacity={0.55} />
      <g clipPath={`url(#cam-${id})`}>
        <rect x={0} y={ustSeviye} width={200} height={Math.max(0, 150 - ustSeviye)} fill="#1E3FAE" />
        <rect x={0} y={altSeviye} width={200} height={Math.max(0, 262 - altSeviye)} fill="#1E3FAE" />
        <path d="M 60 56 Q 56 90 84 120" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.6} />
      </g>
      {akis > 0.02 && akis < 0.98 ? <rect x={98} y={146} width={5} height={Math.max(0, altSeviye - 146)} fill="#1E3FAE" /> : null}
      <path d={cam} fill="none" stroke={SIYAH} strokeWidth={8} strokeLinejoin="round" />
      <rect x={18} y={12} width={164} height={28} rx={10} fill={SARI} stroke={SIYAH} strokeWidth={8} />
      <rect x={18} y={260} width={164} height={28} rx={10} fill={SARI} stroke={SIYAH} strokeWidth={8} />
      <rect x={24} y={38} width={12} height={224} fill={SARI} stroke={SIYAH} strokeWidth={6} />
      <rect x={164} y={38} width={12} height={224} fill={SARI} stroke={SIYAH} strokeWidth={6} />
    </svg>
  );
};

/** Alarm clock: red body, two yellow bells. `cal` shakes it and draws the ring lines. viewBox 300x300. */
const CalarSaat: React.FC<{ readonly genislik: number; readonly cal: boolean }> = ({ genislik, cal }) => {
  const frame = useCurrentFrame();
  const sal = cal ? (Math.floor(frame / 2) % 2 === 0 ? -9 : 9) : 0;
  const yay = cal ? Math.floor(frame / 3) % 2 : 0;
  return (
    <svg width={genislik} height={genislik} viewBox="0 0 300 300" style={{ display: "block", overflow: "visible" }}>
      <g transform={`rotate(${sal} 150 270)`}>
        <path d="M 96 268 L 70 296 M 204 268 L 230 296" stroke={SIYAH} strokeWidth={14} strokeLinecap="round" />
        <circle cx={92} cy={46} r={40} fill={SARI} stroke={SIYAH} strokeWidth={8} />
        <circle cx={208} cy={46} r={40} fill={SARI} stroke={SIYAH} strokeWidth={8} />
        <path d="M 150 36 L 150 70" stroke={SIYAH} strokeWidth={12} strokeLinecap="round" />
        <circle cx={150} cy={170} r={116} fill={KIRMIZI} stroke={SIYAH} strokeWidth={9} />
        <circle cx={150} cy={170} r={88} fill="#FFFFFF" stroke={SIYAH} strokeWidth={7} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={150 + Math.sin(a) * 72}
              y1={170 - Math.cos(a) * 72}
              x2={150 + Math.sin(a) * 82}
              y2={170 - Math.cos(a) * 82}
              stroke={SIYAH}
              strokeWidth={i % 3 === 0 ? 7 : 4}
              strokeLinecap="round"
            />
          );
        })}
        <path d="M 150 170 L 150 112 M 150 170 L 104 196" stroke={SIYAH} strokeWidth={9} strokeLinecap="round" />
        <circle cx={150} cy={170} r={9} fill={SIYAH} />
        {cal ? (
          <g stroke={SIYAH} strokeWidth={9} strokeLinecap="round" fill="none" opacity={yay ? 1 : 0.55}>
            <path d="M 18 120 Q 4 150 18 180" />
            <path d="M 282 120 Q 296 150 282 180" />
            <path d="M 40 84 L 12 66 M 260 84 L 288 66" />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

/** The unrolled blue mat on the floor. `acik` 0..1 is how far it has unrolled from the left. */
const Silte: React.FC<{ readonly acik: number }> = ({ acik }) => {
  const id = useId().replace(/:/g, "");
  const ucu = 130 + acik * 820;
  return (
    <svg width={1080} height={120} viewBox="0 0 1080 120" style={{ position: "absolute", left: 0, top: 1196, overflow: "visible" }}>
      <defs>
        <clipPath id={`silte-${id}`}>
          <rect x={0} y={0} width={ucu} height={120} />
        </clipPath>
      </defs>
      <g clipPath={`url(#silte-${id})`}>
        <rect x={130} y={34} width={820} height={46} rx={22} fill={MAVI_SILTE} stroke={SIYAH} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${200 + i * 100} 42 L ${200 + i * 100} 72`} stroke="#7C97EE" strokeWidth={9} strokeLinecap="round" />
        ))}
      </g>
      {acik < 1 ? (
        <g>
          <circle cx={ucu} cy={57} r={30} fill="#1E3FAE" stroke={SIYAH} strokeWidth={7} />
          <path d={`M ${ucu} 57 m -10 0 a 10 10 0 1 1 10 10 a 20 20 0 1 1 -20 -20`} stroke="#7C97EE" strokeWidth={5} fill="none" />
        </g>
      ) : null}
    </svg>
  );
};

/** Floating Z letters while Kazım sleeps. */
const Zzz: React.FC<{ readonly gorunur: number }> = ({ gorunur }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const p = ((frame + i * 14) % 42) / 42;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 770 + i * 44 + p * 30,
              top: 900 - i * 70 - p * 110,
              fontFamily: HEADLINE_FONT,
              fontWeight: 700,
              fontSize: 64 + i * 26,
              color: "#FFFFFF",
              WebkitTextStroke: "12px #111111",
              paintOrder: "stroke fill",
              opacity: gorunur * Math.min(1, p * 5) * (1 - p * p),
              rotate: `${10 + i * 6}deg`,
            }}
          >
            Z
          </div>
        );
      })}
    </>
  );
};

/** One sugar crumb Kazım carries off after each alarm (box coordinates 600x600). */
const Kirinti: React.FC<{ readonly bob: number }> = ({ bob }) => (
  <g transform={`translate(548 ${428 + bob}) rotate(14)`}>
    <rect x={-27} y={-27} width={54} height={54} rx={9} fill="#FFFFFF" stroke={SIYAH} strokeWidth={6} />
    <path d="M -14 -12 L 4 -14 M -14 -2 L -6 -4" stroke="#BFD4F2" strokeWidth={5} strokeLinecap="round" />
    <path d="M 38 -34 L 44 -46 M 46 -26 L 58 -30 M 34 -44 L 28 -56" stroke={SARI} strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** The wrap / cocoon in Kazım's box. t=0: the blue mat rolled round his body (head out); t=1: the cream cocoon. */
const KozaGovde: React.FC<{ readonly t: number }> = ({ t }) => {
  const x0 = interpolate(t, [0, 1], [70, 35]);
  const x1 = interpolate(t, [0, 1], [305, 525]);
  const y0 = interpolate(t, [0, 1], [120, 10]);
  const y1 = interpolate(t, [0, 1], [548, 558]);
  const w = x1 - x0;
  const h = y1 - y0;
  const ry = w / 2 + (h / 2 - w / 2) * t;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={w / 2} ry={ry} fill={interpolateColors(t, [0, 1], [MAVI_SILTE, "#FBF6EA"])} stroke={SIYAH} strokeWidth={8} />
      <g opacity={1 - t} stroke={SIYAH} strokeWidth={7} fill="none" strokeLinecap="round">
        {[250, 340, 430].map((y) => (
          <path key={y} d={`M ${x0 + 4} ${y} Q ${(x0 + x1) / 2} ${y + 22} ${x1 - 4} ${y}`} />
        ))}
        <path d={`M ${x0 + 40} 190 L ${x0 + 40} 520 M ${x0 + 120} 190 L ${x0 + 120} 520`} stroke="#7C97EE" strokeWidth={9} />
      </g>
      <g opacity={t} stroke={SIYAH} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="22 16">
        {[150, 290, 420].map((y) => (
          <path key={y} d={`M ${x0 + 40} ${y} Q 280 ${y + 28} ${x1 - 40} ${y}`} />
        ))}
      </g>
      <path d="M 90 150 Q 76 260 100 380" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.5 * t} />
    </g>
  );
};

/** Cocoon / wrap shake, continuous across the loop point: g = frame at the start, frame - 690 at the end. */
const salla = (g: number) =>
  interpolate(g, [-19, -18, 0, 14], [0, 1.5, 3, 4.5], KL) * Math.sin(g * 1.9);

const ZIGZAG = "M 290 6 L 322 92 L 262 172 L 326 262 L 268 352 L 322 442 L 284 520 L 298 566";
const SOL_YARI = `M -40 -40 L 290 -40 L 290 6 L 322 92 L 262 172 L 326 262 L 268 352 L 322 442 L 284 520 L 298 566 L 298 640 L -40 640 Z`;
const SAG_YARI = `M 640 -40 L 290 -40 L 290 6 L 322 92 L 262 172 L 326 262 L 268 352 L 322 442 L 284 520 L 298 566 L 298 640 L 640 640 Z`;

/** Scene 1's cocoon: shakes, cracks along a zigzag at frame 8-14 and bursts into two halves and shards. */
const KozaKirilan: React.FC<{ readonly f: number }> = ({ f }) => {
  const id = useId().replace(/:/g, "");
  if (f >= 36) return null;
  const aci = f < 14 ? salla(f) : 0;
  const ayril = interpolate(f, [14, 32], [0, 1], { ...KL, easing: Easing.out(Easing.cubic) });
  const sol = { translate: `${-300 * ayril}px ${-30 * ayril}px`, rotate: `${-34 * ayril}deg` };
  const sag = { translate: `${300 * ayril}px ${-30 * ayril}px`, rotate: `${34 * ayril}deg` };
  const opaklik = interpolate(f, [24, 34], [1, 0], KL);
  const catlak = interpolate(f, [7, 14], [1, 0], KL);
  const parcalar: [number, number, number, number][] = [
    [-120, -260, 220, 28],
    [140, -300, -260, 34],
    [-200, 40, -190, 24],
    [210, 80, 280, 30],
  ];
  return (
    <g>
      <defs>
        <clipPath id={`sol-${id}`}>
          <path d={SOL_YARI} />
        </clipPath>
        <clipPath id={`sag-${id}`}>
          <path d={SAG_YARI} />
        </clipPath>
      </defs>
      <g transform={`rotate(${aci} 290 550)`}>
        <g style={{ transformOrigin: "290px 300px", ...sol }} opacity={opaklik}>
          <g clipPath={`url(#sol-${id})`}>
            <KozaGovde t={1} />
          </g>
        </g>
        <g style={{ transformOrigin: "290px 300px", ...sag }} opacity={opaklik}>
          <g clipPath={`url(#sag-${id})`}>
            <KozaGovde t={1} />
          </g>
        </g>
        {f < 14 ? (
          <path d={ZIGZAG} pathLength={1} strokeDasharray="1 1" strokeDashoffset={catlak} stroke={SIYAH} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" fill="none" />
        ) : null}
      </g>
      {parcalar.map(([dx, dy, dr, r], i) => {
        const p = interpolate(f, [14, 34], [0, 1], { ...KL, easing: Easing.out(Easing.quad) });
        return (
          <path
            key={i}
            d={`M 0 ${-r} L ${r} ${r} L ${-r} ${r * 0.6} Z`}
            transform={`translate(${290 + dx * p} ${300 + dy * p + 160 * p * p}) rotate(${dr * p})`}
            fill="#FBF6EA"
            stroke={SIYAH}
            strokeWidth={6}
            strokeLinejoin="round"
            opacity={interpolate(f, [14, 16, 30, 36], [0, 1, 1, 0], KL)}
          />
        );
      })}
    </g>
  );
};

/** The pillow Kazım presses onto his head, with his two front legs holding it (box coordinates). */
const Yastik: React.FC<{ readonly yUst?: number; readonly sikis?: number }> = ({ yUst = 0, sikis = 0 }) => (
  <g transform={`translate(0 ${yUst})`}>
    <path d="M 300 440 Q 238 380 262 318 Q 270 296 308 292" stroke={SIYAH} strokeWidth={13} strokeLinecap="round" fill="none" />
    <path d="M 332 456 Q 540 420 534 330 Q 530 300 500 292" stroke={SIYAH} strokeWidth={13} strokeLinecap="round" fill="none" />
    <g transform={`translate(410 ${236 + sikis * 8}) rotate(-7) scale(${1 + sikis * 0.05} ${1 - sikis * 0.1})`}>
      <rect x={-136} y={-64} width={272} height={128} rx={46} fill="#FFFFFF" stroke={SIYAH} strokeWidth={8} />
      <path d="M -100 -30 Q 0 -52 100 -30 M -100 30 Q 0 52 100 30" stroke="#BFD4F2" strokeWidth={8} strokeLinecap="round" fill="none" />
      <circle cx={-136} cy={-64} r={10} fill="#BFD4F2" stroke={SIYAH} strokeWidth={5} />
      <circle cx={136} cy={-64} r={10} fill="#BFD4F2" stroke={SIYAH} strokeWidth={5} />
    </g>
  </g>
);

/* ---------- Kazım's layer (frame = absolute frame, the Sequence starts at 0) ---------- */

const KazimKatmani: React.FC = () => {
  const f = useCurrentFrame();
  const uyku = anahtar(f, UYKU);
  const konusuyor = KAZIM_SESI.some(([a, b]) => f >= a && f < b);
  const yuruyor = KIRINTI_ARALIKLARI.some(([a, b]) => f >= a && f < b) && uyku < 0.3;
  const y = kazimY(f);
  const siltaAcik = interpolate(f, [98, 114], [0, 1], { ...KL, easing: Easing.bezier(0.3, 0, 0.3, 1) });
  const siltaGorunur = f >= 98 && f < 582;
  const siltaOnde = uyku > 0.3;
  // pillow in S5: drops in at 392, flies off at the alarm (474)
  const yastikVar = f >= 390 && f < 496;
  const yastikIn = interpolate(f, [390, 398], [-340, 0], { ...KL, easing: Easing.bezier(0.2, 0.8, 0.3, 1) });
  const yastikUcus = interpolate(f, [474, 494], [0, -700], { ...KL, easing: Easing.in(Easing.quad) });
  const yastikSikis = interpolate(f, [398, 402, 408], [0, 1, 0.5], KL);
  // S8: the mat wraps Kazım; the last frames shrink the wrap into the cocoon
  const sarili = f >= 600;
  const kozaT = interpolate(f, [676, 688], [0, 1], { ...KL, easing: Easing.inOut(Easing.cubic) });
  const g = f >= 600 ? f - 690 : f;
  const sarmaGiris = interpolate(f, [600, 606], [0.94, 1], KL);
  const uykuluGoz = anahtar(f, [
    [0, 0],
    [300, 0],
    [372, 0.6],
    [600, 0.6],
  ]);
  const antenDus = anahtar(f, [
    [0, 0],
    [214, 0],
    [262, 1],
    [690, 1],
  ]);
  const yorgun = f >= 318;
  const kazimGizli = f >= 688 || f < 14;
  return (
    <AbsoluteFill>
      {siltaGorunur && !siltaOnde ? <Silte acik={siltaAcik} /> : null}
      <div style={{ position: "absolute", left: K.left, top: K.top, width: K.size, height: K.size, translate: `0px ${y}px`, opacity: kazimGizli ? 0 : 1 }}>
        <Kazim
          size={K.size}
          ifade={kazimIfade(f)}
          konusuyor={konusuyor}
          yuruyor={yuruyor}
          kirpmaGecikmesi={12}
          uyku={uyku}
          gozKapagi={uykuluGoz}
          antenDus={antenDus}
          yorgun={yorgun}
          gozyasiYok
        />
      </div>
      {siltaGorunur && siltaOnde ? <Silte acik={siltaAcik} /> : null}
      {/* overlay in Kazım's box: crumb, pillow, wrap, cocoon */}
      <div style={{ position: "absolute", left: K.left, top: K.top, width: K.size, height: K.size, translate: `0px ${y}px` }}>
        <svg width={K.size} height={K.size} viewBox="0 0 600 600" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {kirintiVar(f) ? <Kirinti bob={Math.sin(f * 0.9) * 4} /> : null}
          {yastikVar ? <Yastik yUst={yastikIn + yastikUcus + uyku * 46} sikis={yastikSikis} /> : null}
          {f < 36 ? <KozaKirilan f={f} /> : null}
          {sarili ? (
            <g transform={`rotate(${salla(g)} 290 550)`}>
              <g style={{ transformOrigin: "290px 550px", scale: `${sarmaGiris}` }}>
                <KozaGovde t={kozaT} />
              </g>
            </g>
          ) : null}
        </svg>
      </div>
      <Zzz gorunur={f < 582 ? interpolate(uyku, [0.7, 1], [0, 1], KL) * (yastikVar && f > 410 ? 0.7 : 1) : 0} />
    </AbsoluteFill>
  );
};

/* ---------- the clocks and the hourglasses (absolute frame) ---------- */

/** The small alarm clock beside the mat (scenes 4-5), and the foot that pushes it. */
const KucukSaat: React.FC<{ readonly bas: number }> = ({ bas }) => {
  const f = useCurrentFrame() + bas;
  if (f < 270 || f >= 474) return null;
  const pop = interpolate(f, [270, 278], [0, 1], { ...KL, easing: Easing.out(Easing.back(2)) });
  const itme = interpolate(f, [420, 426, 436], [0, 14, 0], KL);
  const cal = calarMi(f) || (f >= 452 && f < 474);
  const ayak = interpolate(f, [410, 420, 428, 436], [0, 1, 1, 0], KL);
  return (
    <>
      <div style={{ position: "absolute", left: 772 + itme, top: 1088, scale: `${pop}`, transformOrigin: "50% 100%" }}>
        <CalarSaat genislik={170} cal={cal} />
      </div>
      {f >= 408 && f < 440 ? (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={`M 700 1218 L ${700 + 70 * ayak + itme} ${1218 - 24 * ayak}`} stroke={SIYAH} strokeWidth={13} strokeLinecap="round" />
          <ellipse cx={706 + 70 * ayak + itme} cy={1214 - 24 * ayak} rx={12} ry={8} fill={SIYAH} />
        </svg>
      ) : null}
    </>
  );
};

/** The alarm clock that wakes Kazım on the new day; it vanishes before the loop point. */
const SabahSaati: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = interpolate(frame, [0, 6], [0, 1], { ...KL, easing: Easing.out(Easing.back(2)) });
  const kapan = interpolate(frame, [18, 22], [1, 0], KL);
  return (
    <div style={{ position: "absolute", left: 772, top: 1088, scale: `${pop * kapan}`, transformOrigin: "50% 100%" }}>
      <CalarSaat genislik={170} cal={frame >= 6} />
    </div>
  );
};

/** One hourglass above Kazım's head: appears at "kötü haber", flows slowly for "bir dakika", then runs fast three times. */
const BasUstuKumSaati: React.FC<{ readonly bas: number }> = ({ bas }) => {
  const f = useCurrentFrame() + bas;
  if (f < 188 || f >= 392) return null;
  const pop = interpolate(f, [188, 198], [0, 1], { ...KL, easing: Easing.out(Easing.back(2)) });
  const kapan = interpolate(f, [376, 388], [1, 0], KL);
  // [flow start, flow end] in frames; after each flow it flips over
  const AKIS: [number, number][] = [
    [214, 262],
    [276, 294],
    [324, 331],
    [354, 361],
  ];
  let akis = 0;
  let dondur = 0;
  for (const [a, b] of AKIS) {
    if (f >= a && f < b + 8) {
      akis = interpolate(f, [a, b], [0, 1], KL);
      dondur = interpolate(f, [b + 1, b + 8], [0, 180], KL);
      if (dondur >= 180) {
        akis = 0;
        dondur = 0;
      }
    }
  }
  const altKonum = f > 372 ? interpolate(f, [372, 388], [0, -40], KL) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 500,
        top: 540 + altKonum,
        scale: `${pop * kapan}`,
        transformOrigin: "50% 100%",
        rotate: `${dondur}deg`,
      }}
    >
      <KumSaati genislik={280} akis={akis} />
    </div>
  );
};

/** Scene 6: the giant alarm clock, drawn behind Kazım. */
const DevSaat: React.FC = () => {
  const f = useCurrentFrame();
  const buyu = interpolate(f, [0, 9], [0.25, 1], { ...KL, easing: Easing.out(Easing.back(1.6)) });
  return (
    <div style={{ position: "absolute", left: 200, top: 520, scale: `${buyu}`, translate: `0px ${(1 - buyu) * 360}px`, transformOrigin: "50% 100%" }}>
      <CalarSaat genislik={680} cal={f < 70} />
    </div>
  );
};

/** Scene 6: the hourglass that lands on the floor ("tak"). */
const DevKumSaati: React.FC = () => {
  const f = useCurrentFrame();
  const inis = interpolate(f, [14, 24], [-900, 0], { ...KL, easing: Easing.in(Easing.quad) });
  const sek = interpolate(f, [24, 28, 33], [0, -22, 0], KL);
  return (
    <div style={{ position: "absolute", left: 40, top: 862, translate: `0px ${inis + sek}px` }}>
      <KumSaati genislik={270} akis={1} />
    </div>
  );
};

/* ---------- screen text, badge, source line ---------- */

const Blok: React.FC<{
  readonly name: string;
  readonly arka: string;
  readonly boyut: number;
  readonly aci: number;
  readonly top: number;
  readonly carp?: boolean;
  readonly children: React.ReactNode;
}> = ({ name, arka, boyut, aci, top, carp = false, children }) => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        left: 80,
        top,
        width: 860,
        boxSizing: "border-box",
        padding: "8px 16px 18px",
        backgroundColor: arka,
        border: "9px solid #111111",
        borderRadius: 20,
        boxShadow: "14px 16px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: boyut,
        lineHeight: 1.02,
        letterSpacing: -1,
        textAlign: "center",
        whiteSpace: "nowrap",
        color: "#111111",
        rotate: `${aci}deg`,
        scale: interpolate(frame, [0, 7], [carp ? 1.5 : 0.6, 1], { ...KL, easing: Easing.spring({ damping: 11 }), output: "perceptual-scale" }),
        opacity: interpolate(frame, [0, 2], [0, 1], KL),
      }}
    >
      {children}
    </Interactive.Div>
  );
};

/** Top-right sleep counter: moon icon + "UYKU: n/250". Frame-driven number. */
const UykuRozeti: React.FC = () => {
  const frame = useCurrentFrame(); // the Sequence starts at 90, so the absolute frame is frame + 90
  const f = frame + 90;
  const n = uykuSayisi(f);
  const hizli = f >= 372 && f < 405;
  const kapan = interpolate(f, [680, 688], [1, 0], KL);
  return (
    <Interactive.Div
      name="Uyku sayacı"
      style={{
        position: "absolute",
        right: 140,
        top: 100,
        height: 95,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 26px 0 20px",
        backgroundColor: "#FFFFFF",
        border: "6px solid #111111",
        borderRadius: 26,
        boxShadow: "8px 9px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 46,
        whiteSpace: "nowrap",
        color: "#111111",
        scale: interpolate(frame, [2, 9], [0.4, 1], { ...KL, easing: Easing.spring({ damping: 10 }), output: "perceptual-scale" }) * (hizli ? 1.06 : 1),
        opacity: interpolate(frame, [2, 4], [0, 1], KL) * kapan,
      }}
    >
      <svg width={44} height={44} viewBox="0 0 44 44">
        <path d="M 30 5 A 18 18 0 1 0 39 30 A 14 14 0 0 1 30 5 Z" fill={SARI} stroke="#111111" strokeWidth={4} strokeLinejoin="round" />
      </svg>
      <span>
        UYKU: <span style={{ color: n >= 249 ? KIRMIZI : "#111111" }}>{n}</span>/250
      </span>
    </Interactive.Div>
  );
};

const KaynakSatiri: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Kaynak satırı"
      style={{
        position: "absolute",
        left: 80,
        top: 1280,
        width: 860,
        boxSizing: "border-box",
        padding: "4px 0 6px",
        textAlign: "center",
        backgroundColor: CREAM,
        border: "4px solid #111111",
        borderRadius: 14,
        fontFamily: BODY_FONT,
        fontWeight: 700,
        fontSize: 31,
        color: "#111111",
        whiteSpace: "nowrap",
        opacity: interpolate(frame, [0, 8], [0, 1], KL),
      }}
    >
      Kaynak: Cassill ve ark., 2009 · ateş karıncası işçileri
    </Interactive.Div>
  );
};

/* ---------- scene 7: the cover (no captions: it sits above the caption layer) ---------- */

const KapakKaresi: React.FC = () => {
  const f = useCurrentFrame();
  const boyut = 700;
  const olc = boyut / 600;
  const sol = 20;
  const ust = 1190 - 540 * olc;
  return (
    <AbsoluteFill style={{ backgroundColor: "#E51C0F" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(243,235,221,0.22) 1.2px, transparent 1.7px)", backgroundSize: "9px 9px" }} />
      <AbsoluteFill
        style={{
          backgroundColor: CREAM,
          clipPath: "polygon(0 70%, 12% 68.9%, 27% 70.3%, 44% 68.8%, 61% 70.2%, 78% 68.9%, 100% 70%, 100% 100%, 0 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 420, top: 560, rotate: "6deg" }}>
        <CalarSaat genislik={520} cal={false} />
      </div>
      <div style={{ position: "absolute", left: sol, top: ust, width: boyut, height: boyut }}>
        <Kazim size={boyut} ifade="uzgun" konusuyor={false} yuruyor={false} gozyasiYok gozKapagi={0.85} yorgun antenDus={1} kirpmaGecikmesi={40} />
        <svg width={boyut} height={boyut} viewBox="0 0 600 600" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <Yastik sikis={interpolate(f, [0, 6], [0, 0.6], KL)} />
        </svg>
      </div>
      <Interactive.Div
        name="Kapak: 250 UYKU"
        style={{
          position: "absolute",
          left: 120,
          top: 250,
          width: 840,
          boxSizing: "border-box",
          padding: "2px 20px 14px",
          backgroundColor: SARI,
          border: "10px solid #111111",
          borderRadius: 22,
          boxShadow: "14px 16px 0 #111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 1,
          letterSpacing: -4,
          color: "#111111",
          textAlign: "center",
          whiteSpace: "nowrap",
          rotate: "-3deg",
        }}
      >
        250 UYKU
      </Interactive.Div>
      <Interactive.Div
        name="Kapak: HER BİRİ 1 DK"
        style={{
          position: "absolute",
          left: 90,
          top: 1220,
          width: 880,
          boxSizing: "border-box",
          padding: "2px 20px 12px",
          backgroundColor: SARI,
          border: "10px solid #111111",
          borderRadius: 22,
          boxShadow: "14px 16px 0 #111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 118,
          lineHeight: 1,
          letterSpacing: -3,
          color: "#111111",
          textAlign: "center",
          whiteSpace: "nowrap",
          rotate: "2deg",
        }}
      >
        HER BİRİ 1 DK
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/* ---------- the composition ---------- */

export const Video06KarincaDogdun: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Track name="Yuva">
        <Sequence name="Yuva tüneli kesiti" durationInFrames={durationInFrames}>
          <YuvaArkaPlan />
        </Sequence>
      </Track>

      <Track name="Dev çalar saat (Kazım'ın arkasında)">
        <Sequence name="6 Dev çalar saat" from={474} durationInFrames={108}>
          <DevSaat />
        </Sequence>
      </Track>

      <Track name="Kazım ve kozası">
        <Sequence name="Kazım (koza, şilte, yastık, sarılı koza)" durationInFrames={durationInFrames}>
          <KazimKatmani />
        </Sequence>
      </Track>

      <Track name="Saatler">
        <Sequence name="3-4 Baş üstü kum saati" from={188} durationInFrames={204}>
          <BasUstuKumSaati bas={188} />
        </Sequence>
        <Sequence name="4-5 Küçük çalar saat" from={270} durationInFrames={204}>
          <KucukSaat bas={270} />
        </Sequence>
        <Sequence name="6 Dev kum saati" from={474} durationInFrames={108}>
          <DevKumSaati />
        </Sequence>
        <Sequence name="8 Sabah çalar saati" from={666} durationInFrames={22}>
          <SabahSaati />
        </Sequence>
      </Track>

      <Track name="Ekran yazıları">
        <Sequence name="1 Kanca: karınca olarak doğdun" from={3} durationInFrames={87}>
          <Blok name="Kanca" arka="#FFFFFF" boyut={92} aci={-3} top={215} carp>
            KARINCA OLARAK
            <br />
            <span style={{ backgroundColor: SARI, padding: "0 14px", borderRadius: 10 }}>DOĞDUN</span>
          </Blok>
        </Sequence>
        <Sequence name="2 Günde 250 uyku" from={92} durationInFrames={94}>
          <Blok name="Günde 250 uyku" arka={SARI} boyut={94} aci={2} top={228}>
            GÜNDE 250 UYKU!
          </Blok>
        </Sequence>
        <Sequence name="3 Her biri 1 dakika" from={186} durationInFrames={204}>
          <Blok name="Her biri 1 dakika" arka="#FFFFFF" boyut={86} aci={-2} top={225}>
            HER BİRİ: <span style={{ color: KIRMIZI }}>~1 DAKİKA</span>
          </Blok>
        </Sequence>
        <Sequence name="6 Punchline" from={528} durationInFrames={54}>
          <Blok name="Punchline" arka={SARI} boyut={70} aci={-2} top={215} carp>
            ATEŞ KARINCASI OLSAN
            <br />
            “BEŞ DAKİKA DAHA” <span style={{ color: KIRMIZI }}>YOK.</span>
          </Blok>
        </Sequence>
        <Sequence name="8 Yeni gün" from={618} durationInFrames={66}>
          <Blok name="Yeni gün" arka={SARI} boyut={94} aci={2} top={228} carp>
            YENİ GÜN: 1/250
          </Blok>
        </Sequence>
      </Track>

      <Sequence name="Uyku sayacı rozeti" from={90} durationInFrames={durationInFrames - 90}>
        <UykuRozeti />
      </Sequence>

      <Sequence name="Kaynak satırı" from={90} durationInFrames={582 - 90}>
        <KaynakSatiri />
      </Sequence>

      <ShortsCaptions
        name="Altyazı"
        durationInFrames={durationInFrames}
        beklemeMs={500}
        birlestirmeMs={1500}
        style={{ position: "absolute", top: 1340, left: 90, width: 900, fontSize: 66, columnGap: 28, wordSpacing: 10 }}
        captions={[
          { text: "Tebrikler.", startMs: 300, endMs: 958, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Ateş", startMs: 958, endMs: 1288, timestampMs: null, confidence: null },
          { text: " karıncası", startMs: 1288, endMs: 1946, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " olarak", startMs: 1946, endMs: 2407, timestampMs: null, confidence: null },
          { text: " doğdun.", startMs: 2407, endMs: 2868, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " İyi", startMs: 3067, endMs: 3359, timestampMs: null, confidence: null },
          { text: " haber:", startMs: 3359, endMs: 3798, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " günde", startMs: 3798, endMs: 4237, timestampMs: null, confidence: null },
          { text: " iki", startMs: 4237, endMs: 4529, timestampMs: null, confidence: null },
          { text: " yüz", startMs: 4529, endMs: 4822, timestampMs: null, confidence: null },
          { text: " elli", startMs: 4822, endMs: 5187, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " kez", startMs: 5187, endMs: 5480, timestampMs: null, confidence: null },
          { text: " uyuyorsun.", startMs: 5480, endMs: 6211, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Kötü", startMs: 6333, endMs: 6678, timestampMs: null, confidence: null },
          { text: " haber:", startMs: 6678, endMs: 7091, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " her", startMs: 7091, endMs: 7367, timestampMs: null, confidence: null },
          { text: " biri", startMs: 7367, endMs: 7711, timestampMs: null, confidence: null },
          { text: " bir", startMs: 7711, endMs: 7987, timestampMs: null, confidence: null },
          { text: " dakika.", startMs: 7987, endMs: 8469, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Daha", startMs: 10000, endMs: 10353, timestampMs: null, confidence: null },
          { text: " yeni", startMs: 10353, endMs: 10706, timestampMs: null, confidence: null },
          { text: " yattım!", startMs: 10706, endMs: 11200, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Beş", startMs: 13200, endMs: 13530, timestampMs: null, confidence: null },
          { text: " dakika", startMs: 13530, endMs: 14107, timestampMs: null, confidence: null },
          { text: " daha…", startMs: 14107, endMs: 14520, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Ateş", startMs: 16000, endMs: 16330, timestampMs: null, confidence: null },
          { text: " karıncasında", startMs: 16330, endMs: 17188, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " beş", startMs: 17188, endMs: 17452, timestampMs: null, confidence: null },
          { text: " dakika", startMs: 17452, endMs: 17914, timestampMs: null, confidence: null },
          { text: " yok.", startMs: 17914, endMs: 18178, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bir", startMs: 18178, endMs: 18442, timestampMs: null, confidence: null },
          { text: " dakika,", startMs: 18442, endMs: 18904, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " o", startMs: 18904, endMs: 19036, timestampMs: null, confidence: null },
          { text: " kadar.", startMs: 19036, endMs: 19432, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Günaydın…", startMs: 20400, endMs: 21171, timestampMs: null, confidence: null },
          { text: " yine.", startMs: 21171, endMs: 21600, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />

      <Sequence name="Kapak karesi" from={582} durationInFrames={18}>
        <KapakKaresi />
      </Sequence>

      <LogoBadge name="Logo" durationInFrames={durationInFrames} style={{ position: "absolute", top: 100, left: 80 }} />

      {/* The voice files have no leading silence: each starts on its line's first word. */}
      <Track name="Seslendirme">
        <Audio name="01 Anlatıcı: Tebrikler" src={staticFile("voice/06-karinca/01-anlatici.mp3")} volume={0.9} from={9} />
        <Audio name="02 Anlatıcı: İyi haber" src={staticFile("voice/06-karinca/02-anlatici.mp3")} volume={0.9} from={92} />
        <Audio name="03 Anlatıcı: Kötü haber" src={staticFile("voice/06-karinca/03-anlatici.mp3")} volume={0.9} from={190} />
        <Audio name="04 Kazım: Daha yeni yattım" src={staticFile("voice/06-karinca/04-kazim.mp3")} volume={0.9} from={300} />
        <Audio name="05 Kazım: Beş dakika daha" src={staticFile("voice/06-karinca/05-kazim.mp3")} volume={0.9} from={396} />
        <Audio name="06 Anlatıcı: Beş dakika yok" src={staticFile("voice/06-karinca/06-anlatici.mp3")} volume={0.9} from={480} />
        <Audio name="07 Kazım: Günaydın yine" src={staticFile("voice/06-karinca/07-kazim.mp3")} volume={0.9} from={612} />
      </Track>

      <Track name="Ses efektleri">
        {/* scene 1: the cocoon cracks, Kazım pops out */}
        <Audio name="Koza çatlar" src={staticFile("sfx/koza-catlama.wav")} from={12} volume={0.55} />
        <Audio name="Koza vuruş" src={staticFile("sfx/hit.mp3")} from={14} durationInFrames={12} volume={0.22} />
        <Audio name="Kazım fırlar" src={staticFile("sfx/success.wav")} from={36} volume={0.35} />
        {/* scene 2: the badge appears, the mat unrolls, Kazım flops down */}
        <Audio name="Rozet belirir" src={staticFile("sfx/pop.mp3")} from={92} volume={0.35} />
        <Audio name="Şilte açılır" src={staticFile("sfx/soft-whoosh.wav")} from={98} volume={0.45} />
        <Audio name="Kazım yatar" src={staticFile("sfx/pop.mp3")} from={118} volume={0.25} />
        {/* scene 3: the hourglass, then the silence after "bir dakika" */}
        <Audio name="Kum saati belirir" src={staticFile("sfx/pop.mp3")} from={190} volume={0.45} />
        <Audio
          name="Sessizlik: cırcır"
          src={staticFile("sfx/circir.wav")}
          from={254}
          durationInFrames={16}
          volume={(f) => interpolate(f, [0, 3, 12, 16], [0, 0.4, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        {/* scene 4: three fast sleeps, three alarms, the counter shoots */}
        <Audio name="Tur 1 yatış" src={staticFile("sfx/pop.mp3")} from={272} volume={0.22} />
        <Audio name="Tur 1 kum" src={staticFile("sfx/soft-whoosh.wav")} from={276} volume={0.22} />
        <Audio name="Tur 1 çalar saat" src={staticFile("sfx/cirlayan-saat.wav")} from={294} durationInFrames={12} volume={0.35} />
        <Audio name="Tur 2 yatış" src={staticFile("sfx/pop.mp3")} from={320} volume={0.22} />
        <Audio name="Tur 2 çalar saat" src={staticFile("sfx/cirlayan-saat.wav")} from={330} durationInFrames={12} volume={0.35} />
        <Audio name="Tur 3 yatış" src={staticFile("sfx/pop.mp3")} from={352} volume={0.22} />
        <Audio name="Tur 3 çalar saat" src={staticFile("sfx/cirlayan-saat.wav")} from={366} durationInFrames={12} volume={0.35} />
        <Audio name="Sayaç fırlar" src={staticFile("sfx/hizli-sar.wav")} from={372} volume={0.45} />
        {/* scene 5: the pillow, the foot pushes the clock, the clock starts to rattle */}
        <Audio name="Yastık" src={staticFile("sfx/soft-whoosh.wav")} from={392} volume={0.25} />
        <Audio name="Ayak saati iter" src={staticFile("sfx/pop.mp3")} from={422} volume={0.28} />
        <Audio
          name="Saat tıkırdar"
          src={staticFile("sfx/cirlayan-saat.wav")}
          from={452}
          durationInFrames={22}
          volume={(f) => interpolate(f, [0, 6, 22], [0.1, 0.25, 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        {/* scene 6: the giant alarm, the hourglass lands, the punchline slams */}
        <Audio
          name="Dev çalar saat"
          src={staticFile("sfx/cirlayan-saat.wav")}
          from={474}
          durationInFrames={30}
          volume={(f) => interpolate(f, [0, 24, 30], [0.6, 0.6, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        <Audio
          name="Dev çalar saat 2"
          src={staticFile("sfx/cirlayan-saat.wav")}
          from={504}
          durationInFrames={22}
          volume={(f) => interpolate(f, [0, 16, 22], [0.4, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        <Audio name="Kum saati tak" src={staticFile("sfx/tik.wav")} from={497} volume={0.55} />
        <Audio name="Punchline çarpar" src={staticFile("sfx/hit.mp3")} from={528} durationInFrames={20} volume={0.5} />
        {/* scene 7: cover */}
        <Audio name="Kapak" src={staticFile("sfx/logo-hit.wav")} from={582} volume={0.5} />
        {/* scene 8: morning alarm, then the loop back into the cocoon crack */}
        <Audio name="Yeni gün" src={staticFile("sfx/soft-whoosh.wav")} from={600} volume={0.2} />
        <Audio
          name="Sabah çalar saati"
          src={staticFile("sfx/cirlayan-saat.wav")}
          from={672}
          durationInFrames={18}
          volume={(f) => interpolate(f, [0, 12, 18], [0.5, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      </Track>
    </>
  );
};
