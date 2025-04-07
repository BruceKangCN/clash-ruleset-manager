<script lang="ts">
    import { Button, Tooltip } from "flowbite-svelte";
    import type { RuleSet } from "$lib/schema";
    import type { ReorderInfo } from "$lib/types";
    import RuleSetList from "./RuleSetList.svelte";
    import RuleSetCreationForm from "./RuleSetCreationForm.svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import { Fetcher } from "$lib/fetcher";
    import { getToastContext } from "$lib/toast";

    // `fetcher` and `createToast` must be initialized before `rulesetsPromise`,
    // because it is initialized by `getRuleSets`, which uses `fetcher` and
    // `createToast` inside.
    const fetcher = Fetcher.wrap(fetch);
    const createToast = getToastContext();

    let rulesetsPromise: Promise<RuleSet[]> = $state(getRuleSets());

    /**
     * whether generation confirm modal is shown
     */
    let showModal = $state(false);

    async function getRuleSets(): Promise<RuleSet[]> {
        try {
            const rulesets: RuleSet[] = await fetcher.get("/api/rulesets");
            return rulesets;
        } catch (err) {
            createToast("error", `规则集获取失败：${err}`);
            return [];
        }
    }

    async function removeFn(id: number): Promise<void> {
        try {
            await fetcher.delete(`/api/rulesets/${id}`);
            createToast("success", "规则集删除成功");
        } catch (err) {
            createToast("error", `规则集删除失败：${err}`);
        }
        rulesetsPromise = getRuleSets();
        await rulesetsPromise;
    }

    async function updateFn(updates: ReorderInfo[]): Promise<void> {
        await fetcher.patch("/api/rulesets", { updates });
        // skip syncing with backend to improve user experience (skip reassigning
        // the `rulesetsPromise`, to prevent whole list update).
        //
        // full order update may be needed to ensure proper orders.
    }

    async function createFn(name: string): Promise<void> {
        try {
            await fetcher.put("/api/rulesets", { name });
            createToast("success", "规则集创建成功");
        } catch (err) {
            createToast("error", `规则集创建失败：${err}`);
        }
        rulesetsPromise = getRuleSets();
        await rulesetsPromise;
    }

    async function generate(): Promise<void> {
        try {
            await fetcher.post("/api/rulesets");
            createToast("success", "规则文件生成成功");
        } catch (err) {
            createToast("error", `规则文件生成失败：${err}`);
        }
    }
</script>

<div class="container mx-auto">
    {#await rulesetsPromise}
        <p class="text-xl mx-auto py-8">规则集加载中</p>
    {:then items}
        <RuleSetList {items} {removeFn} {updateFn} />
    {/await}
</div>

<footer class="footer">
    <RuleSetCreationForm {createFn} />

    <Button
        id="generate-btn"
        on:click={() => {
            showModal = true;
        }}>生成</Button
    >
    <Tooltip triggeredBy="#generate-btn">
        <h3 class="text-lg font-bold">生成规则集文件</h3>
        <p>修改后的配置需写入文件才能生效。</p>
        <p class="font-bold text-yellow-500">
            请注意：该操作将清除输出文件夹中原有的文件！
        </p>
    </Tooltip>
</footer>

<ConfirmModal
    bind:open={showModal}
    action={async () => {
        await generate();
    }}
/>

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
