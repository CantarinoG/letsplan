import { format } from "date-fns";
import { DEFAULT_COLOR_ID } from "$lib/constants/colors";

export class EventForm {
    title = $state("");
    eventDate = $state("");
    startTime = $state("");
    endTime = $state("");
    description = $state("");
    selectedColorId = $state(DEFAULT_COLOR_ID);
    isEdit = $state(false);

    timeError = $derived.by(() => {
        if (this.startTime && this.endTime && this.startTime >= this.endTime) {
            return "End time must be after start time";
        }
        return "";
    });

    isValid = $derived(
        !this.timeError &&
        this.title.trim() !== "" &&
        this.eventDate !== "" &&
        this.startTime !== "" &&
        this.endTime !== "" &&
        this.selectedColorId !== ""
    );

    init(isOpen: boolean, config: {
        date: string;
        initialTitle: string;
        initialDescription: string;
        initialColorId: string;
        initialEndDate: string;
    }) {
        if (!isOpen) return;

        this.isEdit = !!(config.initialTitle || config.initialDescription || config.initialEndDate);

        if (this.isEdit) {
            this.title = config.initialTitle;
            this.description = config.initialDescription;
            this.selectedColorId = config.initialColorId;

            const start = new Date(config.date);
            this.eventDate = format(start, "yyyy-MM-dd");
            this.startTime = format(start, "HH:mm");

            const end = config.initialEndDate
                ? new Date(config.initialEndDate)
                : new Date(start.getTime() + 3600000);
            this.endTime = format(end, "HH:mm");
        } else if (config.date) {
            this.title = "";
            this.description = "";
            this.selectedColorId = DEFAULT_COLOR_ID;

            let start: Date;
            const hasTime = config.date.includes("T") && config.date.length > 10;

            if (hasTime) {
                start = new Date(config.date);
            } else {
                const parts = config.date.split("-").map(Number);
                start = new Date(parts[0], parts[1] - 1, parts[2]);
                const now = new Date();
                start.setHours(now.getHours(), 0, 0, 0);
            }

            const end = new Date(start);
            end.setHours(start.getHours() + 1);

            this.eventDate = format(start, "yyyy-MM-dd");
            this.startTime = format(start, "HH:mm");
            this.endTime = format(end, "HH:mm");
        }
    }

    getPayload() {
        return {
            title: this.title,
            startDate: `${this.eventDate}T${this.startTime}`,
            endDate: `${this.eventDate}T${this.endTime}`,
            description: this.description,
            color: this.selectedColorId,
        };
    }
}
