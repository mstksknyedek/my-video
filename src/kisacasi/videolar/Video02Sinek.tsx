import { Audio } from "@remotion/media";
import { useId } from "react";
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
import { Agiz } from "../karakterler/Agiz";
import { gozAcikligi, Ifade, KIRMIZI, MUREKKEP, SARI } from "../karakterler/animasyon";
import { Kazim } from "../karakterler/Kazim";
import { Sinek } from "../karakterler/Sinek";
import { UgurHoca } from "../karakterler/UgurHoca";
import { LogoBadge } from "../LogoBadge";
import { PaperBackground } from "../PaperBackground";
import { ShortsCaptions } from "../ShortsCaptions";

// Video #2 "Sinek neden sofraya konar?" (script strategy/senaryolar/02-sinek-sofraya-konar.md,
// Uğur Hoca Anlatıyor #1), 1080x1920, 30 fps. Scene 5 of the script (the table guest) is cut.
// Timed to the real voiceover in public/voice/02-sinek (leading silence trimmed, each <Audio> starts
// on its line's first word).
//
// Scene starts (frame / s): 1 hook, fly lands on the bread 0 / 0.0 · 2 blackboard "feet taste" 88 / 2.93 ·
// 3 tap dance 196 / 6.53 · 4 "BASTI = TATTI" + evening class cutaway 232 / 7.73 (class at 302) ·
// 5 "DAHASI VAR" 335 / 11.17 · 6 spit/soften/suck diagram 395 / 13.17 · 7 cover 554 / 18.47 ·
// 8 "Ekmeği kapatın. Ders bitti!" 575 / 19.17 · 9 loop 755 / 25.17 · end 780 / 26.0.
// Loop: the fly slips back to the bread, the camera zooms into the bread close-up, and the last frames
// are the frames just before frame 0 (the fly coming down onto the bread).
//
// Layout: logo y 100-195 · screen text y 215-430 · scene y 440-1250 · captions y 1270-1450.

const TEBESIR = "#F2F0E6";
const TAHTA = "#2F4A3A";
const AHSAP = "#A8713A";
const MAVI_TUKURUK = "#7CC7F2";

// When Uğur Hoca's mouth moves: each voice line's start and end frame (from zamanlama.json).
const KONUSMA: [number, number][] = [
  [3, 85],
  [90, 193],
  [234, 331],
  [338, 392],
  [398, 549],
  [578, 739],
];

/** Uğur Hoca, talking whenever one of his lines plays. `sahneBasi` = the scene's first frame. */
const Hoca: React.FC<{
  readonly sahneBasi: number;
  readonly size: number;
  readonly ifade: Ifade;
  readonly tebesirSalliyor: boolean;
  readonly yon?: "sag" | "sol";
}> = ({ sahneBasi, size, ifade, tebesirSalliyor, yon }) => {
  const frame = useCurrentFrame();
  const f = frame + sahneBasi;
  const konusuyor = KONUSMA.some(([a, b]) => f >= a && f < b);
  return <UgurHoca size={size} ifade={ifade} konusuyor={konusuyor} tebesirSalliyor={tebesirSalliyor} yon={yon} />;
};

/* ---------- props and backgrounds ---------- */

const EKMEK_YOLU = "M 70 230 C 20 120 110 20 210 55 C 260 0 340 0 390 55 C 490 20 580 120 530 230 L 515 470 Q 300 515 85 470 Z";

/** A thick slice of bread lying flat, seen from the front and above. viewBox 600x360, top face centre (300, 164). */
const Ekmek: React.FC<{ readonly genislik: number }> = ({ genislik }) => (
  <svg width={genislik} height={(genislik * 360) / 600} viewBox="0 0 600 360" style={{ display: "block", overflow: "visible" }}>
    <ellipse cx={300} cy={352} rx={270} ry={16} fill={MUREKKEP} opacity={0.15} />
    <g transform="translate(0 62) scale(1 0.55)">
      <path d={EKMEK_YOLU} fill="#B8692A" stroke={MUREKKEP} strokeWidth={8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </g>
    <g transform="translate(0 10) scale(1 0.55)">
      <path d={EKMEK_YOLU} fill="#F7DFA4" stroke="#C47A2C" strokeWidth={22} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <path d={EKMEK_YOLU} fill="none" stroke={MUREKKEP} strokeWidth={8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </g>
    {[
      [190, 120, 9],
      [250, 200, 7],
      [380, 115, 8],
      [420, 215, 10],
      [160, 215, 6],
      [330, 240, 6],
      [300, 95, 5],
    ].map(([x, y, r]) => (
      <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={r} ry={r * 0.55} fill="#D9B46A" />
    ))}
  </svg>
);

/** The mesh food cover (sofra kapağı). viewBox 600x400, rim at y=380. */
const SofraKapagi: React.FC<{ readonly genislik: number }> = ({ genislik }) => {
  const id = useId().replace(/:/g, "");
  const kubbe = "M 40 380 Q 40 60 300 50 Q 560 60 560 380 Z";
  return (
    <svg width={genislik} height={(genislik * 400) / 600} viewBox="0 0 600 400" style={{ display: "block", overflow: "visible" }}>
      <defs>
        <clipPath id={`kubbe-${id}`}>
          <path d={kubbe} />
        </clipPath>
      </defs>
      <path d={kubbe} fill="#FFFFFF" fillOpacity={0.35} />
      <g clipPath={`url(#kubbe-${id})`} stroke="#6E7480" strokeWidth={3} fill="none">
        {[-200, -150, -100, -50, 0, 50, 100, 150, 200].map((dx) => (
          <path key={dx} d={`M ${300 + dx * 1.3} 400 Q ${300 + dx * 1.05} 120 300 40`} />
        ))}
        {[110, 160, 210, 260, 310, 355].map((y) => (
          <line key={y} x1={0} y1={y} x2={600} y2={y} />
        ))}
      </g>
      <path d={kubbe} fill="none" stroke={MUREKKEP} strokeWidth={8} strokeLinejoin="round" />
      <ellipse cx={300} cy={380} rx={262} ry={18} fill="#E9E2D6" stroke={MUREKKEP} strokeWidth={8} />
      <circle cx={300} cy={44} r={24} fill={KIRMIZI} stroke={MUREKKEP} strokeWidth={8} />
    </svg>
  );
};

/** Blackboard with a wooden frame and the small "Akşam Kursu" note in its top-right corner. */
const Tahta: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly kursYaziBoyu?: number;
  readonly children?: React.ReactNode;
}> = ({ x, y, w, h, kursYaziBoyu = 36, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: "border-box",
      backgroundColor: TAHTA,
      backgroundImage:
        "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.07), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(255,255,255,0.05), transparent 50%)",
      border: `18px solid ${AHSAP}`,
      borderRadius: 10,
      boxShadow: `0 0 0 7px ${MUREKKEP}, inset 0 0 0 5px ${MUREKKEP}, 12px 14px 0 7px ${MUREKKEP}`,
    }}
  >
    <div
      style={{
        position: "absolute",
        right: 22,
        top: 12,
        fontFamily: BODY_FONT,
        fontWeight: 700,
        fontSize: kursYaziBoyu,
        color: TEBESIR,
        opacity: 0.92,
        rotate: "-3deg",
        borderBottom: `4px solid ${TEBESIR}`,
        lineHeight: 1.1,
      }}
    >
      Akşam Kursu
    </div>
    {children}
    {/* chalk tray */}
    <div
      style={{
        position: "absolute",
        left: -18,
        right: -18,
        bottom: -34,
        height: 16,
        backgroundColor: AHSAP,
        border: `5px solid ${MUREKKEP}`,
        borderRadius: 4,
      }}
    />
  </div>
);

