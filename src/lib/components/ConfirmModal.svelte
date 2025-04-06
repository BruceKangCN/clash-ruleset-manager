<script lang="ts">
    import { Modal, Button } from "flowbite-svelte";

    interface Props {
        open: boolean;

        /**
         * action to execute on primary button click
         */
        action: () => Promise<void>;
    }

    let { open = $bindable(false), action }: Props = $props();

    /**
     * whether there is pending action.
     *
     * it is used to control whether buttons and outside close is enabled.
     */
    let pending = $state(false);

    function close() {
        open = false;
    }

    async function execAction() {
        pending = true;

        try {
            await action();
            close();
        } catch (err) {
            alert(err);
        } finally {
            // IMPORTANT: don't forget to reset pending status
            pending = false;
        }
    }
</script>

<Modal bind:open size="xs" outsideclose={!pending}>
    <div class="text-center">
        <p class="font-bold mb-4">是否执行操作？</p>
        <div class="flex justify-center gap-2">
            <Button on:click={execAction} disabled={pending}>是</Button>
            <Button color="alternative" on:click={close} disabled={pending}
                >否</Button
            >
        </div>
    </div>
</Modal>
