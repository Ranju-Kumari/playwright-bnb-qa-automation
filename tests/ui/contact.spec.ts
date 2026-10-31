import { test, expect } from '../../src/fixtures/fixtures';
import { assertOk } from '../../src/api/BookerApi';
import { createContactMessage } from '../../src/data/testData';

test.describe('Contact form', () => {
    test.beforeEach(async ({ contactForm }) => {
        await contactForm.goto();
    });

    test('visitor can send a message', async ({ contactForm, adminApi, cleanup }) => {
        const msg = createContactMessage();

        await contactForm.fill(msg);
        await contactForm.submit();

        await expect(contactForm.successMessage).toHaveText(`Thanks for getting in touch ${msg.name}!`);
        await expect(contactForm.page.getByText(msg.subject)).toBeVisible();

        // The UI only says "thanks"; the API confirms the message was actually stored
        const id = await adminApi.findMessageId(msg.subject);
        expect(id, 'message should be in the admin inbox').toBeDefined();
        cleanup.add(() => assertOk(adminApi.deleteMessage(id!), `delete message ${id}`));
    });

    test('shows validation errors when the form is empty', async ({ contactForm }) => {
        await contactForm.submit();

        for (const error of ['Name may not be blank', 'Email may not be blank', 'Message may not be blank']) {
            await expect(contactForm.validationErrors).toContainText(error);
        }
        await expect(contactForm.successMessage).toBeHidden();
    });

    test('rejects a subject shorter than 5 characters', async ({ contactForm }) => {
        await contactForm.fill(createContactMessage({ subject: 'Hi' }));
        await contactForm.submit();

        await expect(contactForm.validationErrors).toHaveText('Subject must be between 5 and 100 characters.');
    });
});
