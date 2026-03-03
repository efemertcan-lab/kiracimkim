import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: ".env.local" });

export default defineConfig({
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
