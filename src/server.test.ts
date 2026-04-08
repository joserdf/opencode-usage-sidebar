import { describe, it, expect } from "vitest"
import plugin from "./server.js"

describe("server plugin", () => {
  it("exports valid plugin", () => {
    expect(plugin.id).toBe("opencode-limits-sidebar")
    expect(typeof plugin.server).toBe("function")
  })

  it("plugin initialization returns event handler", async () => {
    const api = await plugin.server?.()
    expect(api).toBeDefined()
    if (api && "event" in api && typeof api.event === "function") {
      const result = await api.event()
      expect(result).toBeUndefined()
    }
  })
})
