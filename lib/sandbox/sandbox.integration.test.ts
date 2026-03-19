import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { SandboxFactory } from "./factory";
import type { SandboxProvider } from "./types";
import { env } from "@/lib/env";

describe("Sandbox Integration Tests", () => {
  let sandbox: SandboxProvider | null = null;
  const sandboxConfig = {
    oidcToken: env.VERCEL_OIDC_TOKEN,
    timeout: 5 * 60 * 1000,
  };

  const logResult = (label: string, result: unknown) => {
    console.log(`[Sandbox Integration Tests] ${label}:`, result);
  };

  const getSandbox = async () => {
    if (sandbox?.isAlive()) {
      return sandbox;
    }

    sandbox = SandboxFactory.create("vercel");
    const sandboxInfo = await sandbox.createSandbox(sandboxConfig);
    logResult("sandbox created", sandboxInfo);

    return sandbox;
  };

  beforeAll(async () => {
    if (!env.VERCEL_OIDC_TOKEN) {
      throw new Error("VERCEL_OIDC_TOKEN environment variable is required for integration tests");
    }
  });

  afterAll(async () => {
    if (sandbox) {
      await sandbox.terminate();
      sandbox = null;
    }
  });

  it("should create a Vercel sandbox successfully", async () => {
    const currentSandbox = await getSandbox();
    const sandboxInfo = await currentSandbox.getSandboxInfo();

    expect(sandboxInfo).toBeDefined();
    if (!sandboxInfo) {
      throw new Error("Sandbox info should be defined after creation");
    }
    expect(sandboxInfo.sandboxId).toBeDefined();
    expect(sandboxInfo.url).toBeDefined();
    expect(sandboxInfo.provider).toBe("vercel");
    expect(sandboxInfo.createdAt).toBeInstanceOf(Date);
    logResult("sandbox info", sandboxInfo);

    const url = currentSandbox.getSandboxUrl();
    expect(url).toBeDefined();
    expect(url).toContain("vercel.run");
    logResult("sandbox url", url);
  });

  it("should write and read files", async () => {
    const currentSandbox = await getSandbox();

    const testContent = "Hello, World!";
    await currentSandbox.writeFile("test.txt", testContent);

    const readContent = await currentSandbox.readFile("test.txt");
    expect(readContent).toBe(testContent);
    logResult("read file", { path: "test.txt", content: readContent });
  });

  it("should run commands and return results", async () => {
    const currentSandbox = await getSandbox();

    const result = await currentSandbox.runCommand("echo 'test output'");

    expect(result).toBeDefined();
    expect(result.exitCode).toBe(0);
    expect(result.success).toBe(true);
    expect(result.stdout).toContain("test output");
    logResult("command result", result);
  });

  it("should install packages successfully", async () => {
    const currentSandbox = await getSandbox();

    const result = await currentSandbox.installPackages(["lodash"]);

    expect(result).toBeDefined();
    expect(result.exitCode).toBe(0);
    expect(result.success).toBe(true);
    logResult("package install", result);
  });

  it("should list files in directory", async () => {
    const currentSandbox = await getSandbox();

    await currentSandbox.writeFile("file1.txt", "content1");
    await currentSandbox.writeFile("file2.txt", "content2");
    await currentSandbox.writeFile("subdir/file3.txt", "content3");

    const files = await currentSandbox.listFiles();

    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain("file1.txt");
    expect(files).toContain("file2.txt");
    expect(files).toContain("subdir/file3.txt");
    logResult("listed files", files);
  });

  it("should check if sandbox is alive", async () => {
    sandbox = null;

    const currentSandbox = await getSandbox();

    expect(currentSandbox.isAlive()).toBe(true);

    const info = currentSandbox.getSandboxInfo();
    expect(info).toBeDefined();
    logResult("alive status", { isAlive: currentSandbox.isAlive(), info });
  });

  it("should setup Vite app with React and Tailwind", async () => {
    const currentSandbox = await getSandbox();

    await currentSandbox.setupViteApp();

    const packageJsonContent = await currentSandbox.readFile("package.json");
    expect(packageJsonContent).toContain("vite");
    expect(packageJsonContent).toContain("react");

    const indexHtml = await currentSandbox.readFile("index.html");
    expect(indexHtml).toContain('<div id="root">');
    logResult("vite app setup", {
      packageJsonSnippet: packageJsonContent.slice(0, 200),
      indexHtmlSnippet: indexHtml.slice(0, 120),
    });
  });

  it("should handle command failures gracefully", async () => {
    const currentSandbox = await getSandbox();

    const result = await currentSandbox.runCommand("exit 1");

    expect(result.success).toBe(false);
    expect(result.exitCode).toBe(1);
    logResult("failed command", result);
  });

  it("should terminate sandbox successfully", async () => {
    const currentSandbox = await getSandbox();

    expect(currentSandbox.isAlive()).toBe(true);

    await currentSandbox.terminate();

    expect(currentSandbox.isAlive()).toBe(false);
    logResult("termination", { isAlive: currentSandbox.isAlive() });
    sandbox = null;
  });
});
