import { Locator, Page } from '@playwright/test';

/** Admin > Messages: the inbox of contact-form messages. Requires an admin login. */
export class AdminMessagesPage {
    readonly messageRows: Locator;

    constructor(readonly page: Page) {
        this.messageRows = page.locator('.messages .detail');
    }

    async goto() {
        await this.page.goto('/admin/message');
    }

    messageRow(subject: string): Locator {
        return this.messageRows.filter({ hasText: subject });
    }
}
