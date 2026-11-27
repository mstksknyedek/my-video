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
import { Anne } from "../karakterler/Anne";
import { KIRMIZI, KREM, MAVI, MUREKKEP, SARI } from "../karakterler/animasyon";
import { Icerik, Kap, kapOrani } from "../Kap";
import { LogoBadge } from "../LogoBadge";
import { PaperBackground } from "../PaperBackground";
import { ShortsCaptions } from "../ShortsCaptions";

// Video #5 "Annenin kapları geri dönmez" (script strategy/senaryolar/05-annenin-kaplari.md), 1080x1920, 30 fps, 23 s.
// Timed to the real voiceover in public/voice/05-kaplar (leading silence trimmed, each <Audio> starts on its line's
// first word). The narrator (the grown-up child) is off screen; Anne is the new character.
//
// Scene starts (frame / s): 1 hook, POV tower walks to the door, doorbell at 72 0 / 0.0 · 2 Anne opens the door and
// hugs the tower 84 / 2.8 · 3 kitchen: 7 lids pop open, badge "GELEN: 7 · GİDEN: ?" 180 / 6.0 · 4 fast fill montage
// "DOLU: n/7" 270 / 9.0 · 5 the boxes build a tower, two more come out of the cupboard, the top one hits the ceiling
// 378 / 12.6 · 6 doorway goodbye + punchline block (530 / 17.7) 468 / 15.6 · 7 cover 582 / 19.4 ·
// 8 our fridge is full of her boxes, we take seven, turn to the door 600 / 20.0 · end 690 / 23.0.
// Loop: the last frames are the frames just before frame 0 (same door, same tower of 7 empty boxes, the walk
// phase carries on across the loop point), so "Haftaya götürürüm." runs straight into "Annemin kaplarını...".
//
// Layout: logo y 100-195 (left) · counter badge y 100-195 (right) · screen text y 215-430 · scene y 440-1290 ·
// captions y 1340-1440.

const CREAM = KREM;
const YESIL = "#4E9A4B";
const KL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const YAVAS = Easing.inOut(Easing.cubic);

/* ---------- the boxes ---------- */

const KAP_RENK = [KIRMIZI, MAVI, SARI, YESIL, SARI, MAVI, KIRMIZI, SARI, MAVI];
const KAP_ICERIK: Icerik[] = ["fasulye", "pilav", "sarma", "borek", "kofte", "dolma", "kurabiye", "kek", "tursu"];
const UYUMSUZ = 3; // the odd lid
const W7 = [300, 285, 270, 250, 235, 215, 190]; // tower of 7 in our hands
const W9 = [240, 228, 216, 204, 192, 180, 170, 160, 150]; // tower of 9 in the kitchen
const UZUN = 8; // the pickle box is tall

type Yer = { readonly x: number; readonly y: number; readonly w: number; readonly h: number };

/** Slots of a stacked tower: each box stands on the lid of the one below. */
const kuleYerleri = (genislikler: readonly number[], cx: number, tabanY: number, olcek = 1): Yer[] => {
  const out: Yer[] = [];
  let alt = tabanY;
  genislikler.forEach((g, i) => {
    const w = g * olcek;
    const uzun = i === UZUN;
    const h = w * kapOrani(uzun);
    const y = alt - h;
    out.push({ x: cx - w / 2, y, w, h });
    alt = y + (12 / (uzun ? 132 : 100)) * h + 0.03 * h;
  });
  return out;
};

type Oge = {
  readonly i: number;
  readonly dolum?: number;
  readonly kapakAcik?: number;
  readonly sx?: number;
  readonly sy?: number;
  readonly dx?: number;
  readonly dy?: number;
  readonly rot?: number;
};

/** One box at an absolute position; squash and tilt grow from its bottom centre. */
const KapYerde: React.FC<{ readonly yer: Yer; readonly oge: Oge }> = ({ yer, oge }) => {
  const { i, dolum = 0, kapakAcik = 0, sx = 1, sy = 1, dx = 0, dy = 0, rot = 0 } = oge;
  return (
    <div
      style={{
        position: "absolute",
        left: yer.x + dx,
        top: yer.y + dy,
        width: yer.w,
        transformOrigin: "50% 100%",
        scale: `${sx} ${sy}`,
        rotate: `${rot}deg`,
      }}
    >
      <Kap
        genislik={yer.w}
        kapakRenk={KAP_RENK[i]}
        icerik={KAP_ICERIK[i]}
        dolum={dolum}
        kapakAcik={kapakAcik}
        uyumsuz={i === UYUMSUZ}
        uzun={i === UZUN}
      />
    </div>
  );
};

/* ---------- walking with the tower (phase g is continuous across the loop point) ---------- */

/** g = walk phase in frames (negative before frame 0 of the next loop), amp 0..1. */
const yuru = (f: number): { readonly g: number; readonly amp: number } => {
  if (f >= 654) return { g: f - 690, amp: interpolate(f, [654, 672], [0, 1], KL) };
  return { g: f, amp: interpolate(f, [80, 96], [1, 0], KL) };
};

const salin = (g: number, amp: number, i: number): number =>
  amp * Math.sin(((g - 3 * i) * Math.PI * 2) / 30) * (3 + 4 * i);

