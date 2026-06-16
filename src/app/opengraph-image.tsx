import { ImageResponse } from "next/og";

// Branded social-share card (Open Graph). Next.js generates this at build time
// and wires up the og:image meta tags automatically, using metadataBase for the
// absolute URL. 1200×630 is the standard OG / large-summary Twitter size.
export const alt = "Notus Regalia — At the Core of Critical Operations.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #0d0d14 55%, #080810 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            display: "flex",
            width: "84px",
            height: "6px",
            borderRadius: "999px",
            background: "#EB1143",
            marginBottom: "40px",
          }}
        />

        {/* Wordmark */}
        <div style={{ display: "flex", fontSize: "108px", fontWeight: 800, letterSpacing: "-3px" }}>
          <span style={{ color: "#ffffff" }}>Notus&nbsp;</span>
          <span style={{ color: "#EB1143", fontWeight: 300 }}>Regalia</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "36px",
            color: "#94a3b8",
            marginTop: "24px",
            maxWidth: "900px",
          }}
        >
          Building Systems, Ventures, and Future Companies
        </div>

        {/* Tagline pinned bottom-right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "96px",
            right: "96px",
            fontSize: "22px",
            fontWeight: 600,
            letterSpacing: "1px",
            color: "#e2e8f0",
            textTransform: "uppercase",
          }}
        >
          At the Core of Critical Operations
        </div>
      </div>
    ),
    { ...size },
  );
}
