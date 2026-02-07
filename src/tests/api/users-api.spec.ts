import { test, expect } from '../../fixtures/base.fixture';

test.describe('Users API Tests @api', () => {
  // ─── GET Users ────────────────────────────────────────────────

  test.describe('GET /users', () => {
    test('should get list of users', async ({ apiHelper }) => {
      const response = await apiHelper.get('/users?page=1');
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.page).toBe(1);
      expect(body.data).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);
    });

    test('should return paginated results', async ({ apiHelper }) => {
      const page1 = await apiHelper.getJSON<{ page: number; per_page: number; total: number; data: unknown[] }>('/users?page=1');
      const page2 = await apiHelper.getJSON<{ page: number; per_page: number; total: number; data: unknown[] }>('/users?page=2');

      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);
      expect(page1.data).not.toEqual(page2.data);
    });

    test('should return correct per_page count', async ({ apiHelper }) => {
      const response = await apiHelper.get('/users?per_page=3');
      const body = await response.json();
      expect(body.per_page).toBe(3);
      expect(body.data.length).toBeLessThanOrEqual(3);
    });
  });

  // ─── GET Single User ─────────────────────────────────────────

  test.describe('GET /users/:id', () => {
    test('should get single user by id', async ({ apiHelper }) => {
      const response = await apiHelper.get('/users/2');
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.data.id).toBe(2);
      expect(body.data.email).toBeDefined();
      expect(body.data.first_name).toBeDefined();
      expect(body.data.last_name).toBeDefined();
      expect(body.data.avatar).toBeDefined();
    });

    test('should return 404 for non-existent user', async ({ apiHelper }) => {
      const response = await apiHelper.get('/users/999');
      expect(response.status()).toBe(404);
    });

    test('should return user with valid email format', async ({ apiHelper }) => {
      const body = await apiHelper.getJSON<{ data: { email: string } }>('/users/2');
      expect(body.data.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  // ─── POST Create User ────────────────────────────────────────

  test.describe('POST /users', () => {
    test('should create a new user', async ({ apiHelper }) => {
      const response = await apiHelper.post('/users', {
        data: { name: 'John Doe', job: 'QA Engineer' },
      });
      expect(response.status()).toBe(201);

      const body = await response.json();
      expect(body.name).toBe('John Doe');
      expect(body.job).toBe('QA Engineer');
      expect(body.id).toBeDefined();
      expect(body.createdAt).toBeDefined();
    });

    test('should create user with empty body', async ({ apiHelper }) => {
      const response = await apiHelper.post('/users', { data: {} });
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.id).toBeDefined();
    });

    test('should include timestamp in creation response', async ({ apiHelper }) => {
      const response = await apiHelper.post('/users', {
        data: { name: 'Test', job: 'Tester' },
      });
      const body = await response.json();
      const createdAt = new Date(body.createdAt);
      expect(createdAt).toBeInstanceOf(Date);
      expect(createdAt.getTime()).not.toBeNaN();
    });
  });

  // ─── PUT Update User ─────────────────────────────────────────

  test.describe('PUT /users/:id', () => {
    test('should update user with PUT', async ({ apiHelper }) => {
      const response = await apiHelper.put('/users/2', {
        data: { name: 'Jane Updated', job: 'Senior QA' },
      });
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.name).toBe('Jane Updated');
      expect(body.job).toBe('Senior QA');
      expect(body.updatedAt).toBeDefined();
    });
  });

  // ─── PATCH Update User ───────────────────────────────────────

  test.describe('PATCH /users/:id', () => {
    test('should partially update user with PATCH', async ({ apiHelper }) => {
      const response = await apiHelper.patch('/users/2', {
        data: { job: 'Lead QA' },
      });
      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.job).toBe('Lead QA');
      expect(body.updatedAt).toBeDefined();
    });
  });

  // ─── DELETE User ──────────────────────────────────────────────

  test.describe('DELETE /users/:id', () => {
    test('should delete user', async ({ apiHelper }) => {
      const response = await apiHelper.delete('/users/2');
      expect(response.status()).toBe(204);
    });
  });

  // ─── Authentication API ───────────────────────────────────────

  test.describe('Authentication', () => {
    test('should register user successfully', async ({ apiHelper }) => {
      const response = await apiHelper.post('/register', {
        data: { email: 'eve.holt@reqres.in', password: 'pistol' },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.id).toBeDefined();
      expect(body.token).toBeDefined();
    });

    test('should fail registration without password', async ({ apiHelper }) => {
      const response = await apiHelper.post('/register', {
        data: { email: 'eve.holt@reqres.in' },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toBeDefined();
    });

    test('should login successfully', async ({ apiHelper }) => {
      const response = await apiHelper.post('/login', {
        data: { email: 'eve.holt@reqres.in', password: 'cityslicka' },
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.token).toBeDefined();
    });

    test('should fail login without password', async ({ apiHelper }) => {
      const response = await apiHelper.post('/login', {
        data: { email: 'eve.holt@reqres.in' },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toBeDefined();
    });
  });

  // ─── Response Schema Validation ───────────────────────────────

  test.describe('Response Schema Validation', () => {
    test('should return correct schema for user list', async ({ apiHelper }) => {
      const body = await apiHelper.getJSON<{
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
        data: Array<{
          id: number;
          email: string;
          first_name: string;
          last_name: string;
          avatar: string;
        }>;
      }>('/users?page=1');

      expect(typeof body.page).toBe('number');
      expect(typeof body.per_page).toBe('number');
      expect(typeof body.total).toBe('number');
      expect(typeof body.total_pages).toBe('number');
      expect(Array.isArray(body.data)).toBeTruthy();

      if (body.data.length > 0) {
        const user = body.data[0];
        expect(typeof user.id).toBe('number');
        expect(typeof user.email).toBe('string');
        expect(typeof user.first_name).toBe('string');
        expect(typeof user.last_name).toBe('string');
        expect(typeof user.avatar).toBe('string');
      }
    });

    test('should return correct schema for single user', async ({ apiHelper }) => {
      const body = await apiHelper.getJSON<{
        data: {
          id: number;
          email: string;
          first_name: string;
          last_name: string;
          avatar: string;
        };
        support: { url: string; text: string };
      }>('/users/1');

      expect(body.data).toBeDefined();
      expect(body.support).toBeDefined();
      expect(typeof body.support.url).toBe('string');
      expect(typeof body.support.text).toBe('string');
    });
  });
});
