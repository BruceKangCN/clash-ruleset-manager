import { invoke } from "@tauri-apps/api/core";

export interface NodeGroup {
    type: string,
    content: string,
}

export interface PageData {
    nodeGroups: NodeGroup[],
}

export async function load(): Promise<PageData> {
    const nodeGroups: NodeGroup[] = await invoke("get_nodes");

    return { nodeGroups };
}
