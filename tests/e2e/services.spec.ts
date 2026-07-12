import { test, expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';

function extractCookie(response: APIResponse): string {
  const allHeaders = response.headersArray();
  const cookies = allHeaders
    .filter((h) => h.name.toLowerCase() === 'set-cookie')
    .map((h) => h.value.split(';')[0]);
  return cookies.join('; ');
}

async function signUp(request: any, uniqueId: number) {
  const email = `services-test-${uniqueId}@example.com`;
  const password = 'TestPassword123!';

  const res = await request.post('/api/auth/sign-up/email', {
    data: { name: 'Services Test', email, password },
  });

  if (!res.ok()) return { ok: false, email, password, cookie: '', userId: '', profileId: '' };

  const body = await res.json();
  const cookie = extractCookie(res);
  const userId = body.user?.id ?? '';
  return { ok: true, email, password, cookie, userId, profileId: '' };
}

async function createProfile(request: any, cookie: string) {
  const res = await request.patch('/api/profiles/me', {
    headers: { cookie },
    data: {
      name: 'Servicios Test Empresa',
      industry: 'Technology',
      description: 'Empresa de prueba para servicios',
    },
  });
  if (!res.ok()) return '';
  const body = await res.json();
  return body.data?.id ?? '';
}

test.describe('Services Endpoints', () => {
  const uniqueId = Date.now();
  let sessionCookie = '';
  let profileId = '';
  let signedUp = false;
  let serviceId = '';

  test.beforeAll(async ({ request }) => {
    const result = await signUp(request, uniqueId);
    signedUp = result.ok;
    sessionCookie = result.cookie;

    if (signedUp) {
      profileId = await createProfile(request, sessionCookie);
    }
  });

  test('POST /api/servicios creates a new service', async ({ request }) => {
    test.skip(!signedUp || !profileId, 'Requires DB + profile');

    const res = await request.post('/api/servicios', {
      headers: { cookie: sessionCookie },
      data: {
        slug: `mi-servicio-${uniqueId}`,
        title: 'Mi Servicio de Prueba',
        marca: 'Marca Test',
        description: 'Descripción del servicio de prueba',
        yearsExperience: 5,
        priceMin: 50000,
        priceMax: 200000,
        availability: 'Lun-Vie 9:00-18:00',
        contactInfo: [
          { type: 'email', value: 'contacto@test.cl' },
          { type: 'whatsapp', value: '+56912345678' },
        ],
        serviceStatus: 'published',
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.slug).toBe(`mi-servicio-${uniqueId}`);
    expect(body.data.title).toBe('Mi Servicio de Prueba');
    expect(body.data.marca).toBe('Marca Test');
    expect(body.data.yearsExperience).toBe(5);
    expect(body.data.priceMin).toBe(50000);
    expect(body.data.priceMax).toBe(200000);
    expect(body.data.availability).toBe('Lun-Vie 9:00-18:00');
    expect(body.data.contactInfo).toHaveLength(2);
    expect(body.data.serviceStatus).toBe('published');
    expect(body.data.createdAt).toBeDefined();
    expect(body.data.updatedAt).toBeDefined();

    serviceId = body.data.id;
  });

  test('GET /api/servicios/:slugOrId returns service by slug', async ({ request }) => {
    test.skip(!serviceId, 'Requires created service');

    const res = await request.get(`/api/servicios/mi-servicio-${uniqueId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(serviceId);
    expect(body.data.slug).toBe(`mi-servicio-${uniqueId}`);
    expect(body.data.title).toBe('Mi Servicio de Prueba');
    expect(body.data.profile).toBeDefined();
    expect(body.data.profile.id).toBe(profileId);
    expect(body.data.portfolio).toEqual([]);
  });

  test('GET /api/servicios/:slugOrId returns service by ID', async ({ request }) => {
    test.skip(!serviceId, 'Requires created service');

    const res = await request.get(`/api/servicios/${serviceId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(serviceId);
  });

  test('GET /api/servicios lists services with filters', async ({ request }) => {
    test.skip(!profileId, 'Requires profile');

    // List by profileId
    const res = await request.get(`/api/servicios?profileId=${profileId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);

    // The service we created should be in the list
    const found = body.data.find((s: any) => s.id === serviceId);
    expect(found).toBeDefined();
    expect(found.slug).toBe(`mi-servicio-${uniqueId}`);
  });

  test('PATCH /api/servicios/:id updates service fields', async ({ request }) => {
    test.skip(!serviceId, 'Requires created service');

    const res = await request.patch(`/api/servicios/${serviceId}`, {
      headers: { cookie: sessionCookie },
      data: {
        title: 'Título Actualizado',
        priceMin: 75000,
        priceMax: 250000,
        serviceStatus: 'paused',
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Título Actualizado');
    expect(body.data.priceMin).toBe(75000);
    expect(body.data.priceMax).toBe(250000);
    expect(body.data.serviceStatus).toBe('paused');
    // Fields not sent should remain
    expect(body.data.marca).toBe('Marca Test');
  });

  test('POST /api/servicios/:id/portfolio adds portfolio item', async ({ request }) => {
    test.skip(!serviceId, 'Requires created service');

    const res = await request.post(`/api/servicios/${serviceId}/portfolio`, {
      headers: { cookie: sessionCookie },
      data: {
        url: 'https://picsum.photos/seed/test/800/600',
        title: 'Foto de prueba',
        description: 'Descripción de la foto',
        orden: 0,
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.url).toBe('https://picsum.photos/seed/test/800/600');
    expect(body.data.title).toBe('Foto de prueba');
    expect(body.data.serviceId).toBe(serviceId);
  });

  test('GET /api/servicios/:slugOrId includes portfolio items', async ({ request }) => {
    test.skip(!serviceId, 'Requires created service');

    const res = await request.get(`/api/servicios/${serviceId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.data.portfolio).toHaveLength(1);
    expect(body.data.portfolio[0].title).toBe('Foto de prueba');
    expect(body.data.portfolio[0].url).toBe('https://picsum.photos/seed/test/800/600');
  });

  test('POST /api/servicios returns 401 without auth', async ({ request }) => {
    const res = await request.post('/api/servicios', {
      data: { slug: 'no-auth', title: 'No Auth' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/servicios/:slugOrId returns 404 for non-existent', async ({ request }) => {
    const res = await request.get('/api/servicios/slug-no-existe');
    expect(res.status()).toBe(404);
  });

  test('DELETE /api/servicios/:id/portfolio/:portfolioId removes portfolio item', async ({ request }) => {
    test.skip(!serviceId, 'Requires created service');

    // First, add another item
    const addRes = await request.post(`/api/servicios/${serviceId}/portfolio`, {
      headers: { cookie: sessionCookie },
      data: { url: 'https://picsum.photos/seed/test2/800/600', title: 'Segunda foto', orden: 1 },
    });
    const addBody = await addRes.json();
    const portfolioId = addBody.data.id;

    // Delete it
    const delRes = await request.delete(`/api/servicios/${serviceId}/portfolio/${portfolioId}`, {
      headers: { cookie: sessionCookie },
    });
    expect(delRes.status()).toBe(204);

    // Verify it's gone
    const getRes = await request.get(`/api/servicios/${serviceId}`);
    const getBody = await getRes.json();
    expect(getBody.data.portfolio).toHaveLength(1);
    expect(getBody.data.portfolio[0].id).not.toBe(portfolioId);
  });

  test('DELETE /api/servicios/:id deletes the service', async ({ request }) => {
    test.skip(!serviceId, 'Requires created service');

    const res = await request.delete(`/api/servicios/${serviceId}`, {
      headers: { cookie: sessionCookie },
    });
    expect(res.status()).toBe(204);

    // Verify it's gone
    const getRes = await request.get(`/api/servicios/${serviceId}`);
    expect(getRes.status()).toBe(404);
  });
});
