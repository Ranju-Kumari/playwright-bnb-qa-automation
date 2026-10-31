import { test, expect } from '../../src/fixtures/fixtures';
import { adminCredentials } from '../../src/config/env';

test.describe('Auth API', () => {
    test('valid login returns a token that validates', async ({ api }) => {
        const { username, password } = adminCredentials();

        const login = await api.login(username, password);
        expect(login.status()).toBe(200);
        const { token } = await login.json();
        expect(token).toEqual(expect.any(String));

        const validate = await api.validateToken(token);
        expect(validate.status()).toBe(200);
        expect(await validate.json()).toEqual({ valid: true });
    });

    test('wrong password is rejected with 401', async ({ api }) => {
        const response = await api.login(adminCredentials().username, 'wrong-password');

        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ error: 'Invalid credentials' });
    });

    test('an invalid token does not validate', async ({ api }) => {
        const response = await api.validateToken('not-a-real-token');

        expect(response.status()).toBe(403);
        expect(await response.json()).toEqual({ error: 'Invalid token' });
    });

    test('admin-only endpoint requires login', async ({ api, adminApi }) => {
        expect((await api.getBookings(1)).status()).toBe(401);
        expect((await adminApi.getBookings(1)).status()).toBe(200);
    });
});
