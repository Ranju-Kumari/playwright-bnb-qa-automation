// TEMPORARILY DISABLED (2026-10-31): the demo site's reservation page never finishes loading
// because its API (GET /api/room/{id}) returns 500. Uncomment once the site is fixed.

// import { test, expect } from '../../src/fixtures/fixtures';
// import { assertOk } from '../../src/api/BookerApi';
// import { createGuest, randomFutureStay } from '../../src/data/testData';
// import { toIsoDate } from '../../src/utils/dateUtils';
//
// test.describe('Room reservation', () => {
//     test('guest can book a room from the home page', async ({ page, homePage, reservationPage, adminApi, cleanup }) => {
//         const { checkin, checkout } = randomFutureStay();
//         const guest = createGuest();
//
//         await homePage.goto();
//         await homePage.checkAvailabilityOfRooms(checkin, checkout);
//         await homePage.roomBookLink('Single').click();
//
//         await expect(reservationPage.roomTitle).toHaveText('Single Room');
//         await reservationPage.openGuestForm();
//         await reservationPage.fillGuestDetails(guest);
//
//         // Catch the booking the UI creates, so it can be deleted through the API afterwards
//         const bookingResponse = page.waitForResponse(r => r.url().endsWith('/api/booking') && r.request().method() === 'POST');
//         await reservationPage.submit();
//         const { bookingid } = await (await bookingResponse).json();
//         cleanup.add(() => assertOk(adminApi.deleteBooking(bookingid), `delete booking ${bookingid}`));
//
//         await expect(reservationPage.confirmation).toBeVisible();
//         await expect(reservationPage.confirmation).toContainText(`${toIsoDate(checkin)} - ${toIsoDate(checkout)}`);
//     });
//
//     test('shows validation errors when guest details are empty', async ({ page, reservationPage }) => {
//         const { checkin, checkout } = randomFutureStay();
//         await page.goto(`/reservation/1?checkin=${toIsoDate(checkin)}&checkout=${toIsoDate(checkout)}`);
//
//         await reservationPage.openGuestForm();
//         await reservationPage.submit();
//
//         await expect(reservationPage.validationErrors).toContainText('Firstname should not be blank');
//         await expect(reservationPage.validationErrors).toContainText('Lastname should not be blank');
//         await expect(reservationPage.confirmation).toBeHidden();
//     });
// });

export {};
