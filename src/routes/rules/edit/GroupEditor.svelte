<script lang="ts">
    import { Button, Textarea } from "flowbite-svelte";

    interface Props {
        group: string,
        content: string,
        updateFn: (group: string, content: string) => Promise<void>,
    }

    function getGroupNameByKey(key: string): string {
        switch (key) {
        case "gs":
            return "GeoSite";
        case "zz":
            return "正则";
        case "ym":
            return "域名";
        case "ip":
            return "IP";
        }

        return "";
    }

    let { group, content = $bindable(""), updateFn }: Props = $props()
</script>

<div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2">
        <h2 class="flex grow">{getGroupNameByKey(group)}</h2>
        <Button on:click={() => { updateFn(group, content); }} color="primary">更新</Button>
    </div>

    <Textarea bind:value={content} rows={6} />
</div>
