<script lang="ts">
    import { NodeClient } from "$lib/api";
    import type { PageProps } from "./$types";
    import NodeGroupEditor from "./NodeGroupEditor.svelte";
    import { getToastContext } from "$lib/toast";

    const { data }: PageProps = $props();
    const groups = data.nodeGroups;

    const node = new NodeClient();
    const createToast = getToastContext();

    /**
     * update handler
     * @param group node group (e.g. subscription / self-hosted)
     * @param content content used to overwrite the group
     */
    async function updateFn(group: string, content: string): Promise<void> {
        try {
            await node.updateNodeGroupContent(group, content);
            createToast("success", "节点信息更新成功");
        } catch (err) {
            createToast("error", `节点信息更新失败: ${err}`);
        }
    }
</script>

<div class="container mx-auto p-4 flex flex-col gap-4">
    {#each groups as group (group.type)}
        <NodeGroupEditor {...group} {updateFn} />
    {/each}
</div>
