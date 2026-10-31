import { daysFromToday, toIsoDate } from '../utils/dateUtils';
import type { BookingRequest } from '../api/BookerApi';

export type Guest = { firstName: string; lastName: string; email: string; phone: string };
export type ContactMessage = { name: string; email: string; phone: string; subject: string; message: string };

// Short unique suffix so parallel runs and reruns don't reuse the same data
const uniqueId = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

export function createGuest(overrides: Partial<Guest> = {}): Guest {
    const id = uniqueId();
    return {
        firstName: 'Test',
        lastName: `Guest${id}`.slice(0, 30),
        email: `guest.${id}@example.com`,
        phone: '01234567890',
        ...overrides,
    };
}

export function createContactMessage(overrides: Partial<ContactMessage> = {}): ContactMessage {
    const id = uniqueId();
    return {
        name: `Test User ${id}`,
        email: `contact.${id}@example.com`,
        phone: '01234567890',
        subject: `Enquiry ${id}`,
        message: 'Automated test message: please ignore this enquiry.',
        ...overrides,
    };
}

/**
 * A random stay far in the future. The demo site is shared, so fixed dates
 * would clash with earlier runs (a room can't be booked twice for the same nights).
 */
export function randomFutureStay(nights = 2) {
    const start = randomInt(90, 700);
    return { checkin: daysFromToday(start), checkout: daysFromToday(start + nights) };
}

/** A valid booking request body for the API: random future dates, unique guest. */
export function createBookingRequest(roomId: number, overrides: Partial<BookingRequest> = {}): BookingRequest {
    const guest = createGuest();
    const { checkin, checkout } = randomFutureStay();
    return {
        roomid: roomId,
        firstname: guest.firstName,
        lastname: guest.lastName,
        depositpaid: false,
        bookingdates: { checkin: toIsoDate(checkin), checkout: toIsoDate(checkout) },
        email: guest.email,
        phone: guest.phone,
        ...overrides,
    };
}
