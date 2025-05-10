<script lang="ts">
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import { Button, Heading, Textarea } from "flowbite-svelte";

    interface Props {
        type: string;
        content: string;
        updateFn: (type: string, content: string) => Promise<void>;
    }

    function getTypeByKey(key: string): string {
        switch (key) {
            case "sub":
                return "订阅";
            case "zj":
                return "自建";
            default:
                return key;
        }
    }

    let { type, content = $bindable(""), updateFn }: Props = $props();

    let showModal = $state(false);
</script>

<div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2">
        <Heading tag="h2" class="flex grow">{getTypeByKey(type)}</Heading>

        <div class="flex-none">
            <Button
                onclick={() => {
                    showModal = true;
                }}
            >
                更新
            </Button>
        </div>
    </div>

    <Textarea bind:value={content} rows={6} class="font-mono text-nowrap" />
</div>

<ConfirmModal
    bind:open={showModal}
    action={async () => {
        await updateFn(type, content);
    }}
/>
