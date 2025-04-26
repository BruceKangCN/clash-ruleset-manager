import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { json } from "@sveltejs/kit";
import { getConfig } from "$lib/server/config";

/**
 * read and parse each file in `nodes_dir` as a node group, then return them.
 * @returns node groups
 */
export async function GET() {
    const config = await getConfig();
    const nodes_dir = config.nodes_dir;

    const files = await readdir(nodes_dir);

    const promises: Promise<App.NodeGroup>[] = files.map(async (filename) => {
        const type = path.parse(filename).name;

        const filepath = path.join(nodes_dir, filename);
        const content = (await readFile(filepath)).toString();

        return { type, content };
    });
    const nodeGroups = await Promise.all(promises);

    return json(nodeGroups);
}
