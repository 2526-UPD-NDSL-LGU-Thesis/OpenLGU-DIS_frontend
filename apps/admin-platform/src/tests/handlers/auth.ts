
/* MSW handlers for Auth API routes in tests/development. */


import { http, HttpResponse, passthrough } from 'msw';

const apiBase = import.meta.env.VITE_API_BASE_URL;

export const authHandlers = [
    http.post(`${apiBase}/token/`, async ({ request }) => {

        const body = await request.json();

        const mockedResponse = body

        if (mockedResponse) {
            return HttpResponse.json(mockedResponse.body, { status: mockedResponse.status })
        }


        return passthrough();
    }),

];