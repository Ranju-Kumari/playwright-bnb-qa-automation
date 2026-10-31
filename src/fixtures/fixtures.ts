import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ReservationPage } from '../pages/ReservationPage';
import { ContactForm } from '../pages/ContactForm';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminMessagesPage } from '../pages/AdminMessagesPage';
import { BookerApi } from '../api/BookerApi';
import { ADMIN_AUTH_FILE } from '../config/paths';

type Cleanup = { add: (task: () => Promise<unknown>) => void };

type Fixtures = {
    // Page objects
    homePage: HomePage;
    reservationPage: ReservationPage;
    contactForm: ContactForm;
    adminLoginPage: AdminLoginPage;
    adminMessagesPage: AdminMessagesPage;
    // API clients
    api: BookerApi;       // not logged in, like a website visitor
    adminApi: BookerApi;  // logged in as admin (uses the login saved by auth.setup.ts)
    // Test data cleanup
    cleanup: Cleanup;
};

export const test = base.extend<Fixtures>({
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    reservationPage: async ({ page }, use) => {
        await use(new ReservationPage(page));
    },
    contactForm: async ({ page }, use) => {
        await use(new ContactForm(page));
    },
    // Opens the admin login page, so tests start there ready to log in
    adminLoginPage: async ({ page }, use) => {
        const adminLoginPage = new AdminLoginPage(page);
        await adminLoginPage.goto();
        await use(adminLoginPage);
    },
    adminMessagesPage: async ({ page }, use) => {
        await use(new AdminMessagesPage(page));
    },

    api: async ({ request }, use) => {
        await use(new BookerApi(request));
    },
    adminApi: async ({ playwright, baseURL }, use) => {
        const context = await playwright.request.newContext({ baseURL, storageState: ADMIN_AUTH_FILE });
        await use(new BookerApi(context));
        await context.dispose();
    },

    /**
     * Register clean-up steps during a test; they run after it, newest first.
     * Clean-up is best effort: a failure is recorded as a note on the test
     * instead of failing it, because clean-up is not what the test checks.
     */
    cleanup: async ({}, use, testInfo) => {
        const tasks: (() => Promise<unknown>)[] = [];
        await use({ add: (task) => tasks.push(task) });
        for (const task of tasks.reverse()) {
            try {
                await task();
            } catch (error) {
                testInfo.annotations.push({ type: 'cleanup failed', description: String(error) });
            }
        }
    },
});

// Re-export so tests import everything from one place
export { expect } from '@playwright/test';
