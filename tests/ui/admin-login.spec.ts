import { test, expect } from '../../src/fixtures/fixtures';
import { adminCredentials } from '../../src/config/env';

test.describe('Admin login', () => {
    test('admin can log in with valid credentials', async ({ adminLoginPage }) => {
        const { username, password } = adminCredentials();

        await adminLoginPage.login(username, password);

        await expect(adminLoginPage.page).toHaveURL(/\/admin\/rooms/);
        await expect(adminLoginPage.roomsNavLink).toBeVisible();
    });

    test('shows an error for a wrong password', async ({ adminLoginPage }) => {
        await adminLoginPage.login(adminCredentials().username, 'wrong-password');

        await expect(adminLoginPage.errorMessage).toHaveText('Invalid credentials');
        await expect(adminLoginPage.page).toHaveURL(/\/admin$/);
        await expect(adminLoginPage.roomsNavLink).toBeHidden();
    });
});
