<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import type { PageProps } from "./$types";
    import NodeGroupEditor from "./NodeGroupEditor.svelte";

    const { data }: PageProps = $props();
    let groups = $state(data.nodeGroups);

    async function updateFn(type: string, content: string): Promise<void> {
        await invoke("update_nodes", { type, content });
    }
</script>

<div class="p-4 flex flex-col gap-4">
    {#each groups as group}
        <NodeGroupEditor {...group} {updateFn} />
    {/each}
</div>
