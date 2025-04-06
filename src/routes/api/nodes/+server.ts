import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { json } from "@sveltejs/kit";
import { config } from "$lib/server/config";
import type { NodeGroup } from "$lib/types";

/**
 * read and parse each file in `nodes_dir` as a node group, then return them.
 * @see config
 * @returns node groups
 */
export async function GET() {
    const nodes_dir = config.nodes_dir;

    const files = await readdir(nodes_dir);

    const promises: Promise<NodeGroup>[] = files.map(async (filename) => {
        const type = path.parse(filename).name;

        const filepath = path.join(nodes_dir, filename);
        const content = (await readFile(filepath)).toString();

        return { type, content };
    });
    const nodeGroups = await Promise.all(promises);

    return json(nodeGroups);
}
