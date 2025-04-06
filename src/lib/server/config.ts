import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "js-yaml";

export interface Config {
    groups: string[];
    rules_dir: string;
    nodes_dir: string;
}

export async function getConfig(): Promise<Config> {
    const configFile = join(process.cwd(), "config", "app.yaml");
    const buffer = await readFile(configFile);

    return load(buffer.toString()) as Config;
}
