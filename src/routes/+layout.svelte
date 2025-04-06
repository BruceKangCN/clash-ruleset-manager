<script lang="ts">
    import {
        DarkMode,
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        Toast,
        type ColorVariant,
    } from "flowbite-svelte";
    import { setToastContext, type ToastType } from "$lib/toast";

    const { children } = $props();

    let toasts: ToastInfo[] = $state([]);

    interface ToastInfo {
        id: number;
        color: ColorVariant;
        msg: string;
    }

    let id = 0;
    function createToast(type: ToastType, msg: string) {
        const color = getToastColor(type);
        toasts.push({ id, color, msg });
        id++;
    }
    setToastContext(createToast);

    function closeToast(id: number) {
        toasts = toasts.filter((toast) => toast.id !== id);
    }

    function getToastColor(type: ToastType): ColorVariant {
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

<header class="header">
    <Navbar class="p-2 border-b" data-testid="nav-bar">
        <NavBrand href="/">
            <img src="/favicon.png" class="me-3 h-6" alt="Tauri Logo" />
            <span class="title">Clash 配置管理</span>
        </NavBrand>

        <NavUl>
            <NavLi href="/rules">规则管理</NavLi>
            <NavLi href="/nodes">节点管理</NavLi>
        </NavUl>

        <div class="flex">
            <DarkMode />
        </div>
    </Navbar>
</header>

{@render children()}

<div class="toast-area z-50">
    {#each toasts as toast (toast.id)}
        <Toast
            color={toast.color}
            on:close={() => {
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
