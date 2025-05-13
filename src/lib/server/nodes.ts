import { exists, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfig } from "$lib/server/config";

/**
 * read and parse each file in `nodes_dir` as a node group, then return them.
 * @returns node groups
 */
export async function getNodes() {
    const config = await getConfig();
    const nodes_dir = config.nodes_dir;

    const files = await readdir(nodes_dir);

    const promises: Promise<ClashDashboard.NodeGroup>[] = files.map(
        async (filename) => {
            const type = path.parse(filename).name;

            const filepath = path.join(nodes_dir, filename);
            const content = await readFile(filepath, { encoding: "utf-8" });

            return { type, content };
        },
    );

    return await Promise.all(promises);
}

/**
 * check if a group exists
 */
export async function checkGroupExists(group: string): Promise<boolean> {
    const config = await getConfig();

    const filename = `${group}.txt`;
    const filepath = path.join(config.nodes_dir, filename);

    return await exists(filepath);
}

/**
 * update node group file content
 */
export async function updateGroupContent(group: string, content: string) {
    const config = await getConfig();

    const filename = `${group}.txt`;
    const filepath = path.join(config.nodes_dir, filename);

    await writeFile(filepath, content);
}
