import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SonoPrep — ARDMS SPI Exam Preparation";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#38bdf8",
            marginBottom: 20,
            letterSpacing: "1px",
          }}
        >
          SONOPREP • ARDMS SPI EXAM MASTERY
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: 28,
            maxWidth: 950,
          }}
        >
          Ultrasound Physics, Practice Exams & Flashcards
        </div>

        <div
          style={{
            fontSize: 26,
            color: "#94a3b8",
            maxWidth: 850,
          }}
        >
          Comprehensive ARDMS SPI exam preparation tools for sonography students.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
