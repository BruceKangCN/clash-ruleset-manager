<script lang="ts">
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import RuleSetItem, { type RuleSet } from "./RuleSetItem.svelte";

    export interface UpdateInfo {
        id: number,
        new_order: number,
    }

    interface Props {
        items: RuleSet[],
        removeFn: (id: number) => Promise<void>,
        updateFn: (updates: UpdateInfo[]) => Promise<void>,
    }

    let { items = $bindable([]), removeFn, updateFn }: Props = $props();

    function handleDndConsider(e: CustomEvent<DndEvent<RuleSet>>) {
        items = e.detail.items;
    }

    function handleDndFinish(e: CustomEvent<DndEvent<RuleSet>>) {
        items = e.detail.items;

        const newItems = items.map((item, i) => ({ ...item, ord: i + 1 }));

        const updates: UpdateInfo[] = newItems
            .filter((item, i) => item.ord !== i)
            .map((item) => ({ id: item.id, new_order: item.ord }));
        updateFn(updates);
    }
</script>

<!-- svelte-ignore event_directive_deprecated -->
<div
    class="flex flex-col gap-4 py-8 items-center"
    use:dndzone={{ items }}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinish}
>
    {#each items as ruleSet (ruleSet.id)}
        <RuleSetItem {ruleSet} {removeFn} />
    {/each}
</div>
