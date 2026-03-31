import { generateOgImage, getEtag } from "~/lib/og-image.server";
import { SITE } from "~/lib/seo";
import type { Route } from "./+types/og-image";

export async function loader({ request }: Route.LoaderArgs) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? SITE.name;
  const etag = getEtag(title);

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
      },
    });
  }

  const image = await generateOgImage(title);

  return new Response(image.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
    },
  });
}
