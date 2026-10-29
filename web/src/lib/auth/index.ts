// Google-only login, restricted to ADMIN_EMAILS (comma separated). No public sign-up.
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
        before: async (u) => (adminEmails().includes(u.email.toLowerCase()) ? { data: u } : false),
      },
    },
    session: {
      create: {
        before: async (s) => {
          const found = await db.query.user.findFirst({ where: (t, { eq }) => eq(t.id, s.userId) });
          return found && adminEmails().includes(found.email.toLowerCase()) ? { data: s } : false;
        },
      },
    },
  },
  plugins: [nextCookies()],
});

/** Use at the top of every admin page, server action and admin route handler. */
export async function requireAdmin() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s || !adminEmails().includes(s.user.email.toLowerCase())) redirect("/admin/login");
  return s;
}

/** Route-handler variant: returns null instead of redirecting. */
export async function getAdminOrNull() {
  const s = await auth.api.getSession({ headers: await headers() });
  return s && adminEmails().includes(s.user.email.toLowerCase()) ? s : null;
}
