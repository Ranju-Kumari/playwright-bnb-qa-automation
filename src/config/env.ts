// Read settings from environment variables (.env locally, secrets in CI).
// Read lazily, so tests that don't need a value don't fail when it's missing.

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
    return value;
}

export const adminCredentials = () => ({
    username: required('ADMIN_USERNAME'),
    password: required('ADMIN_PASSWORD'),
});
