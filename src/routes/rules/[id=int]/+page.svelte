<script lang="ts">
    import { RuleSetClient } from "$lib/api";
    import type { PageProps } from "./$types";
    import NameEditor from "./NameEditor.svelte";
    import GroupEditor from "./GroupEditor.svelte";
    import { getToastContext } from "$lib/toast";

    const { data }: PageProps = $props();

    const id = data.id;
    const groups = data.groups;
    let name = $state(data.name);

    const ruleset = new RuleSetClient();
    const createToast = getToastContext();

    /** ruleset rename handler */
    async function renameFn(name: string): Promise<void> {
        try {
            ruleset.renameRuleSet(id, name);
            createToast("success", "规则集改名成功");
        } catch (err) {
            createToast("error", `规则集改名失败：${err}`);
        }
    }

    /** rule group content update handler */
    async function updateFn(group: string, content: string): Promise<void> {
        try {
            await ruleset.updateRuleGroupContent(id, group, content);
            createToast("success", "规则组更新成功");
        } catch (err) {
            createToast("error", `规则组更新失败：${err}`);
        }
    }
</script>

<div class="container mx-auto flex flex-col gap-4 p-4">
    <NameEditor bind:name {renameFn} />

    {#each groups as group (group.id)}
        <GroupEditor
            group={group.group}
            bind:content={group.content}
            {updateFn}
        />
    {/each}
</div>
