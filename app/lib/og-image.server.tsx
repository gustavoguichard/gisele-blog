import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "@vercel/og";

let fontData: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  const fontPath = join(
    process.cwd(),
    "node_modules/@fontsource/merriweather/files/merriweather-latin-700-normal.woff",
  );
  const buffer = await readFile(fontPath);
  fontData = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  return fontData;
}

export function getEtag(title: string) {
  return createHash("sha256").update(title).digest("hex");
}

export async function generateOgImage(title: string) {
  const font = await loadFont();
  const fontSize = title.length > 60 ? 36 : title.length > 30 ? 44 : 52;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#faf6f0",
        padding: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "8px",
          height: "100%",
          background: "linear-gradient(to bottom, #c49a6c, #8b5e34, #c49a6c)",
          borderRadius: "4px",
          marginRight: "48px",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "Merriweather",
            fontSize,
            color: "#2a2118",
            lineHeight: 1.4,
            textWrap: "balance",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            width: "60px",
            height: "2px",
            backgroundColor: "#c49a6c",
            marginTop: "24px",
            marginBottom: "24px",
          }}
        />
        <div
          style={{
            fontSize: 22,
            color: "#6e6358",
            fontFamily: "Merriweather",
          }}
        >
          giseledemenezes.com
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Merriweather", data: font, weight: 700, style: "normal" as const }],
    },
  );
}
