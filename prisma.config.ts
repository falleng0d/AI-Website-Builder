import type { PrismaConfig } from "prisma";
import { env } from "./lib/env";

export default {
   schema: "prisma/schema.prisma",
   migrations: {
      path: "prisma/migrations",
   },
   datasource: {
      url: env["DATABASE_URL"],
   },
} satisfies PrismaConfig;
