<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import type { PageProps } from "./$types";
    import NameEditor from "./NameEditor.svelte";
    import GroupEditor from "./GroupEditor.svelte";

    const { data }: PageProps = $props();

    const id = data.id;
    let name = $state(data.name);
    let groups = $state(data.groups);

    async function renameFn(name: string): Promise<void> {
        await invoke("rename_set", { id, name });
    }

    async function updateFn(group: string, content: string): Promise<void> {
        await invoke("update_set_group", { id, group, content });
    }
</script>

<div class="flex flex-col w-md mx-auto gap-4 p-4">
    <NameEditor bind:name {renameFn} />

    {#each groups as group}
        <GroupEditor
            group={group.type}
            bind:content={group.content}
            {updateFn}
        />
    {/each}
</div>
