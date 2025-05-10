export async function load({ fetch }) {
    const resp = await fetch("/api/nodes");
    const nodeGroups: ClashDashboard.NodeGroup[] = await resp.json();

    return { nodeGroups };
}
