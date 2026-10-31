import { Locator, Page } from '@playwright/test';
import { ContactMessage } from '../data/testData';

/** The "Send Us a Message" form at the bottom of the home page. */
export class ContactForm {
    readonly name: Locator;
    readonly email: Locator;
    readonly phone: Locator;
    readonly subject: Locator;
    readonly message: Locator;
    readonly submitButton: Locator;
    readonly validationErrors: Locator;
    readonly successMessage: Locator;

    constructor(readonly page: Page) {
        this.name = page.getByLabel('Name', { exact: true });
        this.email = page.getByLabel('Email', { exact: true });
        this.phone = page.getByLabel('Phone', { exact: true });
        this.subject = page.getByLabel('Subject', { exact: true });
        // Label says for="message" but the textarea's id is "description", so getByLabel can't link them
        this.message = page.locator('textarea#description');
        this.submitButton = page.getByRole('button', { name: 'Submit' });
        this.validationErrors = page.locator('.alert');
        this.successMessage = page.getByRole('heading', { name: /Thanks for getting in touch/ });
    }

    async goto() {
        await this.page.goto('/#contact');
    }

    async fill(msg: ContactMessage) {
        await this.name.fill(msg.name);
        await this.email.fill(msg.email);
        await this.phone.fill(msg.phone);
        await this.subject.fill(msg.subject);
        await this.message.fill(msg.message);
    }

    async submit() {
        await this.submitButton.click();
    }
}
