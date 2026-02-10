const API_BASE_URL = 'http://localhost:5000/api';

export interface CalendarEvent {
    id?: string;
    title: string;
    description: string;
    startAt: string; // ISO string
    endAt: string;   // ISO string
    color: string;
    createdAt?: string;
    updatedAt?: string;
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE_URL}/Events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create event: ${errorText || response.statusText}`);
    }

    return response.json();
}
