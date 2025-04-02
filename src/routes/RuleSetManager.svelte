<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { type RuleSet } from "./RuleSetItem.svelte";
    import RuleSetList, { type UpdateInfo } from "./RuleSetList.svelte";
    import { Button, Input } from "flowbite-svelte";

    let ruleSetsPromise: Promise<RuleSet[]> = $state(invoke("get_sets"));

    let newRuleSetName = $state("");

    async function removeFn(id: number): Promise<void> {
        await invoke("remove_set", { id });
        ruleSetsPromise = invoke("get_sets");
    }

    async function updateFn(updates: UpdateInfo[]): Promise<void> {
        await invoke("sort_sets", { updates });
        ruleSetsPromise = invoke("get_sets");
    }

    async function createRuleSet(evt: SubmitEvent): Promise<void> {
        evt.preventDefault();
        await invoke("create_set", { name: newRuleSetName });
        ruleSetsPromise = invoke("get_sets");
    }
</script>

<form onsubmit={createRuleSet} class="mx-auto my-4 w-md flex flex-col gap-2">
    <Input bind:value={newRuleSetName} placeholder="规则集名称" />
    <div class="w-full flex flex-row justify-end gap-2">
        <Button color="green" type="submit">创建</Button>
    </div>
</form>

{#await ruleSetsPromise}
    <p class="text-xl mx-auto py-8">loading rules...</p>
{:then items}
    <RuleSetList {items} {removeFn} {updateFn} />
{/await}
