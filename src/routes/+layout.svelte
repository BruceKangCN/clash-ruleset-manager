<script lang="ts">
    import { DarkMode, Navbar, NavBrand, NavLi, NavUl } from "flowbite-svelte";

    const { children } = $props();
</script>

<header class="header">
    <Navbar class="p-2 border-b" data-testid="nav-bar">
        <NavBrand href="/">
            <img src="/tauri.svg" class="me-3 h-6" alt="Tauri Logo" />
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
</style>
