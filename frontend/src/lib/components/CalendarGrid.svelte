<script lang="ts">
    import CalendarHeader from "$lib/components/CalendarHeader.svelte";
    import EventCard from "$lib/components/EventCard.svelte";
    import { onMount, onDestroy } from "svelte";
    import { isSameDay } from "date-fns";

    export let weekStart = new Date(); // Default if not provided

    let currentTime = new Date();
    let intervalId: number | undefined;

    // Helper function to calculate position from time
    function timeToPixels(hours: number, minutes: number): number {
        const totalMinutes = hours * 60 + minutes;
        const pixelsPerMinute = 80 / 60; // 80px per hour
        return totalMinutes * pixelsPerMinute;
    }

    // Helper function to calculate height from duration
    function durationToPixels(
        startHour: number,
        startMin: number,
        endHour: number,
        endMin: number,
    ): number {
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const durationMinutes = endMinutes - startMinutes;
        const pixelsPerMinute = 80 / 60;
        return durationMinutes * pixelsPerMinute;
    }

    // Mock events for demonstration
    type CalendarEvent = {
        title: string;
        startTime: string;
        endTime: string;
        color: string;
        dayIndex: number; // 0-6 for Sunday-Saturday
        top: number;
        height: number;
        // Layout properties for overlap handling
        column?: number;
        totalColumns?: number;
    };

    // Helper function to check if two events overlap
    function eventsOverlap(
        event1: CalendarEvent,
        event2: CalendarEvent,
    ): boolean {
        const end1 = event1.top + event1.height;
        const end2 = event2.top + event2.height;
        return event1.top < end2 && end1 > event2.top;
    }

    // Calculate layout for overlapping events
    function calculateEventLayout(events: CalendarEvent[]): CalendarEvent[] {
        // Group events by day
        const eventsByDay: Record<number, CalendarEvent[]> = {};
        events.forEach((event) => {
            if (!eventsByDay[event.dayIndex]) {
                eventsByDay[event.dayIndex] = [];
            }
            eventsByDay[event.dayIndex].push(event);
        });

        // Process each day's events
        const layoutEvents: CalendarEvent[] = [];
        Object.values(eventsByDay).forEach((dayEvents) => {
            // Sort by start time, then by duration (longer first)
            const sorted = [...dayEvents].sort((a, b) => {
                if (a.top !== b.top) return a.top - b.top;
                return b.height - a.height;
            });

            // Assign columns to overlapping events
            const columns: CalendarEvent[][] = [];
            sorted.forEach((event) => {
                // Find the first column where this event doesn't overlap
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const columnEvents = columns[i];
                    const hasOverlap = columnEvents.some((e) =>
                        eventsOverlap(e, event),
                    );
                    if (!hasOverlap) {
                        columnEvents.push(event);
                        event.column = i;
                        placed = true;
                        break;
                    }
                }
                // If no suitable column found, create a new one
                if (!placed) {
                    event.column = columns.length;
                    columns.push([event]);
                }
            });

            // Set totalColumns for all events in overlapping groups
            sorted.forEach((event) => {
                // Find all events that overlap with this one
                const overlapping = sorted.filter(
                    (e) => eventsOverlap(e, event) || eventsOverlap(event, e),
                );
                const maxColumn = Math.max(
                    ...overlapping.map((e) => e.column ?? 0),
                );
                event.totalColumns = maxColumn + 1;
            });

            layoutEvents.push(...sorted);
        });

        return layoutEvents;
    }

    const mockEvents: CalendarEvent[] = [
        {
            title: "Team Sync",
            startTime: "08:00",
            endTime: "10:00",
            color: "blue",
            dayIndex: 0,
            top: timeToPixels(8, 0),
            height: durationToPixels(8, 0, 10, 0),
        },
        {
            title: "Team Sync 2",
            startTime: "09:00",
            endTime: "10:30",
            color: "orange",
            dayIndex: 0,
            top: timeToPixels(9, 0),
            height: durationToPixels(9, 0, 10, 30),
        },
        {
            title: "Team Sync 3",
            startTime: "09:00",
            endTime: "11:00",
            color: "green",
            dayIndex: 0,
            top: timeToPixels(9, 0),
            height: durationToPixels(9, 0, 11, 0),
        },
        {
            title: "Project Workshop",
            startTime: "09:00",
            endTime: "12:00",
            color: "blue",
            dayIndex: 2,
            top: timeToPixels(9, 0),
            height: durationToPixels(9, 0, 12, 0),
        },
        {
            title: "Mom's Birthday",
            startTime: "All Day Event",
            endTime: "",
            color: "orange",
            dayIndex: 3,
            top: timeToPixels(0, 0),
            height: 40,
        },
        {
            title: "Client Lunch",
            startTime: "13:00",
            endTime: "14:00",
            color: "blue",
            dayIndex: 0,
            top: timeToPixels(13, 0),
            height: durationToPixels(13, 0, 14, 0),
        },
        {
            title: "Gym Session",
            startTime: "15:00",
            endTime: "17:00",
            color: "green",
            dayIndex: 1,
            top: timeToPixels(15, 0),
            height: durationToPixels(15, 0, 17, 0),
        },
        {
            title: "Weekly Review",
            startTime: "15:00",
            endTime: "16:30",
            color: "blue",
            dayIndex: 4,
            top: timeToPixels(15, 0),
            height: durationToPixels(15, 0, 16, 30),
        },
        {
            title: "Dinner Party",
            startTime: "18:00",
            endTime: "20:00",
            color: "green",
            dayIndex: 5,
            top: timeToPixels(18, 0),
            height: durationToPixels(18, 0, 20, 0),
        },
    ];

    // Apply layout calculation to handle overlapping events
    $: layoutedEvents = calculateEventLayout(mockEvents);

    // Calculate if current time is within the displayed week
    $: isCurrentWeekDisplayed = (() => {
        const now = new Date();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return now >= weekStart && now < weekEnd;
    })();

    // Calculate the top position based on current time (in pixels)
    // Each hour is 80px (h-20 = 5rem = 80px)
    $: currentTimeTop = (() => {
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        const pixelsPerMinute = 80 / 60; // 80px per hour / 60 minutes
        return totalMinutes * pixelsPerMinute;
    })();

    onMount(() => {
        // Update current time every minute
        intervalId = window.setInterval(() => {
            currentTime = new Date();
        }, 60000); // Update every 60 seconds

        return () => {
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
        };
    });

    onDestroy(() => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
    });
