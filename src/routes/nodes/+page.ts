import { Fetcher } from "$lib/fetcher.js";
import type { NodeGroup } from "$lib/types";

export interface PageData {
    nodeGroups: NodeGroup[];
}

export async function load({ fetch }): Promise<PageData> {
    const fetcher = Fetcher.wrap(fetch);
    const nodeGroups: NodeGroup[] = await fetcher.get("/api/nodes");

    return { nodeGroups };
}
