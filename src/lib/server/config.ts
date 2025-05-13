import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "js-yaml";

interface SystemConfig {
    nodes_dir: string;
    rules_dir: string;
}

interface UserConfig {
    /** rule groups, e.g. "ip", "ym" */
    groups: string[];
}

export interface Config extends SystemConfig, UserConfig {}

const systemConfig: SystemConfig = {
    nodes_dir: "data/nodes",
    rules_dir: "data/rules",
};

/**
 * parse configuration from file and return it.
 *
 * read file located at `./config/app.yaml`. parse its content as `UserConfig`.
 * merge parsed configuration with `systemConfig` and return.
 *
 * @see systemConfig
 * @returns configuration
 */
export async function getConfig(): Promise<Config> {
    const configFile = join(process.cwd(), "config", "app.yaml");
    const content = await readFile(configFile, { encoding: "utf-8" });

    const userConfig = load(content) as UserConfig;

    return { ...systemConfig, ...userConfig };
}
