import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Kysely } from "kysely";

function loadImageMap(): Record<string, string> {
  const mapPath = join(import.meta.dirname, "..", "..", "..", "scripts", "image-map.json");
  return JSON.parse(readFileSync(mapPath, "utf-8"));
}

export async function up(db: Kysely<any>): Promise<void> {
  const imageMap = loadImageMap();

  const posts = await db.selectFrom("posts").select(["id", "featuredImage", "content"]).execute();

  for (const post of posts) {
    let featuredImage = post.featuredImage as string | null;
    let content = post.content as string;
    let changed = false;

    if (featuredImage && imageMap[featuredImage]) {
      featuredImage = imageMap[featuredImage];
      changed = true;
    }

    for (const [oldUrl, newPath] of Object.entries(imageMap)) {
      if (content.includes(oldUrl)) {
        content = content.replaceAll(oldUrl, newPath);
        changed = true;
      }
    }

    if (changed) {
      await db
        .updateTable("posts")
        .set({ featuredImage, content })
        .where("id", "=", post.id)
        .execute();
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const imageMap = loadImageMap();
  const reverseMap: Record<string, string> = {};
  for (const [oldUrl, newPath] of Object.entries(imageMap)) {
    if (!reverseMap[newPath]) {
      reverseMap[newPath] = oldUrl;
    }
  }

  const posts = await db.selectFrom("posts").select(["id", "featuredImage", "content"]).execute();

  for (const post of posts) {
    let featuredImage = post.featuredImage as string | null;
    let content = post.content as string;
    let changed = false;

    if (featuredImage && reverseMap[featuredImage]) {
      featuredImage = reverseMap[featuredImage];
      changed = true;
    }

    for (const [newPath, oldUrl] of Object.entries(reverseMap)) {
      if (content.includes(newPath)) {
        content = content.replaceAll(newPath, oldUrl);
        changed = true;
      }
    }

    if (changed) {
      await db
        .updateTable("posts")
        .set({ featuredImage, content })
        .where("id", "=", post.id)
        .execute();
    }
  }
}
