import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, HEADLINE_FONT } from "../fonts";
import { Ifade, KREM, MUREKKEP } from "./animasyon";
import { Kazim } from "./Kazim";
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

// Preview sheet for the series characters: both leads cycling through expressions on top,
// a still reference row of all four expressions below. 1080x1920, 6 s.
export const KarakterOnizleme: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sn = frame / fps;
  const k = anlik(KAZIM_AKIS, sn);
  const u = anlik(UGUR_AKIS, sn);
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

      <div style={{ position: "absolute", top: 150, left: 230 + kazimX, width: 620 }}>
        <Kazim size={600} ifade={k.ifade} konusuyor={k.konusuyor} yuruyor={k.hareket} />
        <Etiket boyut={44}>Kazım · {ETIKET[k.ifade]}</Etiket>
      </div>

      <div style={{ position: "absolute", top: 680, left: 190, width: 620 }}>
        <UgurHoca
          size={600}
          ifade={u.ifade}
          konusuyor={u.konusuyor}
          tebesirSalliyor={u.hareket}
          kirpmaGecikmesi={40}
        />
        <Etiket boyut={44}>Uğur Hoca · {ETIKET[u.ifade]}</Etiket>
      </div>

      {[0, 1].map((satir) => (
        <div
          key={satir}
          style={{
            position: "absolute",
            top: 1390 + satir * 250,
            left: 40,
            right: 40,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {IFADELER.map((ifade, i) => (
            <div key={ifade} style={{ width: 240 }}>
              {satir === 0 ? (
                <Kazim size={210} ifade={ifade} konusuyor={false} yuruyor={false} kirpmaGecikmesi={i * 23} />
              ) : (
                <UgurHoca
                  size={210}
                  ifade={ifade}
                  konusuyor={false}
                  tebesirSalliyor={false}
                  kirpmaGecikmesi={i * 23 + 11}
                />
              )}
              <Etiket boyut={28}>{ETIKET[ifade]}</Etiket>
            </div>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};
