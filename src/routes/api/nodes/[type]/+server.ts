import { writeFile } from "node:fs/promises";
import path from "node:path";
import { json } from "@sveltejs/kit";
import { config } from "$lib/server/config.js";

interface PatchData {
    content: string;
}

/**
 * update node group file content
 * @see PatchData
 */
export async function PATCH({ params, request }) {
    const type = params.type;
    const { content }: PatchData = await request.json();

    const filename = `${type}.txt`;
    const filepath = path.join(config.nodes_dir, filename);

    await writeFile(filepath, content);

    return json({ msg: "success" });
}
