import { json } from "@sveltejs/kit";
import { getNodes } from "$lib/server/nodes";

/**
 * @api {get} /api/nodes get node groups
 * @apiName GetNodeGroups
 * @apiGroup Node
 * @apiDescription get all node groups. return node groups as a JSON array.
 */
export async function GET() {
    const nodeGroups = await getNodes();

    return json(nodeGroups);
}
