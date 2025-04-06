<script lang="ts">
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import { Input, Button } from "flowbite-svelte";

    interface Props {
        createFn: (name: string) => Promise<void>;
    }

    const { createFn }: Props = $props();

    let newRuleSetName = $state("");
    let showModal = $state(false);

    async function onsubmit(evt: SubmitEvent): Promise<void> {
        evt.preventDefault();
        showModal = true;
    }
</script>

<form {onsubmit} class="p-4 w-sm flex flex-row gap-2">
    <Input bind:value={newRuleSetName} placeholder="规则集名称" class="w-sm" />
    <Button color="green" type="submit" class="w-20">创建</Button>
</form>

<ConfirmModal
    bind:open={showModal}
    action={async () => {
        await createFn(newRuleSetName);
        newRuleSetName = "";
    }}
/>
