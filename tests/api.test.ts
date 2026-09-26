import { describe, it, expect } from 'vitest';
import { SAMPLE_CONTRACTS } from '../src/data/sampleContracts';
import { apiRouter } from '../server/api';
import express from 'express';

// Create a lightweight test Express app mounting the API router
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  return app;
}

// Lightweight supertest-free HTTP helper using Node fetch against an ephemeral server
async function testRequest(method: 'GET' | 'POST', path: string, body?: any) {
  const app = createTestApp();
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        const addr = server.address() as any;
        const url = `http://127.0.0.1:${addr.port}${path}`;
        const options: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(url, options);
        const json = await res.json();
        server.close();
        resolve({ status: res.status, body: json });
      } catch (err) {
        server.close();
        reject(err);
      }
    });
  });
}

describe('API — /api/health', () => {
  it('should return 200 with status "ok"', async () => {
    const res = await testRequest('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should include provider and timestamp fields', async () => {
    const res = await testRequest('GET', '/api/health');
    expect(res.body).toHaveProperty('provider');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('mockMode');
  });
});

describe('API — /api/samples', () => {
  it('should return exactly 4 sample contracts', async () => {
    const res = await testRequest('GET', '/api/samples');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4);
  });

  it('each sample should have id, title, and text fields', async () => {
    const res = await testRequest('GET', '/api/samples');
    for (const sample of res.body) {
      expect(sample).toHaveProperty('id');
      expect(sample).toHaveProperty('title');
      expect(sample).toHaveProperty('text');
      expect(typeof sample.id).toBe('string');
      expect(typeof sample.title).toBe('string');
      expect(sample.text.length).toBeGreaterThan(50);
    }
  });

  it('should include commercial-lease and mutual-nda samples', async () => {
    const res = await testRequest('GET', '/api/samples');
    const ids = res.body.map((s: any) => s.id);
    expect(ids).toContain('commercial-lease');
    expect(ids).toContain('mutual-nda');
  });
});

describe('API — /api/analyze', () => {
  it('should return 400 when no text is provided', async () => {
    const res = await testRequest('POST', '/api/analyze', { text: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return valid analysis for contract text', async () => {
    const res = await testRequest('POST', '/api/analyze', {
      text: SAMPLE_CONTRACTS[0].text,
      contractId: SAMPLE_CONTRACTS[0].id,
    });
    expect(res.status).toBe(200);
    expect(typeof res.body.totalRiskScore).toBe('number');
    expect(res.body.totalRiskScore).toBeGreaterThanOrEqual(0);
    expect(res.body.totalRiskScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(res.body.keyConcerns)).toBe(true);
  });

  it('should return 400 when text exceeds 100,000 characters', async () => {
    const hugeText = 'A'.repeat(100001);
    const res = await testRequest('POST', '/api/analyze', { text: hugeText });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('100,000 characters');
  });

  it('should return 400 in moot-court when text exceeds 100,000 characters', async () => {
    const hugeText = 'B'.repeat(100001);
    const res = await testRequest('POST', '/api/moot-court', { clauseText: hugeText });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('100,000 characters');
  });
});