/** The classroom desk the bread sits on. */
const Sira: React.FC<{ readonly ust: number }> = ({ ust }) => (
  <div
    style={{
      position: "absolute",
      left: -20,
      top: ust,
      width: 1120,
      height: 1740 - ust,
      backgroundColor: "#B57B45",
      backgroundImage: "repeating-linear-gradient(180deg, transparent 0 118px, rgba(17,17,17,0.22) 118px 124px)",
      borderTop: `9px solid ${MUREKKEP}`,
    }}
  />
);

/** A chalk line that draws itself (stroke-dashoffset) from frame `bas` over `sure` frames. */
const CizilenYol: React.FC<{
  readonly d: string;
  readonly bas: number;
  readonly sure: number;
  readonly renk?: string;
  readonly kalinlik?: number;
}> = ({ d, bas, sure, renk = TEBESIR, kalinlik = 9 }) => {
  const frame = useCurrentFrame();
  return (
    <path
      d={d}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={interpolate(frame, [bas, bas + sure], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(0.33, 0, 0.4, 1),
      })}
      stroke={renk}
      strokeWidth={kalinlik}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={frame >= bas ? 0.95 : 0}
    />
  );
};

const elips = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;

/* ---------- scene 1 (and the end of the loop): the bread close-up ---------- */

/**
 * The bread on the desk with the fly. `ofset` shifts the fly's clock: t = frame + ofset, landing at t = 8.
 * Scene 1 uses ofset 0; the loop's last frames use ofset -6, so they are the frames just before frame 0.
 */
const EkmekYakin: React.FC<{ readonly ofset: number; readonly dans: boolean }> = ({ ofset, dans }) => {
  const frame = useCurrentFrame();
  const t = frame + ofset;
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const inis = Easing.bezier(0.2, 0.7, 0.3, 1);
  return (
    <AbsoluteFill>
      <PaperBackground />
      <Tahta x={60} y={470} w={960} h={520} />
      <Sira ust={1010} />
      <div style={{ position: "absolute", left: 160, top: 772 }}>
        <Ekmek genislik={760} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 352,
          top: 676,
          translate: `${interpolate(t, [-8, 8], [330, 0], { ...k, easing: inis })}px ${interpolate(t, [-8, 8], [-640, 0], { ...k, easing: inis })}px`,
          rotate: `${interpolate(t, [-8, 6, 8], [-18, -8, 0], k)}deg`,
          scale: interpolate(t, [8, 10, 13], [1, 1.06, 1], k),
        }}
      >
        <Sinek size={340} bacaklar={dans ? "dans" : "dur"} ucuyor={t < 8} tatAliyor={t >= 10} />
      </div>
    </AbsoluteFill>
  );
};

const KancaYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Kanca yazısı"
      style={{
        position: "absolute",
        left: 100,
        top: 215,
        width: 860,
        boxSizing: "border-box",
        padding: "10px 16px 18px",
        backgroundColor: "#FFFFFF",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "12px 14px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 76,
        lineHeight: 1.04,
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
      SİNEK EKMEĞİNİ
      <br />
      <span style={{ backgroundColor: "#F7C600", padding: "0 14px", borderRadius: 10 }}>AYAĞIYLA</span> TADIYOR
    </Interactive.Div>
  );
};

/* ---------- scene 2: the blackboard lesson ---------- */

const TahtaDersi: React.FC = () => {
  const frame = useCurrentFrame();
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // the feet light up on "ayaklarıyla" (scene frame 65)
  const parla = interpolate(frame, [65, 70], [0, 1], k);
  const ayaklar: [number, number][] = [
    [250, 470],
    [345, 478],
    [450, 476],
    [300, 480],
    [410, 486],
    [520, 480],
  ];
  return (
    <AbsoluteFill>
      <PaperBackground />
      <Sira ust={1150} />
      <Tahta x={60} y={450} w={960} h={680}>
        <svg width={924} height={644} viewBox="0 0 924 644" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* "BUGÜNKÜ DERS" written in chalk */}
          <text x={34} y={74} fontFamily={BODY_FONT} fontWeight={700} fontSize={50} fill={TEBESIR} opacity={interpolate(frame, [2, 8], [0, 0.95], k)}>
            BUGÜNKÜ DERS:
          </text>
          <CizilenYol d="M 34 92 L 380 88" bas={6} sure={8} kalinlik={6} />
          {/* the chalk fly draws itself */}
          <g transform="translate(110 0)">
          <CizilenYol d={elips(330, 340, 150, 95)} bas={8} sure={14} />
          <CizilenYol d="M 260 260 Q 250 340 270 425 M 205 275 Q 190 340 210 415" bas={20} sure={6} kalinlik={6} />
          <CizilenYol d={elips(540, 300, 92, 88)} bas={16} sure={10} />
          <CizilenYol d={elips(575, 270, 52, 60)} bas={24} sure={8} />
          <CizilenYol d={elips(505, 262, 40, 48)} bas={26} sure={8} />
          <CizilenYol d="M 380 250 C 350 150 220 120 190 180 C 170 230 280 265 380 250 Z" bas={30} sure={10} renk="#BFE6FF" kalinlik={7} />
          <CizilenYol d="M 400 255 C 410 150 330 90 290 130 C 255 170 320 240 400 255 Z" bas={34} sure={10} renk="#BFE6FF" kalinlik={7} />
          <CizilenYol d="M 585 380 L 595 440" bas={40} sure={5} kalinlik={10} />
          <CizilenYol d="M 225 420 L 195 400 L 250 470 M 300 430 L 300 395 L 345 478 M 390 425 L 430 395 L 450 476" bas={42} sure={12} kalinlik={7} />
          <CizilenYol d="M 260 430 L 240 405 L 300 480 M 350 432 L 365 400 L 410 486 M 430 420 L 480 400 L 520 480" bas={46} sure={12} kalinlik={8} />
          {/* glowing feet: the taste sensors */}
          {ayaklar.map(([x, y], i) => (
            <g key={i} opacity={parla}>
              <circle cx={x} cy={y} r={30} fill={SARI} opacity={0.35} />
              <circle cx={x} cy={y} r={14} fill={SARI} stroke={MUREKKEP} strokeWidth={4} />
            </g>
          ))}
          </g>
          {/* arrow + label */}
          <g opacity={interpolate(frame, [68, 72], [0, 1], k)}>
            <CizilenYol d="M 690 545 Q 690 512 652 500 M 668 486 L 650 500 L 668 514" bas={68} sure={8} renk={SARI} kalinlik={9} />
            <text x={560} y={598} fontFamily={HEADLINE_FONT} fontWeight={700} fontSize={60} fill={SARI}>
              TAT ALICI
            </text>
          </g>
          <text x={900} y={624} textAnchor="end" fontFamily={BODY_FONT} fontWeight={700} fontSize={24} fill={TEBESIR} opacity={0.85}>
            Kaynak: Kuzey Illinois Üniv. (NIU)
          </text>
        </svg>
      </Tahta>
      <div style={{ position: "absolute", left: -30, top: 772 }}>
        <Hoca sahneBasi={88} size={420} ifade="mutlu" tebesirSalliyor={frame < 60} />
      </div>
    </AbsoluteFill>
  );
};

const DersYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Ders yazısı"
      style={{
        position: "absolute",
        left: 100,
        top: 210,
        width: 860,
        boxSizing: "border-box",
        padding: "8px 16px 18px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "12px 14px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 86,
        lineHeight: 1.02,
        letterSpacing: -1,
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
      SİNEK TADI
      <br />
      <span style={{ color: "#E51C0F" }}>AYAĞIYLA</span> ALIR
    </Interactive.Div>
  );
};

/* ---------- scene 3: the tap dance ---------- */

const TuzuAzBalonu: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Balon: tuzu az"
      style={{
        position: "absolute",
        left: 90,
        top: 440,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        padding: "16px 24px 22px",
        backgroundColor: "#FFFFFF",
        border: "8px solid #111111",
        borderRadius: 40,
        boxShadow: "10px 12px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 1,
        textAlign: "center",
        color: "#111111",
        rotate: "-4deg",
        scale: interpolate(frame, [0, 6], [0.3, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 10 }),
          output: "perceptual-scale",
        }),
      }}
    >
      Hmm… tuzu az.
      <svg width={80} height={90} viewBox="0 0 80 90" style={{ position: "absolute", left: 380, top: 84, overflow: "visible" }}>
        <path d="M 0 0 L 60 80 L 50 0 Z" fill="#FFFFFF" stroke="#111111" strokeWidth={8} strokeLinejoin="round" />
        <rect x={-4} y={-14} width={62} height={16} fill="#FFFFFF" />
      </svg>
    </Interactive.Div>
  );
};

/* ---------- scene 4: "BASTI = TATTI", then one second of the evening class ---------- */

