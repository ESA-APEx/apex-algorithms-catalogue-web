import { AstroAuth } from "auth-astro/server";
import { config } from "auth.config";

export const { GET, POST } = AstroAuth(config);
