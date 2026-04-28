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

  return {
    result: "success",
    idDetails: {
      ...responseBody.id_details,
      issuerType: "LGU",
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
    id_details: {
      local_id: faker.string.numeric(10),
      full_name: faker.person.fullName(),
      dob: faker.date.birthdate().toDateString(),
      gender,
      location: faker.location.city(),
      email,
      phone: faker.phone.number(),
      face: faker.image.dataUri({ width: 320, type: "svg-base64" }).substring(26),
    },
  }
}

function createFixedSuccessResponseBody(): QRVerifyResponseBody {
  return {
    id_details: {
      local_id: "1000",
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
