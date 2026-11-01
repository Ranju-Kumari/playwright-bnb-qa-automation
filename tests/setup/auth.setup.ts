import { test as setup, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { BookerApi } from '../../src/api/BookerApi';
import { adminCredentials } from '../../src/config/env';
import { ADMIN_AUTH_FILE } from '../../src/config/paths';

/**
 * Runs once before the UI and API projects.
 * Logs in through the API (fast, no UI) and saves the token as the cookie
 * the website uses, so tests can start already logged in as admin.
 * Uses no browser, so the API-only CI job doesn't need browsers installed.
 */
setup('log in as admin via API', async ({ request, baseURL }) => {
    const { username, password } = adminCredentials();

    const response = await new BookerApi(request).login(username, password);
    expect(response.status(), 'admin login via API').toBe(200);
    const { token } = await response.json();

    // Same format Playwright uses for storageState files
    const { hostname, protocol } = new URL(baseURL!);
    const storageState = {
        cookies: [{
            name: 'token',
            value: token,
            domain: hostname,
            path: '/',
            expires: -1,
            httpOnly: false,
            secure: protocol === 'https:',
            sameSite: 'Lax' as const,
        }],
        origins: [],
    };

    mkdirSync(dirname(ADMIN_AUTH_FILE), { recursive: true });
    writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(storageState, null, 2));
});
