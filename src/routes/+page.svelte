<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { Button, Hr, Input, Label, Textarea } from "flowbite-svelte";

    let cmd = $state("");
    let dataText = $state("{}");
    let resp = $state({});

    let data = $derived(JSON.parse(dataText));

    async function onsubmit(ev: SubmitEvent) {
        ev.preventDefault();

        resp = await invoke(cmd, data);
    }
</script>

<main class="flex flex-col gap-2 p-4">
    <h1>首页</h1>

    <p>请通过导航栏使用具体功能</p>

    <Hr />

    <h2>RPC tester</h2>

    <form {onsubmit} class="flex flex-col gap-2">
        <Label>
            <span>command</span>
            <Input bind:value={cmd} class="font-mono" />
        </Label>

        <Label>
            <span>data</span>
            <Textarea bind:value={dataText} rows={4} class="font-mono" />
        </Label>

        <Button type="submit" class="self-end">invoke</Button>
    </form>

    <p>response</p>

    <pre class="border">{JSON.stringify(resp, null, 4)}</pre>
</main>
