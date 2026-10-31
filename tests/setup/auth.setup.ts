import { test as setup, expect } from '@playwright/test';
import { BookerApi } from '../../src/api/BookerApi';
import { adminCredentials } from '../../src/config/env';
import { ADMIN_AUTH_FILE } from '../../src/config/paths';

/**
 * Runs once before the UI and API projects.
 * Logs in through the API (fast, no UI) and saves the token as the cookie
 * the website uses, so tests can start already logged in as admin.
 */
setup('log in as admin via API', async ({ request, context, baseURL }) => {
    const { username, password } = adminCredentials();

    const response = await new BookerApi(request).login(username, password);
    expect(response.status(), 'admin login via API').toBe(200);
    const { token } = await response.json();

    await context.addCookies([{ name: 'token', value: token, url: baseURL! }]);
    await context.storageState({ path: ADMIN_AUTH_FILE });
});
