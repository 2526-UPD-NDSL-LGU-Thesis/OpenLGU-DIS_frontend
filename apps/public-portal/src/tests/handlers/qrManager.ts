
/* MSW handlers for QR verification API routes in tests/development. */

// TODO need to review this

import { http, HttpResponse, passthrough } from 'msw';

import type {
    QRVerifyRequestBody,
} from '@openlguid/ui/features/verification/types/verification';
import { getMockApiResponseByRawQR } from '#/tests/utility/mockVerificationData.ts';

const apiBase = import.meta.env.VITE_API_BASE_URL;

export const qrManagerHandlers = [
    http.post<any,
    QRVerifyRequestBody,
    any
    >(`${apiBase}/qr/verify/`, async ({ request }) => {

        const body = await request.json();

        const mockedResponse = getMockApiResponseByRawQR(body.qr)

        if (mockedResponse) {
            return HttpResponse.json(mockedResponse.body, { status: mockedResponse.status })
        }


        return passthrough();
    }),

];