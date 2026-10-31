import { Locator, Page } from '@playwright/test';
import { toUiDate } from '../utils/dateUtils';

export class HomePage {
    readonly bookNow: Locator;
    readonly checkinDate: Locator;
    readonly checkoutDate: Locator;
    readonly checkAvailability: Locator;
    readonly roomCards: Locator;

    constructor(readonly page: Page) {
        this.bookNow = page.getByRole('link', { name: 'Book Now', exact: true });
        this.checkinDate = page.getByText('Check In', { exact: true }).locator('..').getByRole('textbox');
        this.checkoutDate = page.getByText('Check Out', { exact: true }).locator('..').getByRole('textbox');
        this.checkAvailability = page.getByRole('button', { name: 'Check Availability' });
        this.roomCards = page.locator('.room-card');
    }

    async goto() {
        await this.page.goto('/');
    }

    async checkAvailabilityOfRooms(checkin: Date, checkout: Date) {
        await this.bookNow.click();
        await this.checkinDate.fill(toUiDate(checkin));
        await this.checkoutDate.fill(toUiDate(checkout));
        await this.checkAvailability.click();
    }

    roomBookLink(roomName: string): Locator {
        return this.roomCards
            .filter({ has: this.page.getByRole('heading', { name: roomName, exact: true }) })
            .getByRole('link', { name: 'Book now', exact: true });
    }
}
