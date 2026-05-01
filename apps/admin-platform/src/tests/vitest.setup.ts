// Runs before test suite executes. https://vitest.dev/guide/learn/setup-teardown.html#setup-files

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '#/tests/node.ts';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());