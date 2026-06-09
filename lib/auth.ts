import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => ({
        email: profile.email ?? `${profile.id}@users.noreply.github.com`,
        name: profile.name ?? profile.login,
      }),
    },
  },
  plugins: [nextCookies()],
});