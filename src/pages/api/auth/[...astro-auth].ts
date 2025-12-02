import { AstroAuth } from "auth-astro/server";
import { providers } from "@/auth.config";

export const { GET, POST } = AstroAuth({
  providers,
  debug: false,
});
