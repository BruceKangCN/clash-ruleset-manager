<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button, Card } from "flowbite-svelte";
    import type { RuleSet } from "$lib/schema";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    interface Props {
        ruleset: RuleSet;
        removeFn: (id: number) => Promise<void>;
    }

    const { ruleset, removeFn }: Props = $props();

    let showModal = $state(false);
</script>

<Card horizontal padding="sm" size="md" class="items-center gap-2">
    <span class="flex grow">{ruleset.ord} - {ruleset.name}</span>

    <div class="flex-none">
        <Button
            color="red"
            on:click={() => {
                showModal = true;
            }}
        >
            移除
        </Button>
        <Button
            on:click={() => {
                goto(`rules/${ruleset.id}`);
            }}
        >
            编辑
        </Button>
    </div>
</Card>

<ConfirmModal
    bind:open={showModal}
    action={async () => {
        await removeFn(ruleset.id);
    }}
/>
