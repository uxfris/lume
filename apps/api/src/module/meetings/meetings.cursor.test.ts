import { describe, expect, it } from "vitest"
import {
  decodeMeetingListCursor,
  encodeMeetingListCursor,
} from "./meetings.cursor"

describe("meetings cursor", () => {
  it("round-trips a cursor payload", () => {
    const createdAt = new Date("2025-04-12T10:34:56.000Z")
    const id = "ckxyz123"

    const encoded = encodeMeetingListCursor({
      c: createdAt.toISOString(),
      i: id,
    })
    const decoded = decodeMeetingListCursor(encoded)

    expect(decoded.id).toBe(id)
    expect(decoded.createdAt.toISOString()).toBe(createdAt.toISOString())
  })

  it("uses URL-safe base64 (no '+', '/', or '=' padding)", () => {
    const encoded = encodeMeetingListCursor({
      c: new Date().toISOString(),
      i: "id-with-symbols/+=&".repeat(3),
    })
    expect(encoded).not.toMatch(/[+/=]/)
  })

  it("throws INVALID_CURSOR for malformed input", () => {
    expect(() => decodeMeetingListCursor("not-base64!!")).toThrow(
      /INVALID_CURSOR/
    )
    expect(() =>
      decodeMeetingListCursor(
        Buffer.from("not-json", "utf8").toString("base64url")
      )
    ).toThrow(/INVALID_CURSOR/)
  })
})
