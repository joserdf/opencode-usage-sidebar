import { afterEach, describe, expect, it, vi } from "vitest"
import {
  durationLabel,
  getPalette,
  isCountRow,
  lineMetric,
  providerMetaText,
  resetDuration,
  resetText,
  rightAlign,
  timeAgo,
} from "./limits.js"

describe("limits helpers", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("uses fallbacks and accepts RGBA theme values", () => {
    const text = { r: 1, g: 2, b: 3, a: 4 }
    const palette = getPalette({ text, primary: "#f00" })

    expect(palette.text).toBe(text)
    expect(palette.accent).toBe("#f00")
    expect(palette.subtle).toBe("#2a2a2a")
  })

  it("formats ages and reset durations", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-04-08T20:00:00Z"))

    expect(timeAgo("2026-04-08T19:55:00Z")).toBe("5m")
    expect(durationLabel(4 * 60 * 60 * 1000)).toBe("4h")
    expect(resetDuration({
      label: "Session",
      type: "progress",
      used: 10,
      limit: 100,
      resetsAt: "2026-04-09T00:00:00Z",
    })).toBe("4h")
    expect(providerMetaText({
      displayName: "Claude",
      plan: "Max 5x",
      fetchedAt: "2026-04-08T19:55:00Z",
    })).toBe("Max 5x · 5m")
  })

  it("formats percent and count metrics cleanly", () => {
    expect(lineMetric({
      label: "Weekly",
      type: "progress",
      used: 24,
      limit: 100,
    })).toBe(" 24%")

    expect(lineMetric({
      label: "Credits",
      type: "progress",
      used: 1000,
      limit: 1000,
      format: { kind: "count", suffix: "credits" },
    })).toBe("1000/1000")

    expect(lineMetric({
      label: "Spend",
      type: "progress",
      used: 4,
      limit: 10,
      format: { kind: "count", suffix: "credits" },
    })).toBe("4/10 credits")
  })

  it("handles reset text and alignment helpers", () => {
    expect(isCountRow({
      label: "Credits",
      type: "progress",
      used: 1,
      limit: 1,
      format: { kind: "count" },
    })).toBe(true)

    expect(resetText({
      label: "Weekly",
      type: "progress",
      used: 24,
      limit: 100,
      periodDurationMs: 7 * 24 * 60 * 60 * 1000,
    })).toBe("~7d")

    expect(rightAlign("4h", 7)).toBe("     4h")
  })
})