const BastiSahnesi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PaperBackground />
      <Tahta x={60} y={470} w={960} h={520} />
      <Sira ust={1010} />
      <div style={{ position: "absolute", left: 540, top: 890 }}>
        <Ekmek genislik={460} />
      </div>
      {/* fly: x = 540 + 300*460/600 - 0.55*230, y = 890 + 164*460/600 - 0.9*230 */}
      <div style={{ position: "absolute", left: 643, top: 809 }}>
        <Sinek size={230} bacaklar="dur" ucuyor={false} tatAliyor kirpmaGecikmesi={30} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 470,
          top: 600,
          whiteSpace: "nowrap",
          padding: "10px 24px 16px",
          backgroundColor: "#FFFFFF",
          border: "7px solid #111111",
          borderRadius: 34,
          boxShadow: "8px 10px 0 #111111",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 56,
          color: "#111111",
          rotate: "4deg",
          scale: interpolate(frame, [20, 26], [0.3, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 10 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [20, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Mmm, idare eder.
      </div>
      <div style={{ position: "absolute", left: 0, top: 720 }}>
        <Hoca sahneBasi={232} size={560} ifade="mutlu" tebesirSalliyor={frame < 30} />
      </div>
    </AbsoluteFill>
  );
};

const BastiTattiYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="BASTI = TATTI"
      style={{
        position: "absolute",
        left: 110,
        top: 220,
        width: 840,
        boxSizing: "border-box",
        padding: "6px 16px 18px",
        backgroundColor: "#F7C600",
        border: "9px solid #111111",
        borderRadius: 20,
        boxShadow: "14px 16px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 124,
        lineHeight: 1,
        letterSpacing: -2,
        textAlign: "center",
        color: "#111111",
        rotate: "-3deg",
        scale: interpolate(frame, [0, 6], [1.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 10 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      BASTI = TATTI
    </Interactive.Div>
  );
};

/** An adult cockroach in the evening class, yawning over a glass of tea. viewBox 600x600. */
const EsneyenHamamboceği: React.FC<{ readonly size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const goz = gozAcikligi(frame, fps, 50) * 0.45; // sleepy: half-shut
  const esne = interpolate(frame, [0, 10, 26, 34], [0.1, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const buhar = (frame % 20) / 20;
  return (
    <svg width={size} height={size} viewBox="0 0 600 600" style={{ overflow: "visible" }}>
      {/* long drooping antennae */}
      <path d="M 280 150 C 230 40 120 30 60 90" stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M 330 150 C 380 30 500 20 560 110" stroke={MUREKKEP} strokeWidth={7} strokeLinecap="round" fill="none" />
      {/* body, wing cases */}
      <ellipse cx={300} cy={430} rx={170} ry={190} fill="#7A3E1C" stroke={MUREKKEP} strokeWidth={8} />
      <path d="M 300 270 L 300 610" stroke={MUREKKEP} strokeWidth={6} />
      <path d="M 200 330 Q 220 300 260 290" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.3} />
      {/* head */}
      <ellipse cx={300} cy={225} rx={110} ry={95} fill="#5A2A12" stroke={MUREKKEP} strokeWidth={8} />
      {[255, 345].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={205} rx={30} ry={30} fill="#FFFFFF" stroke={MUREKKEP} strokeWidth={5} />
          <ellipse cx={x + 3} cy={212} rx={11} ry={11 * Math.max(0.2, goz * 2)} fill={MUREKKEP} />
          {/* heavy eyelid */}
          <path d={`M ${x - 31} 205 A 31 31 0 0 1 ${x + 31} 205 Z`} fill="#5A2A12" stroke={MUREKKEP} strokeWidth={5} />
        </g>
      ))}
      <Agiz cx={300} cy={262} genislik={60 + esne * 30} egri={0} acik={esne} yuvarlak cizgi={MUREKKEP} kalinlik={6} />
      {/* arm to the tea glass */}
      <path d="M 410 420 Q 470 470 475 510" stroke={MUREKKEP} strokeWidth={11} strokeLinecap="round" fill="none" />
      {/* tulip tea glass on a saucer */}
      <ellipse cx={500} cy={600} rx={70} ry={14} fill="#FFFFFF" stroke={MUREKKEP} strokeWidth={6} />
      <path d="M 465 470 Q 455 520 478 548 Q 452 572 470 596 L 530 596 Q 548 572 522 548 Q 545 520 535 470 Z" fill="#C0561E" fillOpacity={0.9} stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 465 470 L 535 470" stroke={MUREKKEP} strokeWidth={6} />
      <path d="M 476 490 Q 472 520 485 540" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.5} />
      {[0, 1].map((i) => (
        <path
          key={i}
          d={`M ${490 + i * 22} ${452 - buhar * 40} q -10 -14 0 -28 q 10 -14 0 -28`}
          stroke="#FFFFFF"
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          opacity={(1 - buhar) * 0.8}
        />
      ))}
    </svg>
  );
};

const AksamKursuSinifi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ scale: interpolate(frame, [0, 33], [1.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
      <PaperBackground />
      <Tahta x={60} y={460} w={960} h={420} kursYaziBoyu={48}>
        <svg width={924} height={384} viewBox="0 0 924 384" style={{ position: "absolute", left: 0, top: 0 }}>
          <text x={40} y={110} fontFamily={BODY_FONT} fontWeight={700} fontSize={54} fill={TEBESIR} opacity={0.95}>
            Konu: SİNEKLER
          </text>
          <path d={elips(560, 230, 60, 38)} stroke={TEBESIR} strokeWidth={7} fill="none" />
          <path d="M 620 230 L 700 230 M 680 215 L 700 230 L 680 245" stroke={SARI} strokeWidth={7} fill="none" strokeLinecap="round" />
        </svg>
      </Tahta>
      <div style={{ position: "absolute", left: 40, top: 640 }}>
        <EsneyenHamamboceği size={460} />
      </div>
      <div style={{ position: "absolute", left: 560, top: 650 }}>
        <Kazim size={470} ifade="saskin" konusuyor={false} yuruyor={false} yon="sol" kirpmaGecikmesi={20} />
      </div>
      {/* two school desks in front of them */}
      {[40, 560].map((x) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x,
            top: 1060,
            width: 480,
            height: 190,
            boxSizing: "border-box",
            backgroundColor: "#B57B45",
            border: "8px solid #111111",
            borderTop: "26px solid #8C5A2E",
            borderRadius: 10,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- scene 5: "Ama dahası var" ---------- */

const DahasiVar: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#E51C0F" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(243,235,221,0.22) 1.2px, transparent 1.7px)",
          backgroundSize: "9px 9px",
        }}
      />
      <div style={{ position: "absolute", left: 150, top: 560 }}>
        <Hoca sahneBasi={335} size={700} ifade="sinirli" tebesirSalliyor={false} />
      </div>
    </AbsoluteFill>
  );
};

const DahasiVarYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Dahası var"
      style={{
        position: "absolute",
        left: 80,
        top: 220,
        width: 920,
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 130,
        lineHeight: 1,
        letterSpacing: -3,
        textAlign: "center",
        color: "#FFFFFF",
        WebkitTextStroke: "16px #111111",
        paintOrder: "stroke fill",
        textShadow: "0 12px 0 #111111",
        scale: interpolate(frame, [0, 6], [0.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 11 }),
          output: "perceptual-scale",
        }),
      }}
    >
      DAHASI VAR…
    </Interactive.Div>
  );
};

const CignemezYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Çiğneyemez"
      style={{
        position: "absolute",
        left: 110,
        top: 400,
        width: 840,
        boxSizing: "border-box",
        padding: "6px 16px 16px",
        backgroundColor: "#F7C600",
        border: "9px solid #111111",
        borderRadius: 20,
        boxShadow: "14px 16px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 92,
        lineHeight: 1,
        letterSpacing: -2,
        textAlign: "center",
        color: "#111111",
        rotate: "-2deg",
        scale: interpolate(frame, [0, 6], [1.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 10 }),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      SİNEK ÇİĞNEYEMEZ
    </Interactive.Div>
  );
};

/* ---------- scene 6: the three-step diagram ---------- */

const ADIM_Y = [60, 300, 540];

/** Step label in chalk: a yellow number and white words, appearing at frame `bas`. */
const AdimYazisi: React.FC<{ readonly no: number; readonly metin: string; readonly bas: number }> = ({ no, metin, bas }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 400,
        top: ADIM_Y[no - 1] + 64,
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 80,
        lineHeight: 1,
        color: TEBESIR,
        opacity: interpolate(frame, [bas, bas + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        translate: `${interpolate(frame, [bas, bas + 6], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) })}px 0px`,
      }}
    >
      <span style={{ color: SARI }}>{no}.</span> {metin}
    </div>
  );
};

