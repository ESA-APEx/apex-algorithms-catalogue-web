import * as dotenv from "dotenv";
import { defineConfig } from "auth-astro";
import Keycloak from "@auth/core/providers/keycloak";
import type { FullAuthConfig } from "auth-astro/src/config";

dotenv.config();

export const config: FullAuthConfig = {
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          username: profile.preferred_username,
          roles: profile.realm_access?.roles || [],
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        token.username = profile.preferred_username;
        token.roles = (profile as any).realm_access?.roles || [];
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.username = token.username as string;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
};

export default defineConfig(config);
