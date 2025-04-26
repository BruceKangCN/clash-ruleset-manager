<script lang="ts">
    import { Fetcher } from "$lib/fetcher";
    import type { PageProps } from "./$types";
    import NameEditor from "./NameEditor.svelte";
    import GroupEditor from "./GroupEditor.svelte";
    import { getToastContext } from "$lib/toast";

    const { data }: PageProps = $props();

    const id = data.id;
    let name = $state(data.name);
    let groups = $state(data.groups);

    const fetcher = Fetcher.wrap(fetch);
    const createToast = getToastContext();

    async function renameFn(name: string): Promise<void> {
        try {
            await fetcher.patch(`/api/rulesets/${id}`, { name });
            createToast("success", "规则集改名成功");
        } catch (err) {
            createToast("error", `规则集改名失败：${err}`);
        }
    }

    async function updateFn(group: string, content: string): Promise<void> {
        try {
            await fetcher.patch(`/api/rulesets/${id}/${group}`, { content });
            createToast("success", "规则组更新成功");
        } catch (err) {
            createToast("error", `规则组更新失败：${err}`);
        }
    }
</script>

<div class="container mx-auto flex flex-col gap-4 p-4">
    <NameEditor bind:name {renameFn} />

    {#each groups as group}
        <GroupEditor
            group={group.group}
            bind:content={group.content}
            {updateFn}
        />
    {/each}
</div>
