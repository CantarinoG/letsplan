<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import CalendarGrid from "$lib/components/CalendarGrid.svelte";
    import { fly } from "svelte/transition";
    import {
        addWeeks,
        subWeeks,
        startOfWeek,
        endOfWeek,
        format,
        isSameMonth,
    } from "date-fns";

    let isSidebarOpen = true;
    let currentDate = new Date();

    function toggleSidebar() {
        isSidebarOpen = !isSidebarOpen;
    }

    function nextWeek() {
        currentDate = addWeeks(currentDate, 1);
    }

    function prevWeek() {
        currentDate = subWeeks(currentDate, 1);
    }

    function goToToday() {
        currentDate = new Date();
    }

    $: weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
    $: weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

    $: dateRangeString = (() => {
        const startFormat = "MMM d";
        const endFormat = isSameMonth(weekStart, weekEnd)
            ? "d, yyyy"
            : "MMM d, yyyy";
        return `${format(weekStart, startFormat)} – ${format(weekEnd, endFormat)}`;
    })();

    // Format date for MiniCalendar (YYYY-MM-DD)
    $: formattedDate = format(currentDate, "yyyy-MM-dd");

    function handleDateChange(event: CustomEvent<string>) {
        console.log("Page received datechange:", event.detail);
        // Event detail contains the new date string YYYY-MM-DD
        // We parse manually to ensure it's treated as local time
        const [year, month, day] = event.detail.split("-").map(Number);
        const newDate = new Date(year, month - 1, day);

        if (!isNaN(newDate.getTime())) {
            // Check validity
            currentDate = newDate;
        } else {
            console.error("Invalid date received:", event.detail);
        }
    }
</script>

<div class="h-screen flex flex-col overflow-hidden">
    <Navbar
        {toggleSidebar}
        {dateRangeString}
        onNext={nextWeek}
        onPrev={prevWeek}
        onToday={goToToday}
    />

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
                class="absolute inset-y-0 left-0 z-50 h-full lg:static lg:z-auto shadow-xl lg:shadow-none bg-base-100"
                transition:fly={{ x: -288, duration: 200 }}
            >
                <Sidebar
                    date={formattedDate}
                    on:datechange={handleDateChange}
                />
            </div>
        {/if}
        <CalendarGrid {weekStart} />
    </main>
</div>
