import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Branded social-share card (Open Graph). Next.js generates this at build time
// and wires up the og:image meta tags automatically, using metadataBase for the
// absolute URL. 1200×630 is the standard OG / large-summary Twitter size.
export const alt = "Notus Regalia — At the Core of Critical Operations.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inline the logo as a data URI so the image generator can render it without a
// network fetch (the site isn't reachable during the build).
const logoSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/icon-512.png"),
).toString("base64")}`;

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
        {/* Logo */}
        <img src={logoSrc} width={140} height={140} alt="" style={{ marginBottom: "44px" }} />

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
      </div>
    ),
    { ...size },
  );
}
