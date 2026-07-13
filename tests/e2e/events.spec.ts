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
  const email = `events-test-${uniqueId}@example.com`;
  const password = 'TestPassword123!';

  const res = await request.post('/api/auth/sign-up/email', {
    data: { name: 'Events Test', email, password },
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
      name: 'Eventos Test Org',
      industry: 'Events',
      description: 'Organización de prueba para eventos',
    },
  });
  if (!res.ok()) return '';
  const body = await res.json();
  return body.data?.id ?? '';
}

test.describe('Events Endpoints', () => {
  const uniqueId = Date.now();
  let sessionCookie = '';
  let profileId = '';
  let signedUp = false;
  let eventId = '';

  test.beforeAll(async ({ request }) => {
    const result = await signUp(request, uniqueId);
    signedUp = result.ok;
    sessionCookie = result.cookie;

    if (signedUp) {
      profileId = await createProfile(request, sessionCookie);
    }
  });

  test('POST /api/eventos creates a new event', async ({ request }) => {
    test.skip(!signedUp || !profileId, 'Requires DB + profile');

    const res = await request.post('/api/eventos', {
      headers: { cookie: sessionCookie },
      data: {
        slug: `mi-evento-${uniqueId}`,
        title: 'Mi Evento de Prueba',
        description: 'Descripción larga del evento con info relevante para los asistentes.',
        requirements: 'Experiencia previa en organización de eventos',
        startAt: '2026-10-15T18:30:00-03:00',
        applicationDeadline: '2026-10-01T23:59:59-03:00',
        thumbnailUrl: 'https://picsum.photos/seed/event/1200/400',
        bannerUrl: 'https://picsum.photos/seed/banner/1920/600',
        requiredCandidates: 5,
        requiresVerifiedProfile: true,
        status: 'published',
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.slug).toBe(`mi-evento-${uniqueId}`);
    expect(body.data.title).toBe('Mi Evento de Prueba');
    expect(body.data.description).toBe('Descripción larga del evento con info relevante para los asistentes.');
    expect(body.data.requirements).toBe('Experiencia previa en organización de eventos');
    expect(body.data.startAt).toBe('2026-10-15T21:30:00.000Z');
    expect(body.data.applicationDeadline).toBe('2026-10-02T02:59:59.000Z');
    expect(body.data.thumbnailUrl).toBe('https://picsum.photos/seed/event/1200/400');
    expect(body.data.bannerUrl).toBe('https://picsum.photos/seed/banner/1920/600');
    expect(body.data.requiredCandidates).toBe(5);
    expect(body.data.selectedCandidates).toBe(0);
    expect(body.data.applicationCount).toBe(0);
    expect(body.data.requiresVerifiedProfile).toBe(true);
    expect(body.data.autoCloseWhenFilled).toBe(true);
    expect(body.data.status).toBeDefined();
    expect(body.data.createdAt).toBeDefined();
    expect(body.data.updatedAt).toBeDefined();

    eventId = body.data.id;
  });

  test('GET /api/eventos/:slugOrId returns event by slug', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.get(`/api/eventos/mi-evento-${uniqueId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(eventId);
    expect(body.data.slug).toBe(`mi-evento-${uniqueId}`);
    expect(body.data.title).toBe('Mi Evento de Prueba');
    expect(body.data.profile).toBeDefined();
    expect(body.data.profile.id).toBe(profileId);
  });

  test('GET /api/eventos/:slugOrId returns event by ID', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.get(`/api/eventos/${eventId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(eventId);
  });

  test('GET /api/eventos lists events with filters', async ({ request }) => {
    test.skip(!profileId, 'Requires profile');

    // List by profileId
    const res = await request.get(`/api/eventos?profileId=${profileId}`);
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);

    const found = body.data.find((e: any) => e.id === eventId);
    expect(found).toBeDefined();
    expect(found.slug).toBe(`mi-evento-${uniqueId}`);
  });

  test('PATCH /api/eventos/:id updates event fields', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.patch(`/api/eventos/${eventId}`, {
      headers: { cookie: sessionCookie },
      data: {
        title: 'Evento Actualizado',
        requirements: 'Nuevos requisitos del evento',
        requiredCandidates: 10,
        requiresVerifiedProfile: false,
        status: 'paused',
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('Evento Actualizado');
    expect(body.data.requirements).toBe('Nuevos requisitos del evento');
    expect(body.data.requiredCandidates).toBe(10);
    expect(body.data.requiresVerifiedProfile).toBe(false);
    expect(body.data.status).toBeDefined();
    // Fields not sent should remain
    expect(body.data.description).toBe('Descripción larga del evento con info relevante para los asistentes.');
  });

  test('POST /api/eventos returns 401 without auth', async ({ request }) => {
    const res = await request.post('/api/eventos', {
      data: { slug: 'no-auth', title: 'No Auth' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/eventos/:slugOrId returns 404 for non-existent', async ({ request }) => {
    const res = await request.get('/api/eventos/slug-no-existe');
    expect(res.status()).toBe(404);
  });

  test('DELETE /api/eventos/:id deletes the event', async ({ request }) => {
    test.skip(!eventId, 'Requires created event');

    const res = await request.delete(`/api/eventos/${eventId}`, {
      headers: { cookie: sessionCookie },
    });
    expect(res.status()).toBe(204);

    // Verify it's gone
    const getRes = await request.get(`/api/eventos/${eventId}`);
    expect(getRes.status()).toBe(404);
  });
});
