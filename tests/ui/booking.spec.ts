import { test, expect } from '../../src/fixtures/fixtures';
import { daysFromToday, toIsoDate } from '../../src/utils/dateUtils';

test('user should be able to check rooms availability', async ({ homePage }) => {
    const checkin = daysFromToday(7);
    const checkout = daysFromToday(10);

    await homePage.goto();
    await homePage.checkAvailabilityOfRooms(checkin, checkout);

    // The search worked if the room's booking link carries the chosen dates
    await expect(homePage.roomBookLink('Single')).toHaveAttribute(
        'href',
        `/reservation/1?checkin=${toIsoDate(checkin)}&checkout=${toIsoDate(checkout)}`,
    );
});
