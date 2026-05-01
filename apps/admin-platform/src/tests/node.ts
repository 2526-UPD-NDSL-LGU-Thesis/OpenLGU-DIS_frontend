// Process-level integration for MSW

import { setupServer } from 'msw/node';
import { handlers } from '#/tests/handlers/handlers.js';

export const server = setupServer(...handlers);