/** Hands under the tower (the POV): blue sleeves from the bottom edge, bare hands round the base box. */
const PovEller: React.FC<{
  readonly cx: number;
  readonly tabanY: number;
  readonly w0: number;
  readonly dirsek: number;
  readonly hedef: readonly [number, number];
}> = ({ cx, tabanY, w0, dirsek, hedef }) => {
  const hy = tabanY - 44;
  const xs = [cx - w0 / 2 + 6, cx + w0 / 2 - 6];
  const ey = tabanY - 70;
  const bx = xs[1] + 20 + (hedef[0] - 50 - xs[1] - 20) * dirsek;
  const by = ey + (hedef[1] + 40 - ey) * dirsek;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
      {dirsek > 0.01 ? (
        <g>
          <path d={`M ${xs[1] + 20} ${ey} L ${bx} ${by}`} stroke={MUREKKEP} strokeWidth={118} strokeLinecap="round" />
          <path d={`M ${xs[1] + 20} ${ey} L ${bx} ${by}`} stroke={MAVI} strokeWidth={102} strokeLinecap="round" />
        </g>
      ) : null}
      {[0, 1].map((k) => {
        const s = k === 0 ? -1 : 1;
        const x = xs[k];
        const yol = `M ${x + s * 10} ${hy + 30} Q ${x + s * 60} ${hy + 250} ${x + s * 150} ${hy + 760}`;
        return (
          <g key={k}>
            <path d={yol} stroke={MUREKKEP} strokeWidth={150} strokeLinecap="round" fill="none" />
            <path d={yol} stroke={MAVI} strokeWidth={134} strokeLinecap="round" fill="none" />
            <path d={`M ${x + s * 36} ${hy + 120} Q ${x + s * 70} ${hy + 300} ${x + s * 130} ${hy + 520}`} stroke="#7C97EE" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.7} />
            <ellipse cx={x} cy={hy} rx={46} ry={60} fill="#F0B98E" stroke={MUREKKEP} strokeWidth={7} />
            <g stroke={MUREKKEP} strokeWidth={5} strokeLinecap="round">
              <line x1={x - s * 6} y1={hy - 30} x2={x + s * 26} y2={hy - 30} />
              <line x1={x - s * 6} y1={hy - 8} x2={x + s * 28} y2={hy - 8} />
              <line x1={x - s * 6} y1={hy + 14} x2={x + s * 26} y2={hy + 14} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

/** The tower held in front of us, with the hands: shared by scenes 1, 2, 6 and 8. */
const PovKule: React.FC<{
  readonly yerler: readonly Yer[];
  readonly ogeler: readonly (Oge | null)[];
  readonly g: number;
  readonly amp: number;
  readonly tx?: number;
  readonly ty?: number;
  readonly dirsek?: number;
  readonly hedef?: readonly [number, number];
  readonly eller?: boolean;
  /** Shrinks the whole tower round its top centre (the hand-over). */
  readonly olcek?: number;
}> = ({ yerler, ogeler, g, amp, tx = 0, ty = 0, dirsek = 0, hedef = [900, 900], eller = true, olcek = 1 }) => {
  const taban = yerler[0].y + yerler[0].h;
  const tepe = yerler[yerler.length - 1].y;
  const cx = yerler[0].x + yerler[0].w / 2;
  const bob = -amp * Math.abs(Math.sin((g * Math.PI) / 15)) * 7;
  const egim = amp * Math.sin((g * Math.PI * 2) / 30 + 0.6) * 1.4;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        translate: `${tx}px ${ty + bob}px`,
        rotate: `${egim}deg`,
        scale: `${olcek}`,
        transformOrigin: olcek === 1 ? `${cx}px ${taban}px` : `${cx}px ${tepe}px`,
      }}
    >
      {ogeler.map((o, k) =>
        o ? <KapYerde key={k} yer={yerler[k]} oge={{ ...o, dx: (o.dx ?? 0) + salin(g, amp, k) }} /> : null,
      )}
      {eller ? <PovEller cx={cx} tabanY={taban} w0={yerler[0].w} dirsek={dirsek} hedef={hedef} /> : null}
    </div>
  );
};

/* ---------- the apartment landing ---------- */

const KapiArka: React.FC<{ readonly zoom: number; readonly acik: number; readonly zil: number; readonly halka: boolean }> = ({
  zoom,
  acik,
  zil,
  halka,
}) => {
  const frame = useCurrentFrame();
  const s = 1 - acik * 0.9;
  return (
    <AbsoluteFill style={{ backgroundColor: "#CFE0F5" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={0} y={1090} width={1080} height={210} fill="#9DB8E6" />
        <path d="M 0 1090 L 1080 1090" stroke={MUREKKEP} strokeWidth={8} />
        <g transform={`translate(640 1290) scale(${zoom}) translate(-640 -1290)`}>
          {/* door casing */}
          <rect x={354} y={444} width={572} height={850} rx={14} fill="#7A4D2D" stroke={MUREKKEP} strokeWidth={10} />
          {/* the hall behind the door */}
          <rect x={380} y={470} width={520} height={820} fill="#F9E3A8" />
          <rect x={380} y={470} width={520} height={70} fill="#F2D27E" />
          <path d="M 380 1130 L 900 1130" stroke="#E0B35A" strokeWidth={8} />
          <rect x={380} y={1130} width={520} height={160} fill="#E9C46A" />
          <rect x={460} y={1214} width={380} height={76} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={6} />
          <circle cx={840} cy={640} r={42} fill="#FFFFFF" stroke={MUREKKEP} strokeWidth={7} />
          <path d="M 840 640 L 840 612 M 840 640 L 860 650" stroke={MUREKKEP} strokeWidth={6} strokeLinecap="round" />
          {/* the door leaf, hinged on the left */}
          <g transform={`translate(380 0) scale(${s} 1) translate(-380 0)`}>
            <rect x={380} y={470} width={520} height={820} fill="#A8713A" stroke={MUREKKEP} strokeWidth={10} />
            <rect x={424} y={520} width={190} height={300} rx={10} fill="#B9824A" stroke="#6E4528" strokeWidth={7} />
            <rect x={666} y={520} width={190} height={300} rx={10} fill="#B9824A" stroke="#6E4528" strokeWidth={7} />
            <rect x={424} y={880} width={190} height={340} rx={10} fill="#B9824A" stroke="#6E4528" strokeWidth={7} />
            <rect x={666} y={880} width={190} height={340} rx={10} fill="#B9824A" stroke="#6E4528" strokeWidth={7} />
            <circle cx={640} cy={470 + 150} r={20} fill="#F3EBDD" stroke={MUREKKEP} strokeWidth={6} />
            <circle cx={640} cy={620} r={7} fill={MUREKKEP} />
            <circle cx={840} cy={880} r={20} fill={SARI} stroke={MUREKKEP} strokeWidth={6} />
          </g>
          {/* doorbell */}
          <rect x={934} y={806} width={64} height={108} rx={18} fill={CREAM} stroke={MUREKKEP} strokeWidth={7} />
          <circle cx={966} cy={860} r={21 - zil * 4} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={6} />
          <circle cx={960} cy={853} r={5} fill="#FFFFFF" opacity={0.6} />
          {halka ? (
            <g stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round" fill="none" opacity={Math.floor(frame / 3) % 2 === 0 ? 1 : 0.5}>
              <path d="M 1010 826 Q 1030 860 1010 894" />
              <path d="M 1028 810 Q 1058 860 1028 910" />
            </g>
          ) : null}
          {/* doormat */}
          <rect x={430} y={1296} width={420} height={44} rx={10} fill={SARI} stroke={MUREKKEP} strokeWidth={7} />
          <path d="M 470 1318 L 810 1318" stroke={KIRMIZI} strokeWidth={8} strokeLinecap="round" strokeDasharray="30 18" />
        </g>
        {/* floor */}
        <rect x={0} y={1300} width={1080} height={620} fill={KIRMIZI} />
        <path d="M 0 1300 L 1080 1300" stroke={MUREKKEP} strokeWidth={10} />
        <path d="M 0 1300 L 1080 1300 L 1080 1330 Q 1040 1346 1000 1330 T 920 1330 T 840 1330 T 760 1330 T 680 1330 T 600 1330 T 520 1330 T 440 1330 T 360 1330 T 280 1330 T 200 1330 T 120 1330 T 40 1330 L 0 1330 Z" fill="#B3140A" opacity={0.0} />
      </svg>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(30,63,174,0.12) 1.2px, transparent 1.6px)", backgroundSize: "12px 12px" }} />
    </AbsoluteFill>
  );
};

const ANNE_KAPIDA = { left: 300, top: 590, size: 700 } as const; // feet of the bust on y 1290

const KONUSMA_ANNE: [number, number][] = [
  [90, 175],
  [186, 257],
  [276, 357],
  [384, 467],
  [474, 534],
];
const anneKonusuyor = (f: number) => KONUSMA_ANNE.some(([a, b]) => f >= a && f < b);

/** Scene 1 and 2: the walk to the door, the bell, Anne at the door, the hug that takes the tower away. */
const KapiGiris: React.FC<{ readonly f: number }> = ({ f }) => {
  const { g, amp } = yuru(f);
  const zoom = interpolate(f, [0, 84], [0.84, 1], { ...KL, easing: Easing.out(Easing.quad) });
  const zilBasma = interpolate(f, [68, 72, 80], [0, 1, 0], KL);
  const dirsek = interpolate(f, [58, 70], [0, 1], KL) * interpolate(f, [76, 84], [1, 0], KL);
  const acik = interpolate(f, [84, 94], [0, 1], { ...KL, easing: Easing.out(Easing.quad) });
  const bx = 640 + (966 - 640) * zoom;
  const by = 1290 + (860 - 1290) * zoom;
  // the hand-over: the tower sinks into Anne's arms
  const ty =
    interpolate(f, [112, 144], [0, 690], { ...KL, easing: Easing.in(Easing.quad) }) +
    interpolate(f, [152, 168], [0, 900], { ...KL, easing: Easing.in(Easing.quad) });
  const tx = interpolate(f, [132, 152], [0, 320], { ...KL, easing: YAVAS });
  const kucakOlcek = interpolate(f, [112, 148], [1, 0.5], { ...KL, easing: YAVAS });
  const kucak = interpolate(f, [100, 116, 134, 150], [0, 0.5, 0.5, 1], KL);
  const annePop = interpolate(f, [86, 98], [0, 1], { ...KL, easing: Easing.out(Easing.back(1.5)) });
  const yerler = kuleYerleri(W7, 330, 1262);
  const ogeler: Oge[] = W7.map((_, i) => ({ i }));
  return (
    <AbsoluteFill>
      <KapiArka zoom={zoom} acik={acik} zil={zilBasma} halka={f >= 72 && f < 84} />
      {f >= 86 ? (
        <div
          style={{
            position: "absolute",
            left: ANNE_KAPIDA.left,
            top: ANNE_KAPIDA.top,
            width: ANNE_KAPIDA.size,
            height: ANNE_KAPIDA.size,
            scale: `${0.9 + 0.1 * annePop}`,
            transformOrigin: "50% 100%",
            opacity: Math.min(1, annePop * 1.6),
          }}
        >
          <Anne size={ANNE_KAPIDA.size} ifade="mutlu" konusuyor={anneKonusuyor(f)} kucakliyor={kucak} kepce={false} kirpmaGecikmesi={20} />
        </div>
      ) : null}
      <PovKule yerler={yerler} ogeler={ogeler} g={g} amp={amp} tx={tx} ty={ty} dirsek={dirsek} hedef={[bx, by]} eller={f < 128} olcek={f < 112 ? 1 : kucakOlcek} />
    </AbsoluteFill>
  );
};

/* ---------- the kitchen ---------- */

const MutfakArka: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: CREAM }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
      <rect x={0} y={0} width={1080} height={452} fill={KIRMIZI} />
      {/* wall tiles */}
      <g stroke="#D2C5A8" strokeWidth={4}>
        {Array.from({ length: 13 }, (_, i) => (
          <path key={`v${i}`} d={`M ${i * 90} 452 L ${i * 90} 890`} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={`h${i}`} d={`M 0 ${452 + i * 90} L 1080 ${452 + i * 90}`} />
        ))}
      </g>
      <rect x={0} y={632} width={1080} height={90} fill={MAVI} opacity={0.9} />
      <path d="M 0 632 L 1080 632 M 0 722 L 1080 722" stroke={MUREKKEP} strokeWidth={6} />
      <path d="M 0 452 L 1080 452" stroke={MUREKKEP} strokeWidth={12} />
      <rect x={0} y={452} width={1080} height={20} fill="#B3140A" opacity={0.35} />
    </svg>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(243,235,221,0.22) 1.2px, transparent 1.7px)", backgroundSize: "9px 9px", clipPath: "polygon(0 0, 100% 0, 100% 23.5%, 0 23.5%)" }} />
  </AbsoluteFill>
);

