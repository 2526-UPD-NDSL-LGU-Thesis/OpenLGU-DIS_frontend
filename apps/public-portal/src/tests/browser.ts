import { setupWorker } from 'msw/browser'
import { handlers } from '#tests/handlers/handlers.ts'
 
export const worker = setupWorker(...handlers)