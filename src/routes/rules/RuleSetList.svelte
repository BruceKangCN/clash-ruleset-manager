<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import type { RuleSet } from "$lib/schema";
    import type { ReorderInfo } from "$lib/types";
    import { getToastContext } from "$lib/toast";
    import RuleSetItem from "./RuleSetItem.svelte";

    interface Props {
        items: RuleSet[];
        removeFn: (id: number) => Promise<void>;
        updateFn: (updates: ReorderInfo[]) => Promise<void>;
    }

    let { items = $bindable([]), removeFn, updateFn }: Props = $props();

    let showModal = $state(false);

    const createToast = getToastContext();

    function handleDndConsider(e: CustomEvent<DndEvent<RuleSet>>) {
        items = e.detail.items;
    }

    function handleDndFinish(e: CustomEvent<DndEvent<RuleSet>>) {
        updateOrder(e.detail.items);
    }

    // FIXME: sometimes create invalid orders
    async function updateOrder(items: RuleSet[]) {
        // prevent furthur user actions using a modal
        showModal = true;

        try {
            // create a deep copy of original items
            //
            // "original" means its `ord` field is unchanged.
            const originalItems = items.map(v => v);

            // update order locally
            items = originalItems.map((item, i) => ({ ...item, ord: i + 1 }));

            // create update information using original items
            const updates: ReorderInfo[] = originalItems
                .filter((item, i) => item.ord !== i + 1)
                .map((item, i) => ({ id: item.id, newOrder: i + 1 }));

            await updateFn(updates);
        } catch (err) {
            createToast(`error`, `排序失败： ${err}`);
        } finally {
            // IMPORTANT: don't forget to close modal
            showModal = false;
        }
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

<Modal bind:open={showModal} size="xs" dismissable={false}>
    排序中
</Modal>
