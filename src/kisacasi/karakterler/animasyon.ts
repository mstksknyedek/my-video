// Shared motion helpers for the series characters. Everything is a pure function of the frame,
// so renders are deterministic and no CSS animation is needed.

export type Ifade = "mutlu" | "saskin" | "sinirli" | "uzgun";

export const MUREKKEP = "#111111";
export const KONTUR = 8;
export const KIRMIZI = "#E51C0F";
export const SARI = "#F7C600";
export const KOYU_SARI = "#D9A400";
export const MAVI = "#1E3FAE";
export const KREM = "#F3EBDD";
export const AGIZ_ICI = "#6E0B05";
export const DIL = "#FF7A6B";

/**
 * Eye openness, 1 = open, 0 = shut. A blink every ~3.4 s lasting 7 frames,
 * with an occasional double blink. `gecikme` shifts the schedule (in frames)
 * so two characters on screen do not blink together.
 */
export const gozAcikligi = (frame: number, fps: number, gecikme: number): number => {
  const periyot = Math.round(fps * 3.4);
  const f = (((frame + gecikme) % periyot) + periyot) % periyot;
  const kirp = (start: number) => {
    const t = f - start;
    if (t < 0 || t > 6) return 1;
    // 0..3 closing, 3..6 opening
    return Math.abs(t - 3) / 3;
  };
  const dongu = Math.floor((frame + gecikme) / periyot);
  const ikili = dongu % 3 === 2;
  return Math.min(kirp(periyot - 8), ikili ? kirp(periyot - 17) : 1);
};

/** Mouth opening 0..1 while talking: two mixed sines give an uneven, syllable-like rhythm. */
export const agizAcikligi = (frame: number, fps: number, konusuyor: boolean): number => {
  if (!konusuyor) return 0;
  const t = frame / fps;
  const v =
    Math.sin(t * Math.PI * 2 * 3.1) * 0.55 +
    Math.sin(t * Math.PI * 2 * 1.3 + 1.1) * 0.35 +
    0.25;
  return Math.max(0, Math.min(1, v));
};

/** Idle breathing, -1..1, one breath about every 2.6 s. */
export const nefes = (frame: number, fps: number): number =>
  Math.sin((frame / fps) * ((Math.PI * 2) / 2.6));

/** SVG transform that scales around a point. */
export const olcekle = (sx: number, sy: number, x: number, y: number): string =>
  `translate(${x} ${y}) scale(${sx} ${sy}) translate(${-x} ${-y})`;

/** SVG transform that rotates around a point. */
export const dondur = (deg: number, x: number, y: number): string => `rotate(${deg} ${x} ${y})`;

/**
 * A mouth: closed it is a stroked curve, open it is a dark filled shape with a tongue.
 * `egri` > 0 smiles, < 0 frowns. `acik` 0..1.
 */
export type AgizGeom = {
  readonly cx: number;
  readonly cy: number;
  readonly genislik: number;
  readonly egri: number;
  readonly acik: number;
  readonly cizgi: string;
  readonly kalinlik: number;
};

export const agizYolu = ({ cx, cy, genislik, egri, acik }: AgizGeom) => {
  const x1 = cx - genislik / 2;
  const x2 = cx + genislik / 2;
  const ust = `M ${x1} ${cy} Q ${cx} ${cy + egri} ${x2} ${cy}`;
  const derinlik = egri + 12 + acik * genislik * 0.7;
  const kapali = `${ust} Q ${cx} ${cy + derinlik} ${x1} ${cy} Z`;
  return { ust, kapali, derinlik };
};
