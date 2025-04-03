<script lang="ts">
    import { Button, Textarea } from "flowbite-svelte";

    interface Props {
        type: string,
        content: string,
        updateFn: (type: string, content: string) => Promise<void>,
    }

    function getTypeByKey(key: string): string {
        switch (key) {
        case "sub":
            return "订阅";
        case "zj":
            return "自建";
        }

        return "";
    }

    let { type, content = $bindable(""), updateFn }: Props = $props()
</script>

<div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2">
        <h2 class="flex grow">{getTypeByKey(type)}</h2>
        <Button on:click={() => { updateFn(type, content); }} color="primary">更新</Button>
    </div>

    <Textarea bind:value={content} rows={6} class="font-mono text-nowrap" />
</div>
