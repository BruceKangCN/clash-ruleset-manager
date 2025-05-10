<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button, Card } from "flowbite-svelte";
    import type { RuleSet } from "$lib/schema";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    interface Props {
        /** the ruleset held by this component */
        ruleset: RuleSet;
        /** ruleset removal handler */
        removeFn: (id: number) => Promise<void>;
    }

    const { ruleset, removeFn }: Props = $props();

    let showModal = $state(false);
</script>

<Card horizontal size="md" class="items-center px-4 py-2 gap-2">
    <!-- label to display ruleset summary -->
    <span class="flex grow">{ruleset.ord} - {ruleset.name}</span>

    <!-- begin: action area -->
    <div class="flex-none">
        <Button
            color="red"
            onclick={() => {
                showModal = true;
            }}
        >
            移除
        </Button>
        <Button
            onclick={() => {
                goto(`rules/${ruleset.id}`);
            }}
        >
            编辑
        </Button>
    </div>
    <!-- end: action area -->
</Card>

<ConfirmModal
    bind:open={showModal}
    action={async () => {
        await removeFn(ruleset.id);
    }}
/>
