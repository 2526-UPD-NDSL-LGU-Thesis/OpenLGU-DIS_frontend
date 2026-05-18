import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearPhysicalIdReprintCache,
  loadPhysicalIdReprintCache,
  logoutAndClearPhysicalIdReprintCache,
  savePhysicalIdReprintCache,
} from "./reprint-cache"

afterEach(() => {
  clearPhysicalIdReprintCache()
  vi.useRealTimers()
})

beforeEach(() => {
  vi.useRealTimers()
})

describe("reprint cache", () => {
  it("saves and loads a cached physical ID reprint payload", () => {
    savePhysicalIdReprintCache({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      qrValue: "qr-payload",
      pcn: "PCN-456",
    })

    expect(loadPhysicalIdReprintCache()).toEqual({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      qrValue: "qr-payload",
      pcn: "PCN-456",
    })
  })

  it("expires cached reprints after one hour", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-17T15:00:00.000Z"))

    savePhysicalIdReprintCache({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      qrValue: "qr-payload",
    })

    vi.setSystemTime(new Date("2026-05-17T16:00:01.000Z"))

    expect(loadPhysicalIdReprintCache()).toBeNull()
  })

  it("can clear a cached reprint explicitly", () => {
    savePhysicalIdReprintCache({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      qrValue: "qr-payload",
    })

    clearPhysicalIdReprintCache()

    expect(loadPhysicalIdReprintCache()).toBeNull()
  })

  it("clears cached reprints on logout", async () => {
    savePhysicalIdReprintCache({
      full_name: "Juan dela Cruz",
      uin: "UIN-123",
      dob: "2000-01-01",
      gender: "Male",
      address: "Brgy. Common",
      qrValue: "qr-payload",
    })

    await logoutAndClearPhysicalIdReprintCache(async () => {})

    expect(loadPhysicalIdReprintCache()).toBeNull()
  })
})
