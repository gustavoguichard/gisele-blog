import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import pg from "pg";
import sharp from "sharp";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error("DATABASE_URL environment variable is required");
const OUTPUT_DIR = join(import.meta.dirname, "..", "public", "uploads");
const MAP_OUTPUT = join(import.meta.dirname, "image-map.json");

const WP_UPLOAD_PATTERN =
  /https?:\/\/www\.giseledemenezes\.com(?:\/blog)?\/wp-content\/uploads\/(\d{4}\/\d{2}\/[^"'\s)]+)/g;

const SIZE_VARIANT_PATTERN = /-\d+x\d+(\.\w+)$/;

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function stripSizeVariant(path: string): string {
  return path.replace(SIZE_VARIANT_PATTERN, "$1");
}

function toWebpPath(relativePath: string): string {
  const ext = extname(relativePath);
  if (!IMAGE_EXTENSIONS.has(ext.toLowerCase())) return relativePath;
  return relativePath.replace(/\.\w+$/, ".webp");
}

function normalizeToCanonicalUrl(relativePath: string): string {
  const stripped = stripSizeVariant(relativePath);
  return `https://www.giseledemenezes.com/wp-content/uploads/${stripped}`;
}

async function extractImageUrls(client: pg.Client) {
  const rawUrls = new Set<string>();
  const rawToOriginal = new Map<string, Set<string>>();

  const { rows: featuredRows } = await client.query<{
    featured_image: string;
  }>("SELECT featured_image FROM posts WHERE featured_image IS NOT NULL");

  for (const row of featuredRows) {
    const url = row.featured_image;
    const match = url.match(
      /https?:\/\/www\.giseledemenezes\.com(?:\/blog)?\/wp-content\/uploads\/(\d{4}\/\d{2}\/[^"'\s)]+)/,
    );
    if (match) {
      rawUrls.add(url);
      const canonical = normalizeToCanonicalUrl(match[1]);
      if (!rawToOriginal.has(canonical)) rawToOriginal.set(canonical, new Set());
      rawToOriginal.get(canonical)!.add(url);
    }
  }

  const { rows: contentRows } = await client.query<{ content: string }>(
    "SELECT content FROM posts WHERE content LIKE '%giseledemenezes.com%wp-content/uploads/%'",
  );

  for (const row of contentRows) {
    for (const match of row.content.matchAll(WP_UPLOAD_PATTERN)) {
      const fullUrl = match[0];
      rawUrls.add(fullUrl);
      const canonical = normalizeToCanonicalUrl(match[1]);
      if (!rawToOriginal.has(canonical)) rawToOriginal.set(canonical, new Set());
      rawToOriginal.get(canonical)!.add(fullUrl);
    }
  }

  return { rawUrls, rawToOriginal };
}

async function downloadAndOptimize(url: string, outputPath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const httpsUrl = url.replace("http://", "https://");
      if (url !== httpsUrl) {
        const retryResponse = await fetch(httpsUrl);
        if (!retryResponse.ok) {
          console.error(
            `  FAIL ${url} → ${response.status} (also tried https: ${retryResponse.status})`,
          );
          return false;
        }
        return processImage(await retryResponse.arrayBuffer(), outputPath);
      }
      console.error(`  FAIL ${url} → ${response.status}`);
      return false;
    }
    return processImage(await response.arrayBuffer(), outputPath);
  } catch (error) {
    console.error(`  FAIL ${url} → ${error}`);
    return false;
  }
}

async function processImage(buffer: ArrayBuffer, outputPath: string): Promise<boolean> {
  const dir = dirname(outputPath);
  mkdirSync(dir, { recursive: true });

  await sharp(Buffer.from(buffer))
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return true;
}

async function main() {
  const client = new pg.Client(DB_URL);
  await client.connect();

  console.log("Extracting image URLs from database...");
  const { rawToOriginal } = await extractImageUrls(client);

  console.log(`Found ${rawToOriginal.size} unique images (after dedup/normalization)\n`);

  const imageMap: Record<string, string> = {};
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const [canonicalUrl, originalUrls] of rawToOriginal) {
    const relativePath = canonicalUrl.replace(
      "https://www.giseledemenezes.com/wp-content/uploads/",
      "",
    );
    const webpRelative = toWebpPath(relativePath);
    const outputPath = join(OUTPUT_DIR, webpRelative);
    const localPath = `/uploads/${webpRelative}`;

    if (existsSync(outputPath)) {
      console.log(`  SKIP ${webpRelative} (exists)`);
      skipped++;
      for (const orig of originalUrls) {
        imageMap[orig] = localPath;
      }
      continue;
    }

    console.log(`  GET  ${canonicalUrl}`);
    const success = await downloadAndOptimize(canonicalUrl, outputPath);
    if (success) {
      downloaded++;
      for (const orig of originalUrls) {
        imageMap[orig] = localPath;
      }
    } else {
      failed++;
      failures.push(canonicalUrl);
    }
  }

  writeFileSync(MAP_OUTPUT, JSON.stringify(imageMap, null, 2));

  console.log(`\n--- Summary ---`);
  console.log(`Total unique: ${rawToOriginal.size}`);
  console.log(`Downloaded:   ${downloaded}`);
  console.log(`Skipped:      ${skipped}`);
  console.log(`Failed:       ${failed}`);
  if (failures.length > 0) {
    console.log(`\nFailed URLs:`);
    for (const url of failures) {
      console.log(`  - ${url}`);
    }
  }
  console.log(`\nImage map saved to: ${MAP_OUTPUT}`);

  await client.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
