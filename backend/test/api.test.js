const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
process.env.NODE_ENV = 'test';
const app = require('../app');

describe('API Integration Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const post = async (path, body, headers = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, body: data };
  };

  const get = async (path) => {
    const res = await fetch(`${baseUrl}${path}`);
    const data = await res.json().catch(() => null);
    return { status: res.status, body: data };
  };

  describe('POST /api/calculate', () => {
    test('returns the result', async () => {
      const res = await post('/api/calculate', { operation: 'add', a: 1, b: 2 });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, { result: 3 });
    });

    test('returns 400 on division by zero', async () => {
      const res = await post('/api/calculate', { operation: 'divide', a: 1, b: 0 });
      assert.strictEqual(res.status, 400);
      assert.match(res.body.error, /zero/i);
    });

    test('returns 400 on invalid operand type', async () => {
      const res = await post('/api/calculate', { operation: 'add', a: 'x', b: 1 });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    test('returns 400 on empty body', async () => {
      const res = await post('/api/calculate', {});
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    test('returns 400 on malformed JSON', async () => {
      const res = await post('/api/calculate', '{bad', { 'Content-Type': 'application/json' });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });
  });

  describe('GET endpoints', () => {
    test('health', async () => {
      const res = await get('/api/health');
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, { status: 'ok' });
    });

    test('lists operations', async () => {
      const res = await get('/api/operations');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.operations));
      assert.ok(res.body.operations.includes('sqrt'));
      assert.ok(res.body.operations.includes('add'));
      assert.ok(res.body.operations.includes('divide'));
    });
  });

  describe('Named operation endpoints (e.g. POST /api/:operation)', () => {
    test('POST /api/add', async () => {
      const res = await post('/api/add', { a: 15, b: 27 });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, { result: 42 });
    });

    test('POST /api/multiply', async () => {
      const res = await post('/api/multiply', { a: 6, b: 7 });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, { result: 42 });
    });

    test('POST /api/sqrt', async () => {
      const res = await post('/api/sqrt', { a: 49 });
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.body, { result: 7 });
    });

    test('POST /api/divide with zero returns 400', async () => {
      const res = await post('/api/divide', { a: 10, b: 0 });
      assert.strictEqual(res.status, 400);
      assert.match(res.body.error, /zero/i);
    });

    test('POST /api/invalid-op returns 400', async () => {
      const res = await post('/api/invalid-op', { a: 1, b: 2 });
      assert.strictEqual(res.status, 400);
      assert.match(res.body.error, /Unknown operation/i);
    });
  });

  describe('404 on API endpoints', () => {
    test('GET /api/nonexistent returns JSON 404', async () => {
      const res = await get('/api/nonexistent');
      assert.strictEqual(res.status, 404);
      assert.ok(res.body.error);
    });
  });
});

