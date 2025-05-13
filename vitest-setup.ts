import { fs, vol } from "memfs";
import { beforeEach, vi } from "vitest";
import { join } from "node:path";

vi.mock("node:fs");
vi.mock("node:fs/promises");

const { mkdir, writeFile } = fs.promises;

async function mockConfigDir() {
    // await mkdir("config", { recursive: true });
    const configDir = join(process.cwd(), "config");
    await mkdir(configDir, { recursive: true });

    const configLines = [
        "groups:",
        "  - ym",
        "  - ip",
        "",
    ];
    // await writeFile("config/app.yaml", configLines.join("\n"));
    const configPath = join(configDir, "app.yaml");
    await writeFile(configPath, configLines.join("\n"));
}

async function mockNodesDir() {
    await mkdir("data/nodes", { recursive: true });

    const subLines = [
        "foo:https://foo.example.com/sub.txt",
        "",
    ];
    await writeFile("data/nodes/sub.txt", subLines.join("\n"));

    const zzLines = [
        "vless://33d361b2-3324-4a26-aa12-1328893c9b6d@foo.example.com:5379?path=%2F&type=tcp&encryption=none&security=tls",
        "",
    ];
    await writeFile("data/nodes/zz.txt", zzLines.join("\n"));
}

async function mockRulesDir() {
    await mkdir("data/rules", { recursive: true });

    const domainLines = [
        "foo.example.com",
        "",
    ];
    await writeFile("data/rules/1_dir_ym.txt", domainLines.join("\n"));

    const ipLines = [
        "127.0.0.1",
        "",
    ];
    await writeFile("data/rules/1_dir_ip.txt", ipLines.join("\n"));
}

beforeEach(async() => {
    vol.reset();
    await mockConfigDir();
    await mockNodesDir();
    await mockRulesDir();
});