const MutfakOn: React.FC<{ readonly dolapAcik: number; readonly icerdeki: readonly number[] }> = ({ dolapAcik, icerdeki }) => {
  const s = 1 - dolapAcik * 0.88;
  const iceri: Record<number, Yer> = {
    7: { x: 120, y: 1214, w: 110, h: 110 * kapOrani(false) },
    8: { x: 270, y: 1202, w: 100, h: 100 * kapOrani(true) },
  };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {/* counter top */}
        <rect x={-10} y={880} width={1100} height={312} fill="#E0B878" />
        <path d="M -10 880 L 1090 880" stroke={MUREKKEP} strokeWidth={10} />
        <path d="M 60 940 Q 300 925 540 940 T 1020 940" stroke="#C9A06A" strokeWidth={5} fill="none" />
        <path d="M 40 1080 Q 300 1066 540 1080 T 1040 1080" stroke="#C9A06A" strokeWidth={5} fill="none" />
        {/* counter front */}
        <rect x={-10} y={1192} width={1100} height={110} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={10} />
        <rect x={60} y={1206} width={380} height={84} rx={8} fill="#2B1A10" stroke={MUREKKEP} strokeWidth={7} />
      </svg>
      {icerdeki.map((i) => (
        <KapYerde key={i} yer={iceri[i]} oge={{ i, dolum: 1 }} />
      ))}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(60 0) scale(${s} 1) translate(-60 0)`}>
          <rect x={60} y={1206} width={380} height={84} rx={8} fill="#D82A1C" stroke={MUREKKEP} strokeWidth={7} />
          <circle cx={410} cy={1248} r={9} fill={SARI} stroke={MUREKKEP} strokeWidth={4} />
        </g>
        <rect x={470} y={1206} width={380} height={84} rx={8} fill="#D82A1C" stroke={MUREKKEP} strokeWidth={7} />
        <circle cx={500} cy={1248} r={9} fill={SARI} stroke={MUREKKEP} strokeWidth={4} />
        <rect x={880} y={1206} width={190} height={84} rx={8} fill="#D82A1C" stroke={MUREKKEP} strokeWidth={7} />
        <rect x={-10} y={1302} width={1100} height={618} fill={MAVI} />
        <path d="M -10 1302 L 1090 1302" stroke={MUREKKEP} strokeWidth={10} />
      </svg>
    </AbsoluteFill>
  );
};

const SLOTLAR: readonly (readonly [number, number])[] = [
  [180, 1010],
  [400, 1010],
  [620, 1010],
  [840, 1010],
  [320, 1160],
  [540, 1160],
  [760, 1160],
];
const DOLUM_ZAMANI = [276, 300, 319, 338, 350, 362, 372];
const YEMEK_RENK = ["#B5482A", "#FFF3C9", "#6E9B3C", "#E8A83A", "#8A4B26", "#4B7A2E", "#E0B070"];
const KULE5 = kuleYerleri(W9, 790, 1180);
const TAVAN = 452;

/** How many boxes are full (the "DOLU: n/7" counter and the sound cues use this). */
const doluSayisi = (f: number) => DOLUM_ZAMANI.filter((t) => f >= t + 8).length;

/** Scenes 3-5: boxes on the counter, the fill montage, the tower and the ceiling. */
const Mutfak: React.FC<{ readonly f: number }> = ({ f }) => {
  const kepceKaldir = interpolate(f, [198, 210, 262, 272], [0, 1, 1, 0], KL);
  const dolapAcik = interpolate(f, [390, 398, 450, 458], [0, 1, 1, 0], KL);
  const kekAtla = interpolate(f, [396, 408], [0, 1], KL);
  const tursuAtla = interpolate(f, [426, 438], [0, 1], KL);
  const ic: number[] = [];
  if (f >= 392 && f < 396) ic.push(7);
  if (f >= 392 && f < 426) ic.push(8);
  const kapSahne: React.ReactNode[] = [];

  // the seven boxes
  for (let i = 0; i < 7; i++) {
    const [cx, alt] = SLOTLAR[i];
    const slot: Yer = { x: cx - 100, y: alt - 100, w: 200, h: 100 };
    const bas = DOLUM_ZAMANI[i];
    const pop = interpolate(f, [182 + 3 * i, 190 + 3 * i], [0, 1], { ...KL, easing: Easing.out(Easing.back(2)) });
    if (pop <= 0) continue;
    const acik = interpolate(f, [192 + 4 * i, 198 + 4 * i], [0, 1], KL) * (1 - interpolate(f, [bas + 10, bas + 15], [0, 1], KL));
    const dolum = interpolate(f, [bas + 5, bas + 11], [0, 1], KL);
    const zipla = interpolate(f, [bas + 6, bas + 9, bas + 13], [0, -16, 0], KL);
    if (f < 378) {
      kapSahne.push(<KapYerde key={i} yer={slot} oge={{ i, dolum, kapakAcik: acik, sx: pop, sy: pop, dy: zipla }} />);
    } else {
      const t0 = 378 + 2 * i;
      const u = interpolate(f, [t0, t0 + 12], [0, 1], { ...KL, easing: YAVAS });
      const hedef = KULE5[i];
      const x = slot.x + (hedef.x - slot.x) * u;
      const y = slot.y + (hedef.y - slot.y) * u - 70 * Math.sin(Math.PI * u);
      const w = slot.w + (hedef.w - slot.w) * u;
      const eziklik = interpolate(f, [t0 + 12, t0 + 14, t0 + 18], [0, 1, 0], KL);
      kapSahne.push(
        <KapYerde
          key={i}
          yer={{ x, y, w, h: w * 0.5 }}
          oge={{ i, dolum: 1, sx: 1 + 0.07 * eziklik, sy: 1 - 0.1 * eziklik }}
        />,
      );
    }
  }
  // the falling food blobs of the fill montage
  const damlalar = DOLUM_ZAMANI.map((bas, i) => {
    const u = (f - bas) / 7;
    if (u < 0 || u >= 1 || f >= 378) return null;
    const [cx, alt] = SLOTLAR[i];
    const y = interpolate(u, [0, 1], [alt - 330, alt - 80], { easing: Easing.in(Easing.quad) });
    return (
      <div
        key={`d${i}`}
        style={{
          position: "absolute",
          left: cx - 28,
          top: y,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: YEMEK_RENK[i],
          border: "6px solid #111111",
          boxSizing: "border-box",
          scale: `${1 - 0.25 * u} ${1 + 0.35 * u}`,
        }}
      />
    );
  });
  // the two extra boxes: out of the cupboard, onto the top of the tower
  const ekstra = [7, 8].map((i) => {
    const t = i === 7 ? kekAtla : tursuAtla;
    if (t <= 0) return null;
    const hedef = KULE5[i];
    const bas: Yer = i === 7 ? { x: 120, y: 1214, w: 110, h: 55 } : { x: 270, y: 1202, w: 100, h: 66 };
    const u = YAVAS(t);
    const x = bas.x + (hedef.x - bas.x) * u;
    const y = bas.y + (hedef.y - bas.y) * u - 60 * Math.sin(Math.PI * u);
    const w = bas.w + (hedef.w - bas.w) * u;
    const h = w * kapOrani(i === UZUN);
    let sy = 1;
    let sx = 1;
    if (i === UZUN) {
      sy = interpolate(f, [432, 440, 446], [1, 0.3, 0.29], { ...KL, easing: Easing.out(Easing.cubic) });
      sx = 1 + (1 - sy) * 0.3;
    } else {
      const eziklik = interpolate(f, [408, 410, 414], [0, 1, 0], KL);
      sx = 1 + 0.07 * eziklik;
      sy = 1 - 0.1 * eziklik;
    }
    return <KapYerde key={`e${i}`} yer={{ x, y, w, h }} oge={{ i, dolum: 1, sx, sy }} />;
  });
  const carpma = interpolate(f, [438, 440, 456], [0, 1, 0], KL);
  const sag = { x: KULE5[UZUN].x + KULE5[UZUN].w / 2, y: TAVAN + 6 };

  return (
    <AbsoluteFill>
      <MutfakArka />
      <div style={{ position: "absolute", left: 20, top: 410, width: 580, height: 580 }}>
        <Anne
          size={580}
          ifade="mutlu"
          konusuyor={anneKonusuyor(f)}
          kepceSalliyor={f >= 270 && f < 378}
          kepceKaldir={kepceKaldir}
          gozParlasi={f >= 190 && f < 280}
          kirpmaGecikmesi={20}
        />
      </div>
      <MutfakOn dolapAcik={dolapAcik} icerdeki={ic} />
      {kapSahne}
      {damlalar}
      {ekstra}
      {carpma > 0 ? (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(${sag.x + d * 96} ${sag.y + 40}) scale(${0.6 + carpma * 0.6})`} stroke={MUREKKEP} strokeWidth={9} strokeLinecap="round" opacity={carpma}>
              <line x1={d * 6} y1={-4} x2={d * 52} y2={-30} />
              <line x1={d * 10} y1={14} x2={d * 62} y2={14} />
              <line x1={d * 6} y1={30} x2={d * 48} y2={58} />
            </g>
          ))}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/* ---------- scene 6: the doorway goodbye ---------- */

