<script lang="ts">
    import { DarkMode, Navbar, NavBrand } from "flowbite-svelte";

    const { children } = $props();
</script>

<header class="header">
    <Navbar class="p-2 border-b" data-testid="nav-bar">
        <NavBrand href="/">
            <img src="/tauri.svg" class="me-3 h-6" alt="Tauri Logo" />
            <span class="title">Clash 规则管理</span>
        </NavBrand>

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
