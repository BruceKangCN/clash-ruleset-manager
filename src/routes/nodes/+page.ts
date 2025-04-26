import { Fetcher } from "$lib/fetcher";

export interface PageData {
    nodeGroups: App.NodeGroup[];
}

export async function load({ fetch }): Promise<PageData> {
    const fetcher = Fetcher.wrap(fetch);
    const nodeGroups: App.NodeGroup[] = await fetcher.get("/api/nodes");

    return { nodeGroups };
}
