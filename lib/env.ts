import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
export const env = loadEnvConfig(projectDir).combinedEnv;
