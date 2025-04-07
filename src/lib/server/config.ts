import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "js-yaml";

interface SystemConfig {
    nodes_dir: string;
    rules_dir: string;
}

interface UserConfig {
    groups: string[];
}

export interface Config extends SystemConfig, UserConfig {}

const systemConfig: SystemConfig = {
    nodes_dir: "data/nodes",
    rules_dir: "data/rules",
};

export async function getConfig(): Promise<Config> {
    const configFile = join(process.cwd(), "config", "app.yaml");
    const buffer = await readFile(configFile);

    const userConfig = load(buffer.toString()) as UserConfig;

    return { ...systemConfig, ...userConfig };
}
