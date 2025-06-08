<script lang="ts">
    import {
        DarkMode,
        Navbar,
        NavBrand,
        NavHamburger,
        NavLi,
        NavUl,
        Toast,
        type ToastProps,
    } from "flowbite-svelte";
    import { setToastContext, type ToastType } from "$lib/toast";

    const { children } = $props();

    let toasts: ToastInfo[] = $state([]);

    interface ToastInfo {
        id: number;
        color: ToastProps["color"];
        msg: string;
    }

    let id = 0;
    /** create toast with color according to type and an auto-incremental ID. */
    function createToast(type: ToastType, msg: string) {
        const color = getToastColor(type);
        toasts.push({ id, color, msg });
        id++;
    }
    setToastContext(createToast);

    function closeToast(id: number) {
        toasts = toasts.filter((toast) => toast.id !== id);
    }

    /** get color for toast according to toast type */
    function getToastColor(type: ToastType): ToastProps["color"] {
        switch (type) {
            case "success":
                return "green";
            case "info":
                return "primary";
            case "warn":
                return "yellow";
            case "error":
                return "red";
        }
    }
</script>

<!-- header bar (a.k.a. navigation bar) -->
<header class="header">
    <Navbar
        class={[
            "p-2",
            "border-b",
            "border-gray-300",
            "bg-gray-200",
            "dark:border-gray-700",
            "dark:bg-gray-800",
        ]}
        data-test-id="nav-bar"
    >
        <NavBrand href="/">
            <img src="/favicon.png" class="me-3 h-6" alt="Tauri Logo" />
            <span class="title">Clash 配置管理</span>
        </NavBrand>

        <NavHamburger />

        <NavUl>
            <NavLi href="/rules">规则管理</NavLi>
            <NavLi href="/nodes">节点管理</NavLi>
        </NavUl>

        <div class="flex">
            <DarkMode />
        </div>
    </Navbar>
</header>

<!-- main content -->
{@render children()}

<!-- toast area -->
<div class="toast-area z-50">
    {#each toasts as toast (toast.id)}
        <Toast
            color={toast.color}
            onclose={() => {
                closeToast(toast.id);
            }}
        >
            {toast.msg}
        </Toast>
    {/each}
</div>

<style lang="postcss">
    @reference "tailwindcss";

    .header {
        @apply sticky;
        @apply w-full;
        @apply z-20;
        @apply top-0;
        @apply start-0;
    }

    .title {
        @apply self-center;
        @apply whitespace-nowrap;
        @apply text-xl;
        @apply font-semibold;
    }

    .toast-area {
        @apply fixed;
        @apply bottom-0;
        @apply right-0;
        @apply p-2;
        @apply flex;
        @apply flex-col;
        @apply gap-2;
    }
</style>
