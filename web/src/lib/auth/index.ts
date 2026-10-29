// Google-only login. Allowed = ADMIN_EMAILS env (bootstrap/owner) ∪ admin_allowlist table (managed in /admin). No public sign-up.
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/** Env admins are permanent owners; DB admins are added/removed by any admin in the dashboard. */
export async function isAllowedEmail(email: string) {
  const e = email.trim().toLowerCase();
  if (adminEmails().includes(e)) return true;
  const row = await db.query.adminAllowlist.findFirst({ where: (t, { eq }) => eq(t.email, e) });
  return !!row;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      prompt: "select_account",
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 14, updateAge: 60 * 60 * 24 },
  databaseHooks: {
    user: {
      create: {
        before: async (u) => ((await isAllowedEmail(u.email)) ? { data: u } : false),
      },
    },
    session: {
      create: {
        before: async (s) => {
          const found = await db.query.user.findFirst({ where: (t, { eq }) => eq(t.id, s.userId) });
          return found && (await isAllowedEmail(found.email)) ? { data: s } : false;
        },
      },
    },
  },
  plugins: [nextCookies()],
});

/** Use at the top of every admin page, server action and admin route handler. */
export async function requireAdmin() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s || !(await isAllowedEmail(s.user.email))) redirect("/admin/login");
  return s;
}

/** Route-handler variant: returns null instead of redirecting. */
export async function getAdminOrNull() {
  const s = await auth.api.getSession({ headers: await headers() });
  return s && (await isAllowedEmail(s.user.email)) ? s : null;
}
