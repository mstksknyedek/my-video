import { AbsoluteFill } from "remotion";

// Cream paper with halftone dots and torn colour strips, after the channel banner's collage look.
// Decorative only, so it stays plain HTML.
export const PaperBackground: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3EBDD" }}>
      {/* yellow halftone corner, top right */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(circle, #F7C600 34%, transparent 36%)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(circle at 100% 0%, black 0%, transparent 45%)",
          WebkitMaskImage:
            "radial-gradient(circle at 100% 0%, black 0%, transparent 45%)",
        }}
      />
      {/* blue torn strip, top left */}
      <AbsoluteFill
        style={{
          backgroundColor: "#1E3FAE",
          clipPath:
            "polygon(0 0, 46% 0, 41% 2.2%, 34% 3.4%, 27% 4.6%, 19% 5.1%, 11% 6.3%, 0 7.4%)",
        }}
      />
      {/* red torn strip, bottom */}
      <AbsoluteFill
        style={{
          backgroundColor: "#E51C0F",
          clipPath:
            "polygon(0 91%, 9% 90.2%, 18% 91.4%, 29% 90.1%, 41% 91.6%, 53% 90.4%, 64% 91.8%, 76% 90.3%, 88% 91.5%, 100% 90.2%, 100% 100%, 0 100%)",
        }}
      />
      {/* paper grain */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(80,60,30,0.07) 1px, transparent 1.4px)",
          backgroundSize: "7px 7px",
        }}
      />
    </AbsoluteFill>
  );
};