</script>

<div class="flex-1 flex flex-col overflow-hidden bg-base-100">
    <!-- Header Area -->
    <div class="flex border-b border-base-200">
        <!-- Spacer for TimeGutter alignment -->
        <div
            class="w-16 lg:w-20 border-r border-base-200 bg-base-100 flex-shrink-0"
        ></div>

        <!-- The Calendar Header -->
        <div class="flex-1">
            <CalendarHeader {weekStart} />
        </div>

        <!-- Scrollbar spacer to prevent misalignment -->
        <div
            class="w-[15px] border-l border-base-200 bg-base-100 flex-shrink-0"
        ></div>
    </div>

    <!-- Scrollable Grid Area -->
    <div
        class="flex-1 overflow-y-auto flex flex-col relative scrollbar-gutter-stable"
    >
        <div class="flex">
            <!-- Time Gutter -->
            <div
                class="w-16 lg:w-20 border-r border-base-200 flex flex-col items-center text-xs font-medium text-base-content/50 bg-base-100 flex-shrink-0"
            >
                {#each Array(24) as _, i}
                    <!-- Height matches grid row height (h-20) -->
                    <div class="h-20 relative w-full text-center">
                        <span class="block -mt-2.5"
                            >{i === 0
                                ? ""
                                : i < 12
                                  ? `${i} AM`
                                  : i === 12
                                    ? "12 PM"
                                    : `${i - 12} PM`}</span
                        >
                    </div>
                {/each}
            </div>

            <!-- Main Grid -->
            <div class="flex-1 grid grid-cols-7 relative min-w-[600px]">
                <!-- Day columns -->
                {#each Array(7) as _, i}
                    <div
                        class="border-r border-base-200 last:border-r-0 relative {i ===
                        0
                            ? 'bg-blue-50/10'
                            : ''}"
                    >
                        <!-- Hour rows -->
                        {#each Array(24) as _}
                            <div
                                class="h-20 border-b border-base-200/50 box-border"
                            ></div>
                        {/each}

                        <!-- Events for this day -->
                        {#each layoutedEvents.filter((e) => e.dayIndex === i) as event}
                            <EventCard
                                title={event.title}
                                startTime={event.startTime}
                                endTime={event.endTime}
                                color={event.color}
                                top={event.top}
                                height={event.height}
                                column={event.column ?? 0}
                                totalColumns={event.totalColumns ?? 1}
                            />
                        {/each}
                    </div>
                {/each}

                <!-- Current Time Indicator (Dynamic) -->
                {#if isCurrentWeekDisplayed}
                    <div
                        class="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                        style="top: {currentTimeTop}px;"
                    >
                        <div
                            class="w-2 h-2 rounded-full bg-red-500 -ml-1 absolute left-0"
                        ></div>
                        <div class="h-[2px] bg-red-500 flex-1 ml-1"></div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    /* Ensure the grid doesn't collapse on small screens */
    .min-w-\[600px\] {
        min-width: 600px;
    }
</style>
