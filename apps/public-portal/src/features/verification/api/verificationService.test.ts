import { describe, it, expect } from 'vitest';

import { verifyQR } from './verificationService';


describe('verifyQR', () => {    
    it('returns LGUser details for a valid QR', async () => {
        const rawQRValue = "mockedAPISuccess";

        const ret = await verifyQR(rawQRValue);
        
        expect(ret).toEqual(
            {
                result: "success",
                idDetails: {
                    local_id: "1000",
                    full_name: "Juan Dela Cruz",
                    dob: "2000-01-01",
                    gender: "Male",
                    location: "Gubat, Diyan",
                    email: "juan@example.com",
                    phone: "09221 924 7284",
                    face: ";-;", // TODO not the most representative face data
                    issuerType: "LGU"
                },
            }
        );
    });

    it('returns error for tampered qr', async () => {
        const rawQRValue = "mockedAPIerror_tampered";

        const ret = await verifyQR(rawQRValue);

        expect(ret).toEqual(
            {
                result: "error_tampered"
            }
        )
    })
});