const Kalp: React.FC<{ readonly x: number; readonly y: number; readonly boy: number; readonly o: number }> = ({ x, y, boy, o }) => (
  <svg width={boy} height={boy} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, opacity: o, overflow: "visible" }}>
    <path d="M 50 88 C 10 58 4 30 24 18 C 38 10 50 20 50 30 C 50 20 62 10 76 18 C 96 30 90 58 50 88 Z" fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 24 34 Q 26 26 34 24" stroke="white" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
  </svg>
);

const KapiVeda: React.FC<{ readonly f: number }> = ({ f }) => {
  const { g, amp } = yuru(f);
  const bas = f - 468;
  const yerler = kuleYerleri(W9, 270, 1290, 1.55);
  const ogeler: Oge[] = W9.map((_, i) => ({ i, dolum: 1 }));
  const pop = interpolate(bas, [0, 8], [0.96, 1], KL);
  const kalp = (basla: number, x0: number, x1: number) => {
    const u = (bas - basla) / 34;
    if (u < 0 || u > 1) return null;
    return <Kalp key={basla} x={x0 + (x1 - x0) * u} y={980 - 430 * u} boy={46 + 80 * u} o={interpolate(u, [0, 0.15, 0.8, 1], [0, 1, 1, 0], KL)} />;
  };
  return (
    <AbsoluteFill>
      <KapiArka zoom={1} acik={1} zil={0} halka={false} />
      <div
        style={{
          position: "absolute",
          left: ANNE_KAPIDA.left - 10,
          top: ANNE_KAPIDA.top,
          width: ANNE_KAPIDA.size,
          height: ANNE_KAPIDA.size,
          scale: `${pop}`,
          transformOrigin: "50% 100%",
        }}
      >
        <Anne size={ANNE_KAPIDA.size} ifade="mutlu" konusuyor={anneKonusuyor(f)} elSalliyor={bas >= 18} yon="sol" kirpmaGecikmesi={20} />
      </div>
      {kalp(50, 790, 860)}
      {kalp(62, 800, 900)}
      {kalp(74, 780, 830)}
      <PovKule yerler={yerler} ogeler={ogeler} g={g} amp={amp} />
    </AbsoluteFill>
  );
};

