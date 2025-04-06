<script lang="ts">
    import type { PageProps } from "./$types";
    import NodeGroupEditor from "./NodeGroupEditor.svelte";
    import { getToastContext } from "$lib/toast";
    import { Fetcher } from "$lib/fetcher";

    const { data }: PageProps = $props();
    let groups = $state(data.nodeGroups);

    const fetcher = Fetcher.wrap(fetch);
    const createToast = getToastContext();

    async function updateFn(type: string, content: string): Promise<void> {
        try {
            await fetcher.patch(`/api/nodes/${type}`, { content });
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
