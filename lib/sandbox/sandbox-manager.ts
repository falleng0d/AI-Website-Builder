import { SandboxProvider } from "./types";
import { SandboxFactory } from "./factory";

interface SandboxInfo {
  sandboxId: string;
  provider: SandboxProvider;
  createdAt: Date;
  lastAccessed: Date;
}

class SandboxManager {
  private sandboxes: Map<string, SandboxInfo> = new Map();

  /**
   * Get or create a sandbox provider for the given sandbox ID
   */
  async getOrCreateProvider(sandboxId: string): Promise<SandboxProvider> {
    // Check if we already have this sandbox
    const existing = this.sandboxes.get(sandboxId);
    if (existing) {
      existing.lastAccessed = new Date();
      return existing.provider;
    }

    try {
      return SandboxFactory.create();
    } catch (error) {
      console.error(`[SandboxManager] Error reconnecting to sandbox ${sandboxId}:`, error);
      throw error;
    }
  }

  registerSandbox(sandboxId: string, provider: SandboxProvider) {
    this.sandboxes.set(sandboxId, {
      sandboxId,
      provider,
      createdAt: new Date(),
      lastAccessed: new Date(),
    });
  }

  getProvider(sandboxId: string): SandboxProvider | undefined {
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      sandbox.lastAccessed = new Date();
      return sandbox.provider;
    }

    return;
  }

  async terminateSandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      try {
        await sandbox.provider.terminate();
      } catch (error) {
        console.error(`[SandboxManager] Error terminating sandbox ${sandboxId}:`, error);
      }
      this.sandboxes.delete(sandboxId);
    }
  }

  async terminateAll(): Promise<void> {
    const promises = Array.from(this.sandboxes.values()).map((sandbox) =>
      sandbox.provider
        .terminate()
        .catch((err) => console.error(`[SandboxManager] Error terminating sandbox ${sandbox.sandboxId}:`, err)),
    );

    await Promise.all(promises);
    this.sandboxes.clear();
  }

  /**
   * Clean up old sandboxes (older than maxAge milliseconds)
   */
  async cleanup(maxAge: number = 3600000): Promise<void> {
    const now = new Date();
    const toDelete: string[] = [];

    for (const [id, info] of this.sandboxes.entries()) {
      const age = now.getTime() - info.lastAccessed.getTime();
      if (age > maxAge) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      await this.terminateSandbox(id);
    }
  }
}

// Export singleton instance
export const sandboxManager = new SandboxManager();

// Global reference for debugging
declare global {
  // noinspection ES6ConvertVarToLetConst
  var sandboxManager: SandboxManager;
}

if (process.env.NODE_ENV !== "production") {
  global.sandboxManager = sandboxManager;
}
