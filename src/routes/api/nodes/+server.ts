import { json } from "@sveltejs/kit";
import { getNodes } from "$lib/server/nodes";

/**
 * get node groups
 * @returns node groups
 */
export async function GET() {
    const nodeGroups = await getNodes();

    return json(nodeGroups);
}
