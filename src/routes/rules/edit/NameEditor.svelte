<script lang="ts">
    import { goto } from "$app/navigation";
    import { Button, Input } from "flowbite-svelte";

    interface Props {
        name: string,
        renameFn: (name: string) => Promise<void>,
    }

    let { name = $bindable(""), renameFn }: Props = $props()
</script>

<div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2 justify-end">
        <h2 class="flex grow">规则集</h2>
        <Button on:click={() => { goto("."); }} color="alternative">返回</Button>
        <Button on:click={() => { renameFn(name); }} color="primary">改名</Button>
    </div>

    <Input bind:value={name} placeholder="ruleset name" />
</div>
