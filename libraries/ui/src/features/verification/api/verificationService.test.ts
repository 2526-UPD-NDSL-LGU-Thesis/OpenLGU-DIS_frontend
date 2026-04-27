/* Unit tests for verifyQR behavior using stubbed fetch responses. */
// TODO need to review this

import { afterEach, describe, expect, it, vi } from "vitest"

import { verifyQR } from "@openlguid/ui/features/verification/api/verificationService"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("verifyQR", () => {
  it("returns resident details for a valid QR", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          cwt: {
            local_id: "1000",
            full_name: "Juan Dela Cruz",
            dob: "2000-01-01",
            gender: "Male",
            location: "Gubat, Diyan",
            email: "juan@example.com",
            phone: "09221 924 7284",
            face: ";-;",
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    const ret = await verifyQR("mockedAPISuccess")

    expect(ret).toEqual({
      result: "success",
      idDetails: {
        local_id: "1000",
        full_name: "Juan Dela Cruz",
        dob: "2000-01-01",
        gender: "Male",
        location: "Gubat, Diyan",
        email: "juan@example.com",
        phone: "09221 924 7284",
        face: ";-;",
        issuerType: "LGU",
      },
    })
  })

  it("returns tampered error from API", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: "error_tampered",
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    const ret = await verifyQR("mockedAPIerror_tampered")

    expect(ret).toEqual({
      result: "error_tampered",
      message: undefined,
    })
  })
})


/*

Original:


import { describe, it, expect } from 'vitest';

import { verifyQR } from '@openlguid/ui/features/verification/api/verificationService';


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


*/