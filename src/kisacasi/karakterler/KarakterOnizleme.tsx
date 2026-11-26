import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, HEADLINE_FONT } from "../fonts";
import { Ifade, KREM, MUREKKEP } from "./animasyon";
import { Kazim } from "./Kazim";
import { NerminTeyze } from "./NerminTeyze";
import { UgurHoca } from "./UgurHoca";

const IFADELER: Ifade[] = ["mutlu", "saskin", "sinirli", "uzgun"];
const ETIKET: Record<Ifade, string> = {
  mutlu: "mutlu",
  saskin: "şaşkın",
  sinirli: "sinirli",
  uzgun: "üzgün",
};

type Durum = { readonly ifade: Ifade; readonly konusuyor: boolean; readonly hareket: boolean };

// [start second, state]
const KAZIM_AKIS: [number, Durum][] = [
  [0, { ifade: "mutlu", konusuyor: false, hareket: true }],
  [2, { ifade: "mutlu", konusuyor: true, hareket: false }],
  [3.3, { ifade: "saskin", konusuyor: false, hareket: false }],
  [4.1, { ifade: "sinirli", konusuyor: true, hareket: false }],
  [5, { ifade: "uzgun", konusuyor: false, hareket: false }],
];
const UGUR_AKIS: [number, Durum][] = [
  [0, { ifade: "mutlu", konusuyor: true, hareket: true }],
  [2, { ifade: "saskin", konusuyor: false, hareket: false }],
  [3.3, { ifade: "sinirli", konusuyor: true, hareket: true }],
  [4.6, { ifade: "uzgun", konusuyor: true, hareket: false }],
];

const NERMIN_AKIS: [number, Durum][] = [
  [0, { ifade: "mutlu", konusuyor: true, hareket: false }],
  [1.4, { ifade: "saskin", konusuyor: false, hareket: false }],
  [2.3, { ifade: "sinirli", konusuyor: true, hareket: true }],
  [4, { ifade: "uzgun", konusuyor: false, hareket: false }],
  [5, { ifade: "mutlu", konusuyor: true, hareket: false }],
];

const anlik = (akis: [number, Durum][], sn: number): Durum =>
  akis.reduce((acc, [bas, d]) => (sn >= bas ? d : acc), akis[0][1]);

const Etiket: React.FC<{ readonly children: React.ReactNode; readonly boyut: number }> = ({ children, boyut }) => (
  <div
    style={{
      fontFamily: BODY_FONT,
      fontWeight: 700,
      fontSize: boyut,
      color: MUREKKEP,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

// Preview sheet for the series characters: the leads cycling through expressions on top,
// still reference rows of all four expressions below. 1080x1920, 6 s.
export const KarakterOnizleme: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sn = frame / fps;
  const k = anlik(KAZIM_AKIS, sn);
  const u = anlik(UGUR_AKIS, sn);
  const n = anlik(NERMIN_AKIS, sn);
  // phone comes up to her glasses at 2.3 s and goes back down at 4 s
  const yaklas = interpolate(sn, [2.3, 2.7, 3.7, 4.1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kazimX = interpolate(frame, [0, 2 * fps], [-620, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: KREM }}>
      <div
        style={{
          position: "absolute",
          top: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: HEADLINE_FONT,
          fontWeight: 700,
          fontSize: 76,
          color: MUREKKEP,
        }}
      >
        Kısacası karakterleri
      </div>

      <div style={{ position: "absolute", top: 160, left: 20 + kazimX, width: 500 }}>
        <Kazim size={500} ifade={k.ifade} konusuyor={k.konusuyor} yuruyor={k.hareket} />
        <Etiket boyut={38}>Kazım · {ETIKET[k.ifade]}</Etiket>
      </div>

      <div style={{ position: "absolute", top: 160, left: 560, width: 500 }}>
        <UgurHoca
          size={500}
          ifade={u.ifade}
          konusuyor={u.konusuyor}
          tebesirSalliyor={u.hareket}
          kirpmaGecikmesi={40}
        />
        <Etiket boyut={38}>Uğur Hoca · {ETIKET[u.ifade]}</Etiket>
      </div>

      <div style={{ position: "absolute", top: 730, left: 250, width: 580 }}>
        <NerminTeyze
          size={580}
          ifade={n.ifade}
          konusuyor={n.konusuyor}
          telefonuYaklastiriyor={yaklas}
          kirpmaGecikmesi={70}
        />
        <Etiket boyut={38}>Nermin Teyze · {ETIKET[n.ifade]}</Etiket>
      </div>

      {[0, 1, 2].map((satir) => (
        <div
          key={satir}
          style={{
            position: "absolute",
            top: 1370 + satir * 180,
            left: 60,
            right: 60,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {IFADELER.map((ifade, i) => (
            <div key={ifade} style={{ width: 160 }}>
              {satir === 0 ? (
                <Kazim size={150} ifade={ifade} konusuyor={false} yuruyor={false} kirpmaGecikmesi={i * 23} />
              ) : satir === 1 ? (
                <UgurHoca
                  size={150}
                  ifade={ifade}
                  konusuyor={false}
                  tebesirSalliyor={false}
                  kirpmaGecikmesi={i * 23 + 11}
                />
              ) : (
                <NerminTeyze
                  size={150}
                  ifade={ifade}
                  konusuyor={false}
                  telefonuYaklastiriyor={false}
                  kirpmaGecikmesi={i * 23 + 5}
                />
              )}
              <Etiket boyut={24}>{ETIKET[ifade]}</Etiket>
            </div>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};
