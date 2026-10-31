import { APIRequestContext, APIResponse } from '@playwright/test';
import { ContactMessage } from '../data/testData';

export type BookingRequest = {
    roomid: number;
    firstname: string;
    lastname: string;
    depositpaid: boolean;
    bookingdates: { checkin: string; checkout: string };
    email: string;
    phone: string;
};

/**
 * Thin wrapper over the site's REST API (/api/...).
 * Methods return the raw response so tests can check status codes, including errors.
 * Whether a call is logged in depends on the request context passed in (see fixtures).
 */
export class BookerApi {
    constructor(private readonly request: APIRequestContext) {}

    // --- Auth ---
    login(username: string, password: string): Promise<APIResponse> {
        return this.request.post('/api/auth/login', { data: { username, password } });
    }

    validateToken(token: string): Promise<APIResponse> {
        return this.request.post('/api/auth/validate', { data: { token } });
    }

    // --- Rooms ---
    getRooms(): Promise<APIResponse> {
        return this.request.get('/api/room');
    }

    // --- Bookings ---
    createBooking(booking: BookingRequest): Promise<APIResponse> {
        return this.request.post('/api/booking', { data: booking });
    }

    getBookings(roomId: number): Promise<APIResponse> {
        return this.request.get('/api/booking', { params: { roomid: roomId } });
    }

    deleteBooking(bookingId: number): Promise<APIResponse> {
        return this.request.delete(`/api/booking/${bookingId}`);
    }

    // --- Contact messages ---
    sendMessage(msg: ContactMessage): Promise<APIResponse> {
        const { name, email, phone, subject, message } = msg;
        // The API calls the message body "description"
        return this.request.post('/api/message', { data: { name, email, phone, subject, description: message } });
    }

    getMessages(): Promise<APIResponse> {
        return this.request.get('/api/message');
    }

    deleteMessage(messageId: number): Promise<APIResponse> {
        return this.request.delete(`/api/message/${messageId}`);
    }

    /** Finds a message's id by its (unique) subject, or undefined if not found. */
    async findMessageId(subject: string): Promise<number | undefined> {
        const body = await (await this.getMessages()).json();
        return body.messages.find((m: { id: number; subject: string }) => m.subject === subject)?.id;
    }
}

/** Throws a readable error if the call failed. Used for setup/clean-up steps that aren't the thing under test. */
export async function assertOk(response: Promise<APIResponse>, action: string): Promise<void> {
    const r = await response;
    if (!r.ok()) throw new Error(`${action} failed: HTTP ${r.status()}`);
}
