<script lang="ts">
    import { Input, Button } from "flowbite-svelte";

    interface Props {
        createFn: (name: string) => Promise<void>;
    }

    const { createFn }: Props = $props();

    let newRuleSetName = $state("");

    async function onsubmit(evt: SubmitEvent): Promise<void> {
        evt.preventDefault();
        await createFn(newRuleSetName);
        newRuleSetName = "";
    }
</script>

<form {onsubmit} class="p-4 w-sm flex flex-row gap-2">
    <Input bind:value={newRuleSetName} placeholder="规则集名称" class="w-sm" />
    <Button color="green" type="submit" class="w-20">创建</Button>
</form>
