import { ImageResponse } from "next/og";

export const alt = "DevLinks — Hub de links para developers";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            D
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            DevLinks
          </span>
        </div>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          Hub de links para developers
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "#a3a3a3",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: "800px",
          }}
        >
          Centraliza todos tus links de developer en un solo lugar. GitHub,
          analíticas y QR code. Gratis para siempre.
        </p>
        <div
          style={{
            marginTop: "40px",
            padding: "12px 32px",
            borderRadius: "9999px",
            background: "#6366f1",
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          devlinks.nova11labs.dev
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
