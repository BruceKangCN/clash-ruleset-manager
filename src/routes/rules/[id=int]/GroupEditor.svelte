<script lang="ts">
    import { Button, Heading, Textarea } from "flowbite-svelte";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";

    interface Props {
        /** name of the rule group held by this component */
        group: string;
        /** content of the rule group held by this component */
        content: string;
        /** rule group content update handler */
        updateFn: (group: string, content: string) => Promise<void>;
    }

    let { group, content = $bindable(""), updateFn }: Props = $props();

    let showModal = $state(false);

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
            default:
                return key;
        }
    }
</script>

<div class="flex flex-col gap-2">
    <!-- begin: title bar -->
    <div class="flex flex-row items-center gap-2">
        <Heading tag="h3" class="flex grow">{getGroupNameByKey(group)}</Heading>

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
    <!-- end: title bar -->

    <Textarea bind:value={content} rows={6} class="font-mono text-nowrap" />
</div>

<ConfirmModal
    bind:open={showModal}
    action={async () => {
        await updateFn(group, content);
    }}
/>
