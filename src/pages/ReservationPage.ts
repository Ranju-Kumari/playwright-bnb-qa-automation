import { Locator, Page } from '@playwright/test';
import { Guest } from '../data/testData';

export class ReservationPage {
    readonly roomTitle: Locator;
    readonly reserveNow: Locator;
    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly email: Locator;
    readonly phone: Locator;
    readonly validationErrors: Locator;
    readonly confirmation: Locator;

    constructor(readonly page: Page) {
        this.roomTitle = page.getByRole('heading', { level: 1 });
        // Same button opens the guest form, then submits it
        this.reserveNow = page.getByRole('button', { name: 'Reserve Now' });
        this.firstName = page.getByRole('textbox', { name: 'Firstname' });
        this.lastName = page.getByRole('textbox', { name: 'Lastname' });
        this.email = page.getByRole('textbox', { name: 'Email' });
        this.phone = page.getByRole('textbox', { name: 'Phone' });
        this.validationErrors = page.locator('.alert');
        this.confirmation = page.locator('.card', { has: page.getByRole('heading', { name: 'Booking Confirmed' }) });
    }

    async openGuestForm() {
        await this.reserveNow.click();
    }

    async fillGuestDetails(guest: Guest) {
        await this.firstName.fill(guest.firstName);
        await this.lastName.fill(guest.lastName);
        await this.email.fill(guest.email);
        await this.phone.fill(guest.phone);
    }

    async submit() {
        await this.reserveNow.click();
    }
}
