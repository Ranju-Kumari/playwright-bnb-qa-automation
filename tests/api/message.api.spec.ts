import { test, expect } from '../../src/fixtures/fixtures';
import { assertOk } from '../../src/api/BookerApi';
import { createContactMessage } from '../../src/data/testData';

test.describe('Message API', () => {
    test('visitor can send a message and admin receives it', async ({ api, adminApi, cleanup }) => {
        const msg = createContactMessage();

        const response = await api.sendMessage(msg);
        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ success: true });

        const id = await adminApi.findMessageId(msg.subject);
        expect(id, 'message should be in the admin inbox').toBeDefined();
        cleanup.add(() => assertOk(adminApi.deleteMessage(id!), `delete message ${id}`));
    });

    test('rejects an invalid email address', async ({ api }) => {
        const response = await api.sendMessage(createContactMessage({ email: 'not-an-email' }));

        expect(response.status()).toBe(400);
        expect(await response.json()).toContain('must be a well-formed email address');
    });

    test('rejects an empty message with an error for every field', async ({ api }) => {
        const response = await api.sendMessage({ name: '', email: '', phone: '', subject: '', message: '' });

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual(
            expect.arrayContaining([
                'Name may not be blank',
                'Email may not be blank',
                'Phone may not be blank',
                'Subject may not be blank',
                'Message may not be blank',
            ]),
        );
    });
});
