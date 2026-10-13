import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server/index';

describe('Auth & API Integration Tests', () => {
  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/courses/categories without auth should fail with 401', async () => {
    const res = await request(app).get('/api/courses/categories');
    expect(res.status).toBe(401);
  });
});