/* ---------- scene 8: our fridge ---------- */

const RAF_Y = [690, 880, 1070, 1262];
/** The seven boxes we take: [shelf, column, tier]. */
const ALINANLAR: [number, number, number][] = [
  [1, 3, 0],
  [1, 3, 1],
  [2, 2, 0],
  [2, 2, 1],
  [2, 3, 0],
  [2, 3, 1],
  [3, 3, 0],
];
const RAF_BOY = 150;
const rafYeri = (raf: number, sutun: number, kat: number): Yer => {
  const h = RAF_BOY * 0.5;
  const alt = RAF_Y[raf] - 6 - kat * (h * 0.88);
  return { x: 222 + sutun * 160, y: alt - h, w: RAF_BOY, h };
};
const alinanMi = (raf: number, sutun: number, kat: number) => ALINANLAR.findIndex((a) => a[0] === raf && a[1] === sutun && a[2] === kat);
const TOPLAMA = (k: number) => 618 + 4 * k; // box k leaves the shelf

const Buzdolabi: React.FC<{ readonly f: number }> = ({ f }) => {
  const acik = interpolate(f, [600, 612], [0, 1], { ...KL, easing: Easing.out(Easing.cubic) });
  const s = 1 - acik * 0.93;
  const raflar: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      for (let t = 0; t < 2; t++) {
        const k = alinanMi(r, c, t);
        if (k >= 0 && f >= TOPLAMA(k)) continue;
        const yer = rafYeri(r, c, t);
        const i = (r * 5 + c * 3 + t * 2) % 9;
        const oge: Oge = { i: k >= 0 ? k : i === UZUN ? 0 : i, dolum: 1 };
        raflar.push(<KapYerde key={`${r}${c}${t}`} yer={yer} oge={oge} />);
      }
    }
  }
  return (
    <AbsoluteFill>
      <PaperBackground />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={180} y={462} width={720} height={836} rx={44} fill="#E7EEF2" stroke={MUREKKEP} strokeWidth={12} />
        <rect x={210} y={492} width={660} height={776} rx={20} fill="#FFF3C4" stroke={MUREKKEP} strokeWidth={8} />
        {RAF_Y.map((y) => (
          <rect key={y} x={210} y={y - 4} width={660} height={14} fill="#BFD4F2" stroke={MUREKKEP} strokeWidth={5} />
        ))}
        <rect x={210} y={492} width={660} height={34} fill="#FFFFFF" opacity={0.55} />
      </svg>
      {raflar}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(890 0) scale(${s} 1) translate(-890 0)`}>
          <rect x={180} y={462} width={720} height={836} rx={44} fill="#FFFFFF" stroke={MUREKKEP} strokeWidth={12} />
          <rect x={206} y={510} width={22} height={300} rx={11} fill="#BFD4F2" stroke={MUREKKEP} strokeWidth={7} />
          <path d="M 250 520 Q 270 700 252 840" stroke="#D7ECFF" strokeWidth={14} strokeLinecap="round" fill="none" />
        </g>
        <rect x={190} y={1296} width={700} height={22} rx={8} fill="#8E96A3" stroke={MUREKKEP} strokeWidth={7} />
      </svg>
    </AbsoluteFill>
  );
};

/** The seven boxes flying from the shelves into our hands, then the walk back to the door (pan). */
const EvSonu: React.FC<{ readonly f: number }> = ({ f }) => {
  const { g, amp } = yuru(f);
  const yerler = kuleYerleri(W7, 330, 1262);
  const bosalma = interpolate(f, [652, 676], [1, 0], KL);
  const ogeler: (Oge | null)[] = W7.map((_, k) => {
    const inis = TOPLAMA(k) + 10;
    if (f < inis) return null;
    const eziklik = interpolate(f, [inis, inis + 2, inis + 6], [0, 1, 0], KL);
    return { i: k, dolum: bosalma, sx: 1 + 0.06 * eziklik, sy: 1 - 0.08 * eziklik };
  });
  const ucuslar = ALINANLAR.map(([r, c, t], k) => {
    const u = (f - TOPLAMA(k)) / 10;
    if (u < 0 || u >= 1) return null;
    const bas = rafYeri(r, c, t);
    const hedef = yerler[k];
    const e = YAVAS(u);
    const w = bas.w + (hedef.w - bas.w) * e;
    return (
      <KapYerde
        key={k}
        yer={{ x: bas.x + (hedef.x - bas.x) * e, y: bas.y + (hedef.y - bas.y) * e - 80 * Math.sin(Math.PI * e), w, h: w * 0.5 }}
        oge={{ i: k, dolum: 1 }}
      />
    );
  });
  const pan = interpolate(f, [654, 682], [0, 1], { ...KL, easing: YAVAS });
  return (
    <AbsoluteFill>
      {f < 684 ? (
        <AbsoluteFill style={{ translate: `${-1080 * pan}px 0px` }}>
          <Buzdolabi f={f} />
        </AbsoluteFill>
      ) : null}
      {f >= 654 ? (
        <AbsoluteFill style={{ translate: `${1080 * (1 - pan)}px 0px` }}>
          <KapiArka zoom={0.84} acik={0} zil={0} halka={false} />
        </AbsoluteFill>
      ) : null}
      {ucuslar}
      <PovKule yerler={yerler} ogeler={ogeler} g={g} amp={amp} />
    </AbsoluteFill>
  );
};

/* ---------- the scene layer: picks the scene by absolute frame ---------- */

const SahneKatmani: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 180) return <KapiGiris f={f} />;
  if (f < 468) return <Mutfak f={f} />;
  if (f < 582) return <KapiVeda f={f} />;
  if (f < 600) return null;
  return <EvSonu f={f} />;
};

/* ---------- screen text, badge ---------- */

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

/** The live "DOLU: n/7" block of scene 4 (frame-driven number). */
const DoluBlok: React.FC = () => {
  const frame = useCurrentFrame(); // the Sequence starts at 270
  const f = frame + 270;
  const n = doluSayisi(f);
  const tam = n >= 7;
  return (
    <Blok name="Dolu sayacı" arka={tam ? SARI : "#FFFFFF"} boyut={96} aci={2} top={228}>
      DOLU: <span style={{ color: KIRMIZI }}>{n}</span>/7
    </Blok>
  );
};

/** Top-right counter badge: "GELEN: 7 · GİDEN: ?" turning into 7, 8, 9. Sequence starts at 180. */
const KapRozeti: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame + 180;
  const giden = f < 378 ? "?" : f < 408 ? "7" : f < 438 ? "8" : "9";
  const degisim = f < 378 ? 0 : f < 408 ? 378 : f < 438 ? 408 : 438;
  const yay = degisim === 0 ? 1 : interpolate(f, [degisim, degisim + 3, degisim + 9], [1.25, 1.12, 1], KL);
  return (
    <Interactive.Div
      name="Kap sayacı"
      style={{
        position: "absolute",
        right: 100,
        top: 100,
        height: 95,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 26px",
        backgroundColor: "#FFFFFF",
        border: "6px solid #111111",
        borderRadius: 26,
        boxShadow: "8px 9px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 42,
        whiteSpace: "nowrap",
        color: "#111111",
        scale: interpolate(frame, [0, 7], [0.4, 1], { ...KL, easing: Easing.spring({ damping: 10 }), output: "perceptual-scale" }),
        opacity: interpolate(frame, [0, 3], [0, 1], KL),
      }}
    >
      <span>
        GELEN: <span style={{ color: MAVI }}>7</span>
      </span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>
        GİDEN:{" "}
        <span style={{ display: "inline-block", color: KIRMIZI, scale: `${yay}` }}>{giden}</span>
      </span>
    </Interactive.Div>
  );
};

/* ---------- scene 7: the cover (no captions: it sits above the caption layer) ---------- */

const KapakKaresi: React.FC = () => {
  const boyut = 760;
  const yerler = kuleYerleri(W9, 810, 1290);
  return (
    <AbsoluteFill style={{ backgroundColor: KIRMIZI }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(243,235,221,0.22) 1.2px, transparent 1.7px)", backgroundSize: "9px 9px" }} />
      <AbsoluteFill
        style={{
          backgroundColor: CREAM,
          clipPath: "polygon(0 67.2%, 12% 66.6%, 27% 67.4%, 44% 66.5%, 61% 67.3%, 78% 66.6%, 100% 67.2%, 100% 100%, 0 100%)",
        }}
      />
      {W9.map((_, i) => (
        <KapYerde key={i} yer={yerler[i]} oge={{ i, dolum: 1, sy: i === UZUN ? 0.8 : 1 }} />
      ))}
      <div style={{ position: "absolute", left: -10, top: 1290 - boyut, width: boyut, height: boyut }}>
        <Anne size={boyut} ifade="mutlu" konusuyor={false} kepceKaldir kirpmaGecikmesi={40} />
      </div>
      <Interactive.Div
        name="Kapak: 7 GÖTÜRDÜM"
        style={{
          position: "absolute",
          left: 110,
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
          fontSize: 120,
          lineHeight: 1,
          letterSpacing: -4,
          color: "#111111",
          textAlign: "center",
          whiteSpace: "nowrap",
          rotate: "-3deg",
        }}
      >
        7 GÖTÜRDÜM
      </Interactive.Div>
      <Interactive.Div
        name="Kapak: 9 DÖNDÜ"
        style={{
          position: "absolute",
          left: 150,
          top: 1330,
          width: 780,
          boxSizing: "border-box",
          padding: "2px 20px 12px",
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
          rotate: "2deg",
        }}
      >
        9 DÖNDÜ
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/* ---------- the composition ---------- */

export const Video05AnneninKaplari: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Track name="Sahneler">
        <Sequence name="1-8 Kapı, mutfak, buzdolabı" durationInFrames={durationInFrames}>
          <SahneKatmani />
        </Sequence>
      </Track>

      <Track name="Ekran yazıları">
        <Sequence name="1 Kanca: KAP İADESİ" from={3} durationInFrames={81}>
          <Blok name="Kanca" arka={SARI} boyut={86} aci={-2} top={228} carp>
            KAP İADESİ: <span style={{ color: KIRMIZI }}>7</span> KAP
          </Blok>
        </Sequence>
        <Sequence name="4 Dolu sayacı" from={270} durationInFrames={108}>
          <DoluBlok />
        </Sequence>
        <Sequence name="6 Punchline" from={530} durationInFrames={52}>
          <Blok name="Punchline" arka={SARI} boyut={92} aci={-2} top={215} carp>
            7 KAP GÖTÜRDÜM.
            <br />
            <span style={{ color: KIRMIZI }}>9</span> KAPLA DÖNDÜM.
          </Blok>
        </Sequence>
        <Sequence name="8 Haftaya" from={606} durationInFrames={80}>
          <Blok name="Haftaya" arka="#FFFFFF" boyut={104} aci={2} top={228} carp>
            HAFTAYA…
          </Blok>
        </Sequence>
      </Track>

      <Sequence name="Kap sayacı rozeti" from={180} durationInFrames={582 - 180}>
        <KapRozeti />
      </Sequence>

      <ShortsCaptions
        name="Altyazı"
        durationInFrames={durationInFrames}
        beklemeMs={500}
        birlestirmeMs={1500}
        vurguKelimeler={["ama"]}
        style={{ position: "absolute", top: 1340, left: 90, width: 900, fontSize: 66, columnGap: 28, wordSpacing: 10 }}
        captions={[
          { text: "Annemin", startMs: 300, endMs: 724, timestampMs: null, confidence: null },
          { text: " kaplarını", startMs: 724, endMs: 1254, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " sonunda", startMs: 1254, endMs: 1679, timestampMs: null, confidence: null },
          { text: " geri", startMs: 1679, endMs: 1944, timestampMs: null, confidence: null },
          { text: " götürüyorum.", startMs: 1944, endMs: 2580, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Yavrum,", startMs: 3000, endMs: 3496, timestampMs: null, confidence: null },
          { text: " hoş", startMs: 3496, endMs: 3779, timestampMs: null, confidence: null },
          { text: " geldin!", startMs: 3779, endMs: 4274, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Kaplarımı", startMs: 4274, endMs: 4982, timestampMs: null, confidence: null },
          { text: " mı", startMs: 4982, endMs: 5195, timestampMs: null, confidence: null },
          { text: " getirdin?", startMs: 5195, endMs: 5832, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Dur,", startMs: 6200, endMs: 6536, timestampMs: null, confidence: null },
          { text: " boş", startMs: 6536, endMs: 6872, timestampMs: null, confidence: null },
          { text: " gitmesin.", startMs: 6872, endMs: 7628, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Doldurayım.", startMs: 7628, endMs: 8552, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Fasulye,", startMs: 9200, endMs: 10027, timestampMs: null, confidence: null },
          { text: " pilav,", startMs: 10027, endMs: 10647, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " sarma,", startMs: 10647, endMs: 11268, timestampMs: null, confidence: null },
          { text: " börek…", startMs: 11268, endMs: 11888, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bu", startMs: 12800, endMs: 13176, timestampMs: null, confidence: null },
          { text: " da", startMs: 13176, endMs: 13553, timestampMs: null, confidence: null },
          { text: " kek.", startMs: 13553, endMs: 14055, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bu", startMs: 14055, endMs: 14431, timestampMs: null, confidence: null },
          { text: " da", startMs: 14431, endMs: 14807, timestampMs: null, confidence: null },
          { text: " turşu.", startMs: 14807, endMs: 15560, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bir", startMs: 15800, endMs: 16041, timestampMs: null, confidence: null },
          { text: " dahakine", startMs: 16041, endMs: 16585, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " kaplarımı", startMs: 16585, endMs: 17188, timestampMs: null, confidence: null },
          { text: " getir", startMs: 17188, endMs: 17551, timestampMs: null, confidence: null },
          { text: " ama!", startMs: 17551, endMs: 17792, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Haftaya", startMs: 20400, endMs: 20923, timestampMs: null, confidence: null },
          { text: " götürürüm.", startMs: 20923, endMs: 21576, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />

      <Sequence name="Kapak karesi" from={582} durationInFrames={18}>
        <KapakKaresi />
      </Sequence>

      <LogoBadge name="Logo" durationInFrames={durationInFrames} style={{ position: "absolute", top: 100, left: 80 }} />

      {/* The voice files have no leading silence: each starts on its line's first word. */}
      <Track name="Seslendirme">
        <Audio name="01 Anlatıcı: Annemin kaplarını" src={staticFile("voice/05-kaplar/01-anlatici.mp3")} volume={0.9} from={9} />
        <Audio name="02 Anne: Yavrum, hoş geldin" src={staticFile("voice/05-kaplar/02-anne.mp3")} volume={0.9} from={90} />
        <Audio name="03 Anne: Dur, boş gitmesin" src={staticFile("voice/05-kaplar/03-anne.mp3")} volume={0.9} from={186} />
        <Audio name="04 Anne: Fasulye, pilav" src={staticFile("voice/05-kaplar/04-anne.mp3")} volume={0.9} from={276} />
        <Audio name="05 Anne: Bu da kek" src={staticFile("voice/05-kaplar/05-anne.mp3")} volume={0.9} from={384} />
        <Audio name="06 Anne: Bir dahakine" src={staticFile("voice/05-kaplar/06-anne.mp3")} volume={0.9} from={474} />
        <Audio name="07 Anlatıcı: Haftaya götürürüm" src={staticFile("voice/05-kaplar/07-anlatici.mp3")} volume={0.9} from={612} />
      </Track>

      <Track name="Ses efektleri">
        {/* scene 1: walk, doorbell */}
        <Audio name="Yürüyüş" src={staticFile("sfx/soft-whoosh.wav")} from={0} volume={0.3} />
        <Audio name="Zil" src={staticFile("sfx/zil.wav")} from={72} durationInFrames={40} volume={0.5} />
        {/* scene 2: the door, the hand-over */}
        <Audio name="Kapı açılır" src={staticFile("sfx/kapi-acilis.wav")} from={84} durationInFrames={34} volume={0.5} />
        <Audio name="Kaplar teslim" src={staticFile("sfx/success.wav")} from={150} volume={0.35} />
        {/* scene 3: badge, seven lids pop open */}
        <Audio name="Rozet belirir" src={staticFile("sfx/pop.mp3")} from={180} volume={0.35} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Audio key={`kapak${i}`} name={`Kapak ${i + 1} açılır`} src={staticFile("sfx/tik.wav")} from={192 + 4 * i} volume={0.3} />
        ))}
        {/* scene 4: the fill montage */}
        <Audio name="Dolum hızlanır" src={staticFile("sfx/hizli-sar.wav")} from={270} volume={0.3} />
        {DOLUM_ZAMANI.map((t, i) => (
          <Audio key={`dolum${i}`} name={`Kap ${i + 1} dolar`} src={staticFile("sfx/tik.wav")} from={t + 6} volume={0.35} />
        ))}
        {/* scene 5: the tower, two more boxes, the ceiling */}
        <Audio name="Kule kurulur" src={staticFile("sfx/soft-whoosh.wav")} from={378} volume={0.3} />
        <Audio name="Kek konar" src={staticFile("sfx/hit.mp3")} from={408} durationInFrames={14} volume={0.3} />
        <Audio name="Turşu konar" src={staticFile("sfx/hit.mp3")} from={438} durationInFrames={14} volume={0.3} />
        <Audio name="Tavana çarpar, pıt" src={staticFile("sfx/pop.mp3")} from={441} volume={0.4} />
        {/* scene 6: the kiss, the punchline slams */}
        <Audio name="Öpücük" src={staticFile("sfx/pop.mp3")} from={518} volume={0.25} />
        <Audio name="Punchline çarpar" src={staticFile("sfx/hit.mp3")} from={530} durationInFrames={20} volume={0.5} />
        {/* scene 7: cover */}
        <Audio name="Kapak" src={staticFile("sfx/logo-hit.wav")} from={582} volume={0.5} />
        {/* scene 8: our fridge, seven boxes, the turn to the door and the loop seam */}
        <Audio name="Buzdolabı açılır" src={staticFile("sfx/buzdolabi.wav")} from={600} durationInFrames={40} volume={0.5} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Audio key={`alinan${i}`} name={`Kap ${i + 1} alınır`} src={staticFile("sfx/pop.mp3")} from={TOPLAMA(i) + 8} volume={0.2} />
        ))}
        <Audio name="Kapıya dön" src={staticFile("sfx/soft-whoosh.wav")} from={654} volume={0.25} />
        <Audio name="Döngü dikişi" src={staticFile("sfx/soft-whoosh.wav")} from={678} volume={0.3} />
      </Track>
    </>
  );
};
