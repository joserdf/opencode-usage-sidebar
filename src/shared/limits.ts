import type { RGBA } from "@opentui/core"

export type ColorValue = RGBA | string

export const USED_COLUMN_WIDTH = 5
export const RESET_COLUMN_WIDTH = 7
export const REFRESH_INTERVAL_MS = 30_000
export const SIDEBAR_ORDER = 50

const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS
const TWO_DAYS_MS = 2 * 24 * HOUR_MS

export interface Palette {
    subtle: ColorValue
    text: ColorValue
    muted: ColorValue
    accent: ColorValue
    warning: ColorValue
}

export interface UsageLine {
    label: string
    type: string
    used: number
    limit: number
    format?: {
        kind?: string
        suffix?: string
    }
    resetsAt?: string | null
    periodDurationMs?: number | null
}

export interface ProviderUsage {
    displayName: string
    plan?: string
    fetchedAt: string
    lines?: UsageLine[]
}

export const getPalette = (theme: Record<string, unknown>): Palette => {
    const get = (name: string, fallback: string): ColorValue => {
        const value = theme[name]
        if (typeof value === "string") return value
        if (value && typeof value === "object") return value as RGBA
        return fallback
    }

    return {
        subtle: get("borderSubtle", "#2a2a2a"),
        text: get("text", "#f0f0f0"),
        muted: get("textMuted", "#a5a5a5"),
        accent: get("primary", "#5f87ff"),
        warning: get("warning", "#d7a94b"),
    }
}

export const timeAgo = (isoString: string) => {
    const elapsedMs = Date.now() - new Date(isoString).getTime()
    if (elapsedMs < MINUTE_MS) return "now"
    if (elapsedMs < HOUR_MS) return `${Math.floor(elapsedMs / MINUTE_MS)}m`
    if (elapsedMs < TWO_DAYS_MS) return `${Math.floor(elapsedMs / HOUR_MS)}h`
    return `${Math.floor(elapsedMs / (24 * HOUR_MS))}d`
}

export const durationLabel = (durationMs: number) => {
    if (durationMs < HOUR_MS) return `${Math.max(1, Math.floor(durationMs / MINUTE_MS))}m`
    if (durationMs < TWO_DAYS_MS) return `${Math.floor(durationMs / HOUR_MS)}h`
    return `${Math.floor(durationMs / (24 * HOUR_MS))}d`
}

export const resetDuration = (line: UsageLine) => {
    if (line.resetsAt) {
        const remainingMs = new Date(line.resetsAt).getTime() - Date.now()
        if (remainingMs <= 0) return "now"
        return durationLabel(remainingMs)
    }

    if (line.periodDurationMs && line.periodDurationMs > 0) {
        return `~${durationLabel(line.periodDurationMs)}`
    }

    return "--"
}

export const updatedText = (provider: ProviderUsage) => {
    const age = timeAgo(provider.fetchedAt)
    return age === "now" ? "just now" : age
}

export const providerMetaText = (provider: ProviderUsage) => {
    const updated = updatedText(provider)
    return provider.plan ? `${provider.plan} · ${updated}` : updated
}

export const resetText = (line: UsageLine) => {
    const duration = resetDuration(line)
    return duration === "--" ? "" : duration
}

export const lineMetric = (line: UsageLine) => {
    if (line.format?.kind === "count") {
        const suffix = line.format.suffix && line.label.toLowerCase() !== line.format.suffix.toLowerCase()
            ? ` ${line.format.suffix}`
            : ""
        return `${Math.round(line.used)}/${Math.round(line.limit)}${suffix}`
    }

    if (line.limit <= 0) return "  0%"
    const percent = Math.min(100, Math.max(0, Math.round((line.used / line.limit) * 100)))
    return `${percent.toString().padStart(3)}%`
}

export const isCountRow = (line: UsageLine) => line.format?.kind === "count"

export const rightAlign = (value: string, width: number) => value.padStart(width)
