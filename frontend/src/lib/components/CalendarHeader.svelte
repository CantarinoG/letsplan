<script lang="ts">
    import { addDays, format, isSameDay } from "date-fns";

    export let weekStart = new Date();

    type WeekDay = {
        date: Date;
        name: string;
        number: string;
        isToday: boolean;
    };

    let weekDays: WeekDay[] = [];
    $: {
        weekDays = Array.from({ length: 7 }, (_, i) => {
            const day = addDays(weekStart, i);
            return {
                date: day,
                name: format(day, "EEE").toUpperCase(), // MON, TUE...
                number: format(day, "d"), // 23, 24...
                isToday: isSameDay(day, new Date()),
            };
        });
    }
</script>

<div class="grid grid-cols-7 border-b border-base-200 bg-base-100">
    {#each weekDays as day}
        <div
            class="flex flex-col items-center justify-center py-3 border-r border-base-200 last:border-r-0 {day.isToday
                ? 'bg-blue-50/30'
                : ''}"
        >
            <span
                class="text-xs font-bold mb-1 {day.isToday
                    ? 'text-blue-600'
                    : 'text-base-content/50'}"
            >
                {day.name}
            </span>
            <div
                class="{day.isToday
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-base-content'} w-10 h-10 rounded-full flex items-center justify-center text-xl font-medium transition-all"
            >
                {day.number}
            </div>
        </div>
    {/each}
</div>
