import { defineConfig } from "auth-astro";
import Keycloak from "@auth/core/providers/keycloak";
import type { Provider } from "@auth/core/providers";

export const providers: Provider[] = [
  Keycloak({
    clientId: import.meta.env.KEYCLOAK_CLIENT_ID,
    clientSecret: import.meta.env.KEYCLOAK_CLIENT_SECRET,
    issuer: import.meta.env.KEYCLOAK_ISSUER,
    // Additional Keycloak configuration
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
  }) as Provider,
];

export default defineConfig({
  providers,
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
});
