import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

const database = new Pool({ connectionString: process.env.DATABASE_URL });

export const auth = betterAuth({
  database,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
  trustedOrigins: ["https://rko-partner.vercel.app", "https://*.vercel.app"],
  plugins: [nextCookies()],
});
