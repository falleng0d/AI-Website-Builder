import type { Sandbox } from "@vercel/sandbox";

export interface SandboxFile {
  path: string;
  content: string;
  lastModified?: number;
}

export interface SandboxInfo {
  sandboxId: string;
  url: string;
  provider: "vercel";
  createdAt: Date;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

export interface SandboxProviderConfig {
  vercel?: {
    teamId?: string;
    projectId?: string;
    token?: string;
    authMethod?: "oidc" | "pat";
  };
  npmFlags?: string;
  autoRestartVite?: boolean;
}

export interface SandboxConfig {
  timeout?: number;
  runtime?: string;
  ports?: number[];
  teamId?: string;
  projectId?: string;
  token?: string;
  oidcToken?: string;
}

export abstract class SandboxProvider {
  protected config: SandboxProviderConfig;
  protected sandbox?: Sandbox;
  protected sandboxInfo?: SandboxInfo;

  protected constructor(config: SandboxProviderConfig) {
    this.config = config;
  }

  abstract createSandbox(config?: SandboxConfig): Promise<SandboxInfo>;
  abstract runCommand(command: string): Promise<CommandResult>;
  abstract writeFile(path: string, content: string): Promise<void>;
  abstract readFile(path: string): Promise<string>;
  abstract listFiles(directory?: string): Promise<string[]>;
  abstract installPackages(packages: string[]): Promise<CommandResult>;
  abstract getSandboxUrl(): string | undefined;
  abstract getSandboxInfo(): SandboxInfo | undefined;
  abstract terminate(): Promise<void>;
  abstract isAlive(): boolean;

  async setupViteApp(): Promise<void> {
    throw new Error("setupViteApp not implemented for this provider");
  }

  async restartViteServer(): Promise<void> {
    throw new Error("restartViteServer not implemented for this provider");
  }
}
