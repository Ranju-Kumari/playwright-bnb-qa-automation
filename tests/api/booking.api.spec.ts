import { test, expect } from '../../src/fixtures/fixtures';
import { assertOk } from '../../src/api/BookerApi';
import { createBookingRequest } from '../../src/data/testData';

const ROOM_ID = 2;

test.describe('Booking API', () => {
    test('guest can create a booking and admin can see it', async ({ api, adminApi, cleanup }) => {
        const booking = createBookingRequest(ROOM_ID);

        const response = await api.createBooking(booking);
        expect(response.status()).toBe(201);
        const created = await response.json();
        cleanup.add(() => assertOk(adminApi.deleteBooking(created.bookingid), `delete booking ${created.bookingid}`));

        expect(created).toMatchObject({
            bookingid: expect.any(Number),
            roomid: ROOM_ID,
            firstname: booking.firstname,
            lastname: booking.lastname,
            bookingdates: booking.bookingdates,
        });

        const { bookings } = await (await adminApi.getBookings(ROOM_ID)).json();
        expect(bookings).toContainEqual(expect.objectContaining({ bookingid: created.bookingid }));
    });

    test('the same room cannot be booked twice for the same dates', async ({ api, adminApi, cleanup }) => {
        const booking = createBookingRequest(ROOM_ID);
        const first = await api.createBooking(booking);
        expect(first.status()).toBe(201);
        const { bookingid } = await first.json();
        cleanup.add(() => assertOk(adminApi.deleteBooking(bookingid), `delete booking ${bookingid}`));

        const second = await api.createBooking(createBookingRequest(ROOM_ID, { bookingdates: booking.bookingdates }));

        expect(second.status()).toBe(409);
    });

    test('rejects a booking with a missing first name', async ({ api }) => {
        const response = await api.createBooking(createBookingRequest(ROOM_ID, { firstname: '' }));

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ errors: expect.arrayContaining(['Firstname should not be blank']) });
    });

    test('rejects a booking where checkout is before checkin', async ({ api }) => {
        const response = await api.createBooking(
            createBookingRequest(ROOM_ID, { bookingdates: { checkin: '2028-04-10', checkout: '2028-04-05' } }),
        );

        // The API answers 409 here; 400 would be more accurate, so only check it's refused
        expect(response.ok()).toBeFalsy();
        expect(response.status()).toBeGreaterThanOrEqual(400);
    });
});
