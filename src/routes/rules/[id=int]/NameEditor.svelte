<script lang="ts">
    import { goto } from "$app/navigation";
    import ConfirmModal from "$lib/components/ConfirmModal.svelte";
    import { Button, Heading, Input } from "flowbite-svelte";

    interface Props {
        name: string;
        renameFn: (name: string) => Promise<void>;
    }

    let { name = $bindable(""), renameFn }: Props = $props();

    let showModal = $state(false);
</script>

<div class="flex flex-col gap-2">
    <div class="flex flex-row items-center gap-2">
        <Heading tag="h2" class="flex grow">规则集</Heading>

        <div class="flex-none">
            <Button
                on:click={() => {
                    goto(".");
                }}
                color="alternative"
            >
                返回
            </Button>
            <Button
                on:click={() => {
                    showModal = true;
                }}
            >
                改名
            </Button>
        </div>
    </div>

    <Input bind:value={name} placeholder="规则集名称" />
</div>

<ConfirmModal
    bind:open={showModal}
    action={async () => {
        await renameFn(name);
    }}
/>
