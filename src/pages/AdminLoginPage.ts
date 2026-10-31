import { Locator, Page } from '@playwright/test';

export class AdminLoginPage {
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly roomsNavLink: Locator;

    constructor(readonly page: Page) {
        this.username = page.getByLabel('Username');
        this.password = page.getByLabel('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.locator('.alert');
        // Only shown once logged in (the Logout button is shown even before login, so it can't prove success)
        this.roomsNavLink = page.getByRole('link', { name: 'Rooms', exact: true });
    }

    async goto() {
        await this.page.goto('/admin');
    }

    async login(username: string, password: string) {
        await this.username.fill(username);
        await this.password.fill(password);
        await this.loginButton.click();
    }
}
