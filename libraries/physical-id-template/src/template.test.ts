import { describe, expect, it } from "vitest"

import { buildPhysicalLGUIDInputs } from "./template"

describe("buildPhysicalLGUIDInputs", () => {
  it("keeps data URLs intact", () => {
    const [inputs] = buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "data:image/png;base64,ZmFrZS1mYWtl",
    })

    expect(inputs.face).toBe("data:image/png;base64,ZmFrZS1mYWtl")
  })

  it("normalizes raw png and jpeg payloads", () => {
    const [pngInputs] = buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "iVBORw0KGgoAAAANSUhEUgAA",
    })

    const [jpegInputs] = buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
    })

    expect(pngInputs.face).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA")
    expect(jpegInputs.face).toBe(
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/"
    )
  })

  it("falls back to a transparent pixel for unknown face payloads", () => {
    const [inputs] = buildPhysicalLGUIDInputs({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      phone: "0917 000 0000",
      qrValue: "qr-payload",
      face: "not-an-image",
    })

    expect(inputs.face).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7/7GQAAAAASUVORK5CYII="
    )
  })
})