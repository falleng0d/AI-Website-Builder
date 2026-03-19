import { SandboxProvider, SandboxProviderConfig } from "./types";
import { VercelProvider } from "./providers/vercel-provider";

export class SandboxFactory {
  static create(provider = "vercel", overrideConfig?: SandboxProviderConfig): SandboxProvider {
    const config = this.buildConfig(provider, overrideConfig);

    switch (provider.toLowerCase()) {
      case "vercel":
        return new VercelProvider(config);

      default:
        throw new Error(`Unknown sandbox provider: ${provider}. Supported providers: vercel`);
    }
  }

  private static buildConfig(provider: string, overrideConfig?: SandboxProviderConfig): SandboxProviderConfig {
    const config: SandboxProviderConfig = {};

    if (overrideConfig) {
      Object.assign(config, overrideConfig);
    }

    switch (provider.toLowerCase()) {
      case "vercel":
        config.vercel = {
          teamId: process.env.VERCEL_TEAM_ID,
          projectId: process.env.VERCEL_PROJECT_ID,
          token: process.env.VERCEL_TOKEN,
        };
        break;
    }

    config.npmFlags = process.env.NPM_FLAGS;
    config.autoRestartVite = process.env.AUTO_RESTART_VITE === "true";

    return config;
  }
}
