<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { dndzone, type DndEvent } from "svelte-dnd-action";
    import type { RuleSet } from "$lib/schema";
    import { getToastContext } from "$lib/toast";
    import RuleSetItem from "./RuleSetItem.svelte";

    interface Props {
        items: RuleSet[];
        removeFn: (id: number) => Promise<void>;
        updateFn: (updates: App.ReorderInfo[]) => Promise<void>;
    }

    let { items = $bindable([]), removeFn, updateFn }: Props = $props();

    let showModal = $state(false);

    const createToast = getToastContext();

    function handleDndConsider(e: CustomEvent<DndEvent<RuleSet>>) {
        items = e.detail.items;
    }

    function handleDndFinish(e: CustomEvent<DndEvent<RuleSet>>) {
        updateOrder(e);
    }

    async function updateOrder(e: CustomEvent<DndEvent<RuleSet>>) {
        // prevent furthur user actions using a modal
        showModal = true;

        try {
            // create a deep copy of original items
            //
            // "original" means its `ord` field is unchanged.
            const originalItems = [...e.detail.items];

            // update order locally
            items = originalItems.map((item, i) => ({ ...item, ord: i + 1 }));

            // create update information using original items
            const updates: App.ReorderInfo[] = items
                .map((item) => ({ id: item.id, newOrder: item.ord }));

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
