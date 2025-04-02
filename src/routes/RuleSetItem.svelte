<script lang="ts">
    import { Button, Card, Spinner } from "flowbite-svelte";

    export interface RuleSet {
        id: number,
        ord: number,
        name: string,
    }

    interface Props {
        ruleSet: RuleSet,
        removeFn: (id: number) => Promise<void>,
    }

    const { ruleSet, removeFn }: Props = $props();

    let deletePromise: Promise<void> = $state(Promise.resolve());
</script>

<Card horizontal padding="sm" size="md" class="items-center gap-2">
    <span class="flex grow">{ruleSet.ord} - {ruleSet.name}</span>
    <!-- <div class="spacer"></div> -->
    <Button color="red" on:click={() => { deletePromise = removeFn(ruleSet.id); }}>
        {#await deletePromise}
            <Spinner class="me-3" size={4} />
        {/await}
        移除
    </Button>
    <Button color="primary" href="./{ruleSet.id}">编辑</Button>
</Card>
