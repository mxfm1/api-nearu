import { test, expect } from '@playwright/test';

test.describe('Users API (public)', () => {
  const uniqueId = Date.now();

  test('POST /api/users creates a new user', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: { name: 'Test User', email: `test-${uniqueId}@example.com`, password: 'TestPassword123!' },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Test User');
    expect(body.data.email).toBe(`test-${uniqueId}@example.com`);
    expect(body.data.id).toBeDefined();
    expect(body.data.createdAt).toBeDefined();

    // Save user id for subsequent tests
    test.info().annotations.push({ type: 'userId', description: body.data.id });
  });

  test('GET /api/users/:id returns a user', async ({ request }) => {
    // First create
    const createRes = await request.post('/api/users', {
      data: { name: 'Fetch User', email: `fetch-${uniqueId}@example.com`, password: 'TestPassword123!' },
    });
    const { data: user } = await createRes.json();

    // Then fetch
    const response = await request.get(`/api/users/${user.id}`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(user.id);
    expect(body.data.name).toBe('Fetch User');
    expect(body.data.email).toBe(user.email);
  });

  test('GET /api/users/:id returns 404 for non-existent user', async ({ request }) => {
    const response = await request.get('/api/users/non-existent-id');
    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('NOT_FOUND');
  });

  test('POST /api/users returns 400 for invalid input', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: { name: '', email: 'not-an-email', password: 'short' },
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('INPUT_PARSE_ERROR');
  });

  test('POST /api/users returns 409 for duplicate email', async ({ request }) => {
    const email = `dup-${uniqueId}@example.com`;

    // First create
    await request.post('/api/users', {
      data: { name: 'First', email, password: 'TestPassword123!' },
    });

    // Try duplicate
    const response = await request.post('/api/users', {
      data: { name: 'Second', email, password: 'TestPassword123!' },
    });
    expect(response.status()).toBe(409);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('CONFLICT');
  });
});
