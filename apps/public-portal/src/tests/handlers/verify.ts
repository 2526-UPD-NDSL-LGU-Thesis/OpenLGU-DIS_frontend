/*
TODO rename to qr_manager
*/

import { http, HttpResponse, passthrough } from 'msw';

import type { QRVerifyRequestBody, QRVerifyResponseBody } from '#features/verification/types/verification.ts';

const apiBase = import.meta.env.VITE_API_BASE_URL;

export const verifyHandlers = [
    http.post<any,
    QRVerifyRequestBody,
    any
    >(`${apiBase}/qr/verify`, async ({ request }) => {

        const body = await request.json();

        if (body.qr === "mockedAPISuccess"){
            const responseBody = {
                cwt: {
                    local_id: "1000",
                    full_name: "Juan Dela Cruz",
                    dob: "2000-01-01",
                    location: "Gubat, Diyan",
                    face: ";-;", // TODO not face data
                }
            } satisfies QRVerifyResponseBody;
            const responseOptions = { status: 200 }

            return HttpResponse.json(responseBody, responseOptions)
        }
        else if (body.qr === "mockedAPIerror_tampered"){
            const responseBody = { error: "error_tampered" };
            const responseOptions = { status: 400 };

            return HttpResponse.json(responseBody, responseOptions);
        }


        return passthrough();
    }),

];