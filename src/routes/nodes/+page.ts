import { NodeClient } from "$lib/api";

export async function load({ fetch }) {
    const node = new NodeClient(fetch);
    const nodeGroups = await node.getAllGroups();

    return { nodeGroups };
}
