<script>
    import Navbar from "$lib/components/Navbar.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import CalendarGrid from "$lib/components/CalendarGrid.svelte";
    import { fly } from "svelte/transition";

    let isSidebarOpen = true;

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }
</script>

<div class="h-screen flex flex-col overflow-hidden">
    <Navbar {toggleSidebar} />

    <main class="flex-1 flex overflow-hidden relative">
        {#if isSidebarOpen}
            <!-- Mobile Backdrop -->
            <div
                class="absolute inset-0 bg-black/50 z-40 lg:hidden"
                onclick={toggleSidebar}
                aria-hidden="true"
                transition:fly={{ duration: 200 }}
            ></div>

            <!-- Sidebar Container -->
            <div
                class="absolute inset-y-0 left-0 z-50 h-full lg:static lg:z-auto shadow-xl lg:shadow-none"
                transition:fly={{ x: -260, duration: 200 }}
            >
                <Sidebar />
            </div>
        {/if}
        <CalendarGrid />
    </main>
</div>
