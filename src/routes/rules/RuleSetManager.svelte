<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { Button, Tooltip } from "flowbite-svelte";
    import { type RuleSet } from "./RuleSetItem.svelte";
    import RuleSetList, { type UpdateInfo } from "./RuleSetList.svelte";
    import RuleSetCreationForm from "./RuleSetCreationForm.svelte";

    let ruleSetsPromise: Promise<RuleSet[]> = $state(invoke("get_sets"));

    async function removeFn(id: number): Promise<void> {
        await invoke("remove_set", { id });
        ruleSetsPromise = invoke("get_sets");
    }

    async function updateFn(updates: UpdateInfo[]): Promise<void> {
        await invoke("sort_sets", { updates });
        ruleSetsPromise = invoke("get_sets");
    }

    async function createFn(name: string): Promise<void> {
        await invoke("create_set", { name });
        ruleSetsPromise = invoke("get_sets");
    }

    async function generate(): Promise<void> {
        await invoke("generate_ruleset_files");
    }
</script>

{#await ruleSetsPromise}
    <p class="text-xl mx-auto py-8">规则集加载中</p>
{:then items}
    <RuleSetList {items} {removeFn} {updateFn} />
{/await}

<footer class="footer">
    <RuleSetCreationForm {createFn} />

    <Button on:click={generate} id="generate-btn">生成</Button>
    <Tooltip triggeredBy="#generate-btn">
        <h5 class="text-lg font-bold">生成规则集文件</h5>
        <p>修改后的配置需写入文件才能生效。</p>
        <p class="font-bold text-yellow-500">
            请注意：该操作将清除输出文件夹中原有的文件！
        </p>
    </Tooltip>
</footer>

<style lang="postcss">
    @reference "tailwindcss";

    .footer {
        @apply sticky;
        @apply w-full;
        @apply z-20;
        @apply bottom-0;
        @apply start-0;
        @apply border-t;

        @apply flex;
        @apply flex-row;
        @apply gap-2;
        @apply items-center;
        @apply justify-center;

        @apply bg-gray-200;
        @apply border-gray-300;
    }

    :global(.dark) {
        .footer {
            @apply bg-gray-800;
            @apply border-gray-700;
        }
    }
</style>
