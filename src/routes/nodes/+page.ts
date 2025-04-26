import { Fetcher } from "$lib/fetcher";

export interface PageData {
    nodeGroups: ClashDashboard.NodeGroup[];
}

export async function load({ fetch }): Promise<PageData> {
    const fetcher = Fetcher.wrap(fetch);
    const nodeGroups: ClashDashboard.NodeGroup[] =
        await fetcher.get("/api/nodes");

    return { nodeGroups };
}
