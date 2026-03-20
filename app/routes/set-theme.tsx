import { data } from "react-router";
import type { Route } from "./+types/set-theme";
import { getSession, setTheme, commitSession } from "~/sessions.server";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request);
  const formData = await request.formData();
  const mode = formData.get("theme") === "dark" ? "dark" : "light";

  setTheme(session, mode);

  return data(null, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}
