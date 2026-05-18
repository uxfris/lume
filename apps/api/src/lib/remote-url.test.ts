import { describe, expect, it } from "vitest"
import { assertSafeRemoteUrl, RemoteUrlError } from "./remote-url"

describe("assertSafeRemoteUrl", () => {
  it("rejects non-http(s) protocols", async () => {
    await expect(assertSafeRemoteUrl("ftp://example.com/file.mp3")).rejects.toThrow(
      RemoteUrlError
    )
  })

  it("rejects localhost", async () => {
    await expect(
      assertSafeRemoteUrl("http://localhost/recording.mp3")
    ).rejects.toMatchObject({ code: "BLOCKED_HOST" })
  })

  it("rejects literal private IPv4 addresses", async () => {
    await expect(
      assertSafeRemoteUrl("http://192.168.1.10/recording.mp3")
    ).rejects.toMatchObject({ code: "BLOCKED_HOST" })
  })

  it("accepts public https URLs", async () => {
    const url = await assertSafeRemoteUrl(
      "https://example.com/share/recording.mp3"
    )
    expect(url.hostname).toBe("example.com")
  })
})
