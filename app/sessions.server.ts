import { createCookieSessionStorage } from "react-router";
import { makeTypedSession } from "react-router-typed-session";
import { z } from "zod";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
});

const themeSession = makeTypedSession("theme", z.object({ mode: z.enum(["light", "dark"]) }));

async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

function getTheme(session: Awaited<ReturnType<typeof getSession>>) {
  return themeSession(session).get("mode") ?? "light";
}

function setTheme(session: Awaited<ReturnType<typeof getSession>>, mode: "light" | "dark") {
  themeSession(session).set("mode", mode);
}

async function commitSession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.commitSession(session);
}

export { getSession, getTheme, setTheme, commitSession };
