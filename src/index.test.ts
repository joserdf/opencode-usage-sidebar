import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"

describe("index module", () => {
  it("wires the sidebar slot and usage section", async () => {
    const source = await readFile("src/index.tsx", "utf8")

    expect(source).toContain("sidebar_content")
    expect(source).toContain("USAGE LIMITS")
    expect(source).toContain("ProviderLimits")
  })
})
