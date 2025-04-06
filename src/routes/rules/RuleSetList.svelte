<script lang="ts">
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import type { RuleSet } from "$lib/schema";
    import type { ReorderInfo } from "$lib/types";
    import RuleSetItem from "./RuleSetItem.svelte";

    interface Props {
        items: RuleSet[];
        removeFn: (id: number) => Promise<void>;
        updateFn: (updates: ReorderInfo[]) => Promise<void>;
    }

    let { items = $bindable([]), removeFn, updateFn }: Props = $props();

    function handleDndConsider(e: CustomEvent<DndEvent<RuleSet>>) {
        items = e.detail.items;
    }

    function handleDndFinish(e: CustomEvent<DndEvent<RuleSet>>) {
        // create a deep copy of items
        //
        // "original" means its `ord` field is unchanged.
        const originalItems = e.detail.items.map(v => v);

        // update order locally
        items = originalItems.map((item, i) => ({ ...item, ord: i + 1 }));

        // create update information using original items
        const updates: ReorderInfo[] = originalItems
            .filter((item, i) => item.ord !== i + 1)
            .map((item, i) => ({ id: item.id, newOrder: i + 1 }));

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
    {#each items as ruleset (ruleset.id)}
        <RuleSetItem ruleset={ruleset} {removeFn} />
    {/each}
</div>
