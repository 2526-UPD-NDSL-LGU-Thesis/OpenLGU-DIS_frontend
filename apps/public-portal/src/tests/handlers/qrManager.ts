

import { http, HttpResponse, passthrough } from 'msw';
import { faker } from '@faker-js/faker';

import type { QRVerifyRequestBody, QRVerifyResponseBody } from '#features/verification/types/verification.ts';

const apiBase = import.meta.env.VITE_API_BASE_URL;

export const qrManagerHandlers = [
    http.post<any,
    QRVerifyRequestBody,
    any
    >(`${apiBase}/qr/verify`, async ({ request }) => {

        const body = await request.json();

        if (body.qr === "mockedAPIDev"){
            const gender = faker.person.sexType();
            const firstName = faker.person.firstName(gender);
            const lastName = faker.person.lastName();
            const email = faker.internet.email({ firstName, lastName });

            // TODO BUG: random dataUri is svg whereas real is jpeg 
            const face = faker.image.dataUri({ width: 320, type: 'svg-base64' }).substring(26); // Strip out "data:image/svg+xml;base64," to be parity with backend


            const responseBody = {
                cwt: {
                    local_id: faker.string.numeric(10),
                    full_name: faker.person.fullName(),
                    dob: faker.date.birthdate().toDateString(),
                    gender,
                    location: faker.location.city(),
                    email,
                    phone: faker.phone.number(),
                    face, 
                }
            } satisfies QRVerifyResponseBody;
            const responseOptions = { status: 200 }

            return HttpResponse.json(responseBody, responseOptions)
        }
        else if (body.qr === "mockedAPISuccess"){
            const responseBody = {
                cwt: {
                    local_id: "1000",
                    full_name: "Juan Dela Cruz",
                    dob: "2000-01-01",
                    gender: "Male",
                    location: "Gubat, Diyan",
                    email: "juan@example.com",
                    phone: "09221 924 7284",
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