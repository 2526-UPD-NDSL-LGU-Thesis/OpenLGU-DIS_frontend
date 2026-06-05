/* Test utility for generating reusable verification mock data for UI and MSW. */
/* TODO need to review this */

import { faker } from "@faker-js/faker"

import type { QRVerifyReturn } from "@openlguid/ui/features/verification/api/verificationService"
import type { QRVerifyResponseBody } from "@openlguid/ui/features/verification/types/verification"

export type MockVerificationScenario = "random-success" | "fixed-success" | "tampered"

export function getMockVerificationResult(
  scenario: MockVerificationScenario = "fixed-success"
): QRVerifyReturn {
  if (scenario === "tampered") {
    return {
      result: "error_tampered",
      message: "Mocked tampered QR result.",
    }
  }

  const responseBody =
    scenario === "random-success"
      ? createRandomSuccessResponseBody()
      : createFixedSuccessResponseBody()
  const idDetails = responseBody.id_details

  return {
    result: "success",
    qr_type: responseBody.qr_type,
    idDetails: {
      uin: idDetails?.uin ?? faker.string.numeric(10),
      pcn: idDetails?.pcn,
      full_name: idDetails?.full_name ?? faker.person.fullName(),
      dob: idDetails?.dob ?? faker.date.birthdate().toDateString(),
      gender: idDetails?.gender ?? faker.person.sexType(),
      location: idDetails?.location ?? faker.location.city(),
      email:
        idDetails?.email ??
        faker.internet.email({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        }),
      phone: idDetails?.phone ?? faker.phone.number(),
      face:
        idDetails?.face ??
        faker.image.dataUri({ width: 320, type: "svg-base64" }).split(",")[1] ??
        "",
    },
    message: "Loaded from local mock data utility.",
  }
}

export function getMockApiResponseByRawQR(rawQRValue: string): {
  status: number
  body: QRVerifyResponseBody
} | null {
  if (rawQRValue === "mockedAPIDev") {
    return {
      status: 200,
      body: createRandomSuccessResponseBody(),
    }
  }

  if (rawQRValue === "mockedAPISuccess") {
    return {
      status: 200,
      body: createFixedSuccessResponseBody(),
    }
  }

  if (rawQRValue === "mockedAPIerror_tampered") {
    return {
      status: 400,
      body: {
        error: "error_tampered",
      },
    }
  }

  return null
}

function createRandomSuccessResponseBody(): QRVerifyResponseBody {
  const gender = faker.person.sexType()
  const firstName = faker.person.firstName(gender)
  const lastName = faker.person.lastName()
  const email = faker.internet.email({ firstName, lastName })

  return {
    qr_type: "OpenLGUQR",
    id_details: {
      uin: faker.string.numeric(10),
      full_name: faker.person.fullName(),
      dob: faker.date.birthdate().toDateString(),
      gender,
      location: faker.location.city(),
      email,
      phone: faker.phone.number(),
      face: faker.image.dataUri({ width: 320, type: "svg-base64" }).split(",")[1] ?? "",
    },
  }
}

function createFixedSuccessResponseBody(): QRVerifyResponseBody {
  return {
    qr_type: "OpenLGUQR",
    id_details: {
      uin: "1000",
      full_name: "Juan Dela Cruz",
      dob: "2000-01-01",
      gender: "Male",
      location: "Gubat, Diyan",
      email: "juan@example.com",
      phone: "09221 924 7284",
      face: ";-;",
    },
  }
}
