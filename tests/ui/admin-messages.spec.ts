import { test, expect } from '../../src/fixtures/fixtures';
import { assertOk } from '../../src/api/BookerApi';
import { createContactMessage } from '../../src/data/testData';
import { ADMIN_AUTH_FILE } from '../../src/config/paths';

// Start already logged in as admin (login saved by tests/setup/auth.setup.ts), no login form needed
test.use({ storageState: ADMIN_AUTH_FILE });

test.describe('Admin messages', () => {
    test('admin sees a message sent by a visitor', async ({ api, adminApi, adminMessagesPage, cleanup }) => {
        // Arrange through the API: fast, and doesn't depend on the contact form UI
        const msg = createContactMessage();
        expect((await api.sendMessage(msg)).status()).toBe(200);
        cleanup.add(async () => {
            const id = await adminApi.findMessageId(msg.subject);
            await assertOk(adminApi.deleteMessage(id!), `delete message ${id}`);
        });

        await adminMessagesPage.goto();

        await expect(adminMessagesPage.messageRow(msg.subject)).toBeVisible();
        await expect(adminMessagesPage.messageRow(msg.subject)).toContainText(msg.name);
    });
});