const SemaSahnesi: React.FC = () => {
  const frame = useCurrentFrame();
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // spoken: "tükürük" 44 · "Yumuşatır" 72 · "Sonra" 93 · slurp 117-150 (scene frames)
  const ADIM = [42, 70, 92];
  const damlaY = interpolate(frame, [ADIM[0] + 4, ADIM[0] + 14], [128, 168], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  const gol1 = interpolate(frame, [ADIM[0] + 13, ADIM[0] + 20], [0, 34], k);
  const gol2 = interpolate(frame, [ADIM[1], ADIM[1] + 16], [30, 105], { ...k, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const gol3 = interpolate(frame, [117, 150], [100, 14], k);
  const yuzey = 178;
  const ekmekCizgisi = (y0: number) => (
    <>
      <path d={`M 20 ${y0 + yuzey} L 360 ${y0 + yuzey} L 352 ${y0 + yuzey + 42} L 28 ${y0 + yuzey + 42} Z`} fill="#F7DFA4" stroke={MUREKKEP} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M 20 ${y0 + yuzey} L 360 ${y0 + yuzey}`} stroke="#C47A2C" strokeWidth={8} strokeLinecap="round" />
    </>
  );
  return (
    <AbsoluteFill>
      <PaperBackground />
      <Tahta x={60} y={440} w={960} h={800}>
        <svg width={924} height={764} viewBox="0 0 924 764" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* divider lines between the steps */}
          <CizilenYol d="M 30 290 L 890 290" bas={ADIM[1] - 4} sure={8} kalinlik={4} />
          <CizilenYol d="M 30 530 L 890 530" bas={ADIM[2] - 4} sure={8} kalinlik={4} />
          {/* step 1: spit drop falls on the bread */}
          <g opacity={frame >= ADIM[0] - 2 ? 1 : 0}>
            {ekmekCizgisi(ADIM_Y[0])}
            <ellipse cx={208} cy={ADIM_Y[0] + yuzey + 2} rx={gol1} ry={gol1 * 0.28} fill={MAVI_TUKURUK} stroke={MUREKKEP} strokeWidth={gol1 > 0 ? 5 : 0} />
            {frame < ADIM[0] + 15 ? (
              <path d={`M 208 ${ADIM_Y[0] + damlaY - 20} q -14 22 0 30 q 14 -8 0 -30 Z`} fill={MAVI_TUKURUK} stroke={MUREKKEP} strokeWidth={5} opacity={frame >= ADIM[0] + 4 ? 1 : 0} />
            ) : null}
          </g>
          {/* step 2: the spot softens into a puddle */}
          <g opacity={frame >= ADIM[1] - 2 ? 1 : 0}>
            {ekmekCizgisi(ADIM_Y[1])}
            <ellipse cx={190} cy={ADIM_Y[1] + yuzey + 4} rx={gol2} ry={gol2 * 0.26} fill={MAVI_TUKURUK} stroke={MUREKKEP} strokeWidth={5} />
            <CizilenYol d={`M 120 ${ADIM_Y[1] + 130} q 15 -15 30 0 t 30 0 t 30 0 t 30 0 t 30 0`} bas={ADIM[1] + 4} sure={8} renk="#BFE6FF" kalinlik={7} />
            <CizilenYol d={`M 140 ${ADIM_Y[1] + 90} q 15 -15 30 0 t 30 0 t 30 0 t 30 0`} bas={ADIM[1] + 8} sure={8} renk="#BFE6FF" kalinlik={7} />
          </g>
          {/* step 3: the proboscis straw sucks the puddle up */}
          <g opacity={frame >= ADIM[2] - 2 ? 1 : 0}>
            {ekmekCizgisi(ADIM_Y[2])}
            <ellipse cx={232} cy={ADIM_Y[2] + yuzey + 4} rx={gol3} ry={gol3 * 0.26} fill={MAVI_TUKURUK} stroke={MUREKKEP} strokeWidth={5} />
            {[0, 1, 2].map((i) => {
              const p = ((frame - 117) / 10 + i / 3) % 1;
              return frame >= 117 && frame < 150 ? (
                <circle key={i} cx={262} cy={ADIM_Y[2] + 160 - p * 60} r={7} fill={MAVI_TUKURUK} stroke={MUREKKEP} strokeWidth={3} />
              ) : null;
            })}
          </g>
          <text x={900} y={748} textAnchor="end" fontFamily={BODY_FONT} fontWeight={700} fontSize={24} fill={TEBESIR} opacity={0.85}>
            Kaynak: Penn State Extension
          </text>
        </svg>
        {/* the cartoon fly in steps 1 and 3 (size 180: feet at 162 px, proboscis tip at x 148) */}
        <div style={{ position: "absolute", left: 60, top: ADIM_Y[0] + 16, opacity: frame >= ADIM[0] - 2 ? 1 : 0 }}>
          <Sinek size={180} bacaklar="dur" ucuyor={false} tatAliyor={false} hortum={0.15} />
        </div>
        <div style={{ position: "absolute", left: 84, top: ADIM_Y[2] + 16, opacity: frame >= ADIM[2] - 2 ? 1 : 0 }}>
          <Sinek size={180} bacaklar="dur" ucuyor={false} tatAliyor={false} hortum={interpolate(frame, [ADIM[2], ADIM[2] + 10], [0, 0.42], k)} />
        </div>
        <AdimYazisi no={1} metin="TÜKÜRÜR" bas={ADIM[0]} />
        <AdimYazisi no={2} metin="ERİTİR" bas={ADIM[1]} />
        <AdimYazisi no={3} metin="EMER" bas={ADIM[2]} />
      </Tahta>
      {/* Uğur Hoca sits on top of the board, disgusted */}
      <div style={{ position: "absolute", left: 790, top: 192 }}>
        <Hoca sahneBasi={395} size={270} ifade="uzgun" tebesirSalliyor={false} yon="sol" />
      </div>
    </AbsoluteFill>
  );
};

const SemaBasligi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Şema başlığı"
      style={{
        position: "absolute",
        left: 80,
        top: 212,
        width: 700,
        boxSizing: "border-box",
        padding: "6px 14px 14px",
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
        rotate: "-2deg",
        scale: interpolate(frame, [0, 7], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 11 }),
          output: "perceptual-scale",
        }),
      }}
    >
      TÜKÜRÜP ERİTİR,
      <br />
      <span style={{ color: "#E51C0F" }}>SONRA EMER</span>
    </Interactive.Div>
  );
};

/* ---------- scene 7: the cover frame (no captions: it sits above the caption layer) ---------- */

const KapakKaresi: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#E51C0F" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(243,235,221,0.22) 1.2px, transparent 1.7px)",
          backgroundSize: "9px 9px",
        }}
      />
      {/* torn cream paper, lower part */}
      <AbsoluteFill
        style={{
          backgroundColor: "#F3EBDD",
          clipPath:
            "polygon(0 52%, 12% 50.9%, 27% 52.3%, 44% 50.8%, 61% 52.2%, 78% 50.9%, 100% 52%, 100% 100%, 0 100%)",
        }}
      />
      <div style={{ position: "absolute", left: 470, top: 1080 }}>
        <Ekmek genislik={540} />
      </div>
      <div style={{ position: "absolute", left: 556, top: 862 }}>
        <Sinek size={380} bacaklar="dur" ucuyor={false} tatAliyor />
      </div>
      <div style={{ position: "absolute", left: 10, top: 930 }}>
        <UgurHoca size={500} ifade="saskin" konusuyor={false} tebesirSalliyor={false} kirpmaGecikmesi={40} />
      </div>
      <Interactive.Div
        name="Kapak: SİNEK"
        style={{
          position: "absolute",
          left: 80,
          top: 250,
          width: 920,
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 190,
          lineHeight: 1,
          letterSpacing: -4,
          color: "#FFFFFF",
          WebkitTextStroke: "18px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 14px 0 #111111",
          textAlign: "center",
        }}
      >
        SİNEK
      </Interactive.Div>
      <Interactive.Div
        name="Kapak: AYAĞIYLA"
        style={{
          position: "absolute",
          left: 110,
          top: 465,
          width: 860,
          boxSizing: "border-box",
          padding: "2px 20px 14px",
          backgroundColor: "#F7C600",
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
          rotate: "-3deg",
        }}
      >
        AYAĞIYLA
      </Interactive.Div>
      <Interactive.Div
        name="Kapak: TADAR"
        style={{
          position: "absolute",
          left: 80,
          top: 680,
          width: 920,
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 190,
          lineHeight: 1,
          letterSpacing: -4,
          color: "#FFFFFF",
          WebkitTextStroke: "18px #111111",
          paintOrder: "stroke fill",
          textShadow: "0 14px 0 #111111",
          textAlign: "center",
        }}
      >
        TADAR
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/* ---------- scene 8: "Ekmeği kapatın. Ders bitti!" ---------- */

/** The classroom of the last scene; scene 9 (the loop) reuses it with the teacher leaving. */
const SonSinif: React.FC<{ readonly sahneBasi: number; readonly yaziBas: number; readonly ayrilis: boolean }> = ({
  sahneBasi,
  yaziBas,
  ayrilis,
}) => {
  const frame = useCurrentFrame();
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // the dome drops at frame 100-113 (hit on "kapatın"); in the loop its edge lifts for the fly
  const kapakY = ayrilis ? 0 : interpolate(frame, [100, 113], [-1000, 0], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) });
  const kapakAci = ayrilis ? interpolate(frame, [2, 8, 12, 15], [0, -9, -9, 0], k) : 0;
  return (
    <AbsoluteFill>
      <PaperBackground />
      <Tahta x={60} y={450} w={960} h={540}>
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 150,
            height: 220,
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: interpolate(frame, [yaziBas, yaziBas + 18], [0, 860], k),
            fontFamily: HEADLINE_FONT,
            fontWeight: 700,
            fontSize: 150,
            lineHeight: 1.3,
            color: TEBESIR,
            rotate: "-2deg",
          }}
        >
          DERS BİTTİ!
        </div>
      </Tahta>
      <Sira ust={1010} />
      <div style={{ position: "absolute", left: 560, top: 1010 }}>
        <Ekmek genislik={420} />
      </div>
      {ayrilis ? null : (
        // the fly sits on the bread until it is shooed off just before the dome drops
        <div
          style={{
            position: "absolute",
            left: 655,
            top: 945,
            translate: `${interpolate(frame, [88, 100], [0, 520], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) })}px ${interpolate(frame, [88, 100], [0, -700], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) })}px`,
          }}
        >
          <Sinek size={200} bacaklar={frame < 88 ? "yuru" : "dur"} ucuyor={frame >= 88} tatAliyor={frame < 88} kirpmaGecikmesi={12} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 530,
          top: 830,
          translate: `0px ${kapakY}px`,
          rotate: `${kapakAci}deg`,
          transformOrigin: "10% 95%",
        }}
      >
        <SofraKapagi genislik={480} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 700,
          translate: `${ayrilis ? interpolate(frame, [0, 14], [0, -560], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) }) : 0}px 0px`,
        }}
      >
        <Hoca
          sahneBasi={sahneBasi}
          size={500}
          ifade="mutlu"
          tebesirSalliyor={!ayrilis && frame >= yaziBas - 4 && frame < yaziBas + 22}
          yon={ayrilis ? "sol" : "sag"}
        />
      </div>
    </AbsoluteFill>
  );
};

const KapatinYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Ekmeği kapatın"
      style={{
        position: "absolute",
        left: 100,
        top: 212,
        width: 860,
        boxSizing: "border-box",
        padding: "8px 16px 18px",
        backgroundColor: "#F7C600",
        border: "8px solid #111111",
        borderRadius: 18,
        boxShadow: "12px 14px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 84,
        lineHeight: 1.02,
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
      KISACASI:
      <br />
      <span style={{ color: "#E51C0F" }}>EKMEĞİ KAPATIN</span>
    </Interactive.Div>
  );
};

const DersBittiYazisi: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Interactive.Div
      name="Ders bitti"
      style={{
        position: "absolute",
        left: 110,
        top: 220,
        width: 840,
        boxSizing: "border-box",
        padding: "6px 16px 18px",
        backgroundColor: "#E51C0F",
        border: "9px solid #111111",
        borderRadius: 20,
        boxShadow: "14px 16px 0 #111111",
        fontFamily: HEADLINE_FONT,
        fontWeight: 700,
        fontSize: 130,
        lineHeight: 1,
        letterSpacing: -3,
        textAlign: "center",
        color: "#FFFFFF",
        rotate: "3deg",
        scale: interpolate(frame, [0, 6], [1.5, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 10 }),
          output: "perceptual-scale",
        }),
      }}
    >
      DERS BİTTİ!
    </Interactive.Div>
  );
};

/* ---------- scene 9: the loop ---------- */

/** The teacher leaves, the fly slips under the dome, the camera dives into the bread. */
const DonguSahnesi: React.FC = () => {
  const frame = useCurrentFrame();
  const k = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transformOrigin: "770px 1115px",
          scale: interpolate(frame, [11, 19], [1, 2.6], { ...k, easing: Easing.bezier(0.5, 0, 0.75, 0) }),
        }}
      >
        <SonSinif sahneBasi={755} yaziBas={-100} ayrilis />
        <div
          style={{
            position: "absolute",
            left: 640,
            top: 940,
            translate: `${interpolate(frame, [0, 10], [420, 0], { ...k, easing: Easing.bezier(0.2, 0.7, 0.3, 1) })}px ${interpolate(frame, [0, 10], [-420, 0], { ...k, easing: Easing.bezier(0.2, 0.7, 0.3, 1) })}px`,
          }}
        >
          <Sinek size={160} bacaklar="dur" ucuyor tatAliyor={false} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Video02Sinek: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Track name="Sahneler">
        <Sequence name="1 Kanca: sinek ekmeğe konar" durationInFrames={88}>
          <EkmekYakin ofset={0} dans={false} />
        </Sequence>
        <Sequence name="2 Tahta: ayakla tat" from={88} durationInFrames={108}>
          <TahtaDersi />
        </Sequence>
        <Sequence name="3 Step dansı" from={196} durationInFrames={36}>
          <EkmekYakin ofset={200} dans />
        </Sequence>
        <Sequence name="4 Bastı = tattı" from={232} durationInFrames={70}>
          <BastiSahnesi />
        </Sequence>
        <Sequence name="4b Akşam kursu sınıfı" from={302} durationInFrames={33}>
          <AksamKursuSinifi />
        </Sequence>
        <Sequence name="5 Dahası var" from={335} durationInFrames={60}>
          <DahasiVar />
        </Sequence>
        <Sequence name="6 Şema: tükür, erit, em" from={395} durationInFrames={159}>
          <SemaSahnesi />
        </Sequence>
        <Sequence name="8 Ekmeği kapatın, ders bitti" from={575} durationInFrames={180}>
          <SonSinif sahneBasi={575} yaziBas={143} ayrilis={false} />
        </Sequence>
        <Sequence name="9 Döngü: hoca çıkar, sinek döner" from={755} durationInFrames={19}>
          <DonguSahnesi />
        </Sequence>
        {/* the last 6 frames are the 6 frames before frame 0 */}
        <Sequence name="9b Döngü: ekmek yakın plan" from={774} durationInFrames={6}>
          <EkmekYakin ofset={-6} dans={false} />
        </Sequence>
      </Track>

      {/* scene 1: Uğur Hoca slides in from the right */}
      <Sequence name="Hoca girer" durationInFrames={88}>
        <HocaGirer />
      </Sequence>

      <Track name="Ekran yazıları">
        <Sequence name="Kanca" durationInFrames={88}>
          <KancaYazisi />
        </Sequence>
        <Sequence name="Ders: ayağıyla alır" from={88} durationInFrames={108}>
          <DersYazisi />
        </Sequence>
        <Sequence name="Balon: tuzu az" from={204} durationInFrames={28}>
          <TuzuAzBalonu />
        </Sequence>
        <Sequence name="BASTI = TATTI" from={232} durationInFrames={103}>
          <BastiTattiYazisi />
        </Sequence>
        <Sequence name="Dahası var" from={335} durationInFrames={60}>
          <DahasiVarYazisi />
        </Sequence>
        <Sequence name="Sinek çiğneyemez" from={366} durationInFrames={29}>
          <CignemezYazisi />
        </Sequence>
        <Sequence name="Şema başlığı" from={395} durationInFrames={159}>
          <SemaBasligi />
        </Sequence>
        <Sequence name="Kısacası: ekmeği kapatın" from={575} durationInFrames={143}>
          <KapatinYazisi />
        </Sequence>
        <Sequence name="Ders bitti" from={718} durationInFrames={37}>
          <DersBittiYazisi />
        </Sequence>
      </Track>

      <ShortsCaptions
        name="Altyazı"
        durationInFrames={durationInFrames}
        beklemeMs={500}
        birlestirmeMs={1500}
        style={{ position: "absolute", top: 1270, left: 90, width: 900, fontSize: 76 }}
        captions={[
          { text: "Sinek", startMs: 100, endMs: 473, timestampMs: null, confidence: null },
          { text: " ekmeğine", startMs: 473, endMs: 1033, timestampMs: null, confidence: null },
          { text: " kondu.", startMs: 1033, endMs: 1406, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Aslında…", startMs: 1406, endMs: 1903, timestampMs: null, confidence: null },
          { text: " tadına", startMs: 1903, endMs: 2339, timestampMs: null, confidence: null },
          { text: " bakıyor.", startMs: 2339, endMs: 2836, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Bugünkü", startMs: 3000, endMs: 3538, timestampMs: null, confidence: null },
          { text: " dersimiz:", startMs: 3538, endMs: 4144, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " sinekler,", startMs: 4144, endMs: 4750, timestampMs: null, confidence: null },
          { text: " tadı", startMs: 4750, endMs: 5086, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " ayaklarıyla", startMs: 5086, endMs: 5894, timestampMs: null, confidence: null },
          { text: " da", startMs: 5894, endMs: 6096, timestampMs: null, confidence: null },
          { text: " alır.", startMs: 6096, endMs: 6432, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Yani", startMs: 7800, endMs: 8168, timestampMs: null, confidence: null },
          { text: " o", startMs: 8168, endMs: 8315, timestampMs: null, confidence: null },
          { text: " ekmeğe", startMs: 8315, endMs: 8831, timestampMs: null, confidence: null },
          { text: " bastıysa,", startMs: 8831, endMs: 9494, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " tadına", startMs: 9494, endMs: 10009, timestampMs: null, confidence: null },
          { text: " çoktan", startMs: 10009, endMs: 10525, timestampMs: null, confidence: null },
          { text: " bakmış.", startMs: 10525, endMs: 11040, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Ama", startMs: 11267, endMs: 11492, timestampMs: null, confidence: null },
          { text: " dahası", startMs: 11492, endMs: 11886, timestampMs: null, confidence: null },
          { text: " var.", startMs: 11886, endMs: 12111, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Sinek", startMs: 12111, endMs: 12448, timestampMs: null, confidence: null },
          { text: " çiğneyemez.", startMs: 12448, endMs: 13067, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Önce", startMs: 13267, endMs: 13608, timestampMs: null, confidence: null },
          { text: " yemeğin", startMs: 13608, endMs: 14152, timestampMs: null, confidence: null },
          { text: " üstüne", startMs: 14152, endMs: 14629, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " tükürük", startMs: 14629, endMs: 15174, timestampMs: null, confidence: null },
          { text: " döker.", startMs: 15174, endMs: 15583, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Yumuşatır.", startMs: 15583, endMs: 16264, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Sonra", startMs: 16264, endMs: 16672, timestampMs: null, confidence: null },
          { text: " pipetle", startMs: 16672, endMs: 17217, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " çeker", startMs: 17217, endMs: 17626, timestampMs: null, confidence: null },
          { text: " gibi", startMs: 17626, endMs: 17966, timestampMs: null, confidence: null },
          { text: " emer.", startMs: 17966, endMs: 18307, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Kısacası", startMs: 19267, endMs: 19857, timestampMs: null, confidence: null },
          { text: " millet:", startMs: 19857, endMs: 20316, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " sinek", startMs: 20316, endMs: 20709, timestampMs: null, confidence: null },
          { text: " sofraya", startMs: 20709, endMs: 21234, timestampMs: null, confidence: null },
          { text: " bastıysa,", startMs: 21234, endMs: 21824, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " tadına", startMs: 21824, endMs: 22283, timestampMs: null, confidence: null },
          { text: " bakmıştır.", startMs: 22283, endMs: 22938, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Ekmeği", startMs: 22938, endMs: 23397, timestampMs: null, confidence: null },
          { text: " kapatın.", startMs: 23397, endMs: 23922, timestampMs: null, confidence: null, pageBreakAfter: true },
          { text: " Ders", startMs: 23922, endMs: 24250, timestampMs: null, confidence: null },
          { text: " bitti!", startMs: 24250, endMs: 24643, timestampMs: null, confidence: null, pageBreakAfter: true },
        ]}
      />

      <Sequence name="Kapak karesi" from={554} durationInFrames={21}>
        <KapakKaresi />
      </Sequence>

      <LogoBadge name="Logo" durationInFrames={durationInFrames} style={{ position: "absolute", top: 100, left: 80 }} />

      {/* The voice files have no leading silence: each starts on its line's first word. */}
      <Track name="Seslendirme">
        <Audio name="01 Hoca: Sinek ekmeğine kondu" src={staticFile("voice/02-sinek/01-ugur-hoca.mp3")} volume={0.9} from={3} />
        <Audio name="02 Hoca: Bugünkü dersimiz" src={staticFile("voice/02-sinek/02-ugur-hoca.mp3")} volume={0.9} from={90} />
        <Audio name="03 Hoca: Bastıysa tadına bakmış" src={staticFile("voice/02-sinek/03-ugur-hoca.mp3")} volume={0.9} from={234} />
        <Audio name="04 Hoca: Ama dahası var" src={staticFile("voice/02-sinek/04-ugur-hoca.mp3")} volume={0.9} from={338} />
        <Audio name="05 Hoca: Tükürük döker" src={staticFile("voice/02-sinek/05-ugur-hoca.mp3")} volume={0.9} from={398} />
        <Audio name="06 Hoca: Kısacası millet" src={staticFile("voice/02-sinek/06-ugur-hoca.mp3")} volume={0.9} from={578} />
      </Track>

      <Track name="Ses efektleri">
        {/* scene 1: the fly comes in and lands, the hook pops, the teacher's chalk taps */}
        <Audio name="Sinek gelir" src={staticFile("sfx/soft-whoosh.wav")} volume={0.4} />
        <Audio name="Kanca pop" src={staticFile("sfx/pop.mp3")} from={4} volume={0.4} />
        <Audio name="Sinek konar (tık)" src={staticFile("sfx/tik.wav")} from={8} volume={0.5} />
        <Audio name="Hoca vuruş" src={staticFile("sfx/hit.mp3")} from={14} durationInFrames={20} volume={0.3} />
        {/* scene 2: blackboard, chalk, feet light up */}
        <Audio name="Tahta whoosh" src={staticFile("sfx/whoosh.mp3")} from={88} volume={0.35} />
        <Audio
          name="Tebeşir"
          src={staticFile("sfx/tebesir.wav")}
          from={96}
          durationInFrames={48}
          volume={(f) => interpolate(f, [0, 4, 40, 48], [0, 0.45, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        <Audio name="Ayaklar parlar" src={staticFile("sfx/pop.mp3")} from={153} volume={0.45} />
        {/* scene 3: tap dance, four steps */}
        <Audio name="Adım 1" src={staticFile("sfx/pop.mp3")} from={199} volume={0.4} />
        <Audio name="Adım 2" src={staticFile("sfx/pop.mp3")} from={208} volume={0.4} />
        <Audio name="Adım 3" src={staticFile("sfx/pop.mp3")} from={217} volume={0.4} />
        <Audio name="Adım 4" src={staticFile("sfx/pop.mp3")} from={226} volume={0.4} />
        {/* scene 4 */}
        <Audio name="Bastı whoosh" src={staticFile("sfx/soft-whoosh.wav")} from={232} volume={0.35} />
        <Audio name="Sınıf geçişi" src={staticFile("sfx/whoosh.mp3")} from={301} volume={0.3} />
        {/* scene 5: tension */}
        <Audio
          name="Gerilim"
          src={staticFile("sfx/riser.mp3")}
          from={335}
          durationInFrames={60}
          volume={(f) => interpolate(f, [0, 6, 50, 60], [0, 0.35, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        {/* scene 6: the three steps and the slurp */}
        <Audio name="Şema whoosh" src={staticFile("sfx/whoosh.mp3")} from={395} volume={0.3} />
        <Audio name="Adım 1 tükürük" src={staticFile("sfx/pop.mp3")} from={437} volume={0.45} />
        <Audio name="Adım 2 erit" src={staticFile("sfx/pop.mp3")} from={465} volume={0.45} />
        <Audio name="Adım 3 em" src={staticFile("sfx/pop.mp3")} from={487} volume={0.45} />
        <Audio name="Slurp" src={staticFile("sfx/slurp.wav")} from={512} volume={0.55} />
        {/* scene 7: cover */}
        <Audio name="Kapak" src={staticFile("sfx/logo-hit.wav")} from={554} volume={0.5} />
        {/* scene 8: shoo, the dome drops, chalk, the bell */}
        <Audio name="Sinek kaçar" src={staticFile("sfx/soft-whoosh.wav")} from={663} volume={0.35} />
        <Audio name="Kapak kapanır" src={staticFile("sfx/hit.mp3")} from={688} durationInFrames={24} volume={0.45} />
        <Audio
          name="Ders bitti tebeşir"
          src={staticFile("sfx/tebesir.wav")}
          from={716}
          durationInFrames={22}
          volume={(f) => interpolate(f, [0, 3, 16, 22], [0, 0.4, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        <Audio
          name="Okul zili"
          src={staticFile("sfx/okul-zili.wav")}
          from={739}
          durationInFrames={41}
          volume={(f) => interpolate(f, [0, 30, 41], [0.45, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
        {/* scene 9: dive into the bread -> loop */}
        <Audio name="Döngü" src={staticFile("sfx/soft-whoosh.wav")} from={765} volume={0.35} />
      </Track>
    </>
  );
};

/** Scene 1: Uğur Hoca slides in from the right and taps his chalk. */
const HocaGirer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 630,
        top: 800,
        translate: `${interpolate(frame, [4, 14], [500, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px 0px`,
      }}
    >
      <Hoca sahneBasi={0} size={480} ifade="mutlu" tebesirSalliyor={frame >= 12 && frame < 30} yon="sol" />
    </div>
  );
};
