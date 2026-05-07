import type { ProviderUsage, UsageLine } from "./limits.js"

const PROVIDERS = ["claude", "codex", "copilot"] as const
type ProviderKey = typeof PROVIDERS[number]

const DISPLAY_NAMES: Record<ProviderKey, string> = {
    claude: "Claude",
    codex: "Codex",
    copilot: "Copilot",
}

interface UsageTuiMetrics {
    cost: number | null
    requests: number | null
    input_tokens: number | null
    output_tokens: number | null
    remaining: number | null
    limit: number | null
    reset_at: string | null
}

interface UsageTuiPayload {
    provider: string
    window: string
    metrics: UsageTuiMetrics
    updated_at: string
    raw: unknown
    error: string | null
}

type UsageTuiResponse = Record<string, UsageTuiPayload>

export interface FetchResult {
    providers: ProviderUsage[]
    binaryMissing: boolean
}

let lastGood: ProviderUsage[] = []

const planLabel = (window: string): string => {
    if (window === "5h") return "Session"
    if (window === "7d") return "Weekly"
    if (window === "30d") return "Monthly"
    return window
}

const failedRow = (key: ProviderKey): ProviderUsage => ({
    displayName: DISPLAY_NAMES[key],
    plan: "error",
    fetchedAt: new Date().toISOString(),
    lines: [{ label: "—", type: "progress", used: 0, limit: 0, resetsAt: null }],
})

const translate = (key: ProviderKey, p: UsageTuiPayload): ProviderUsage => {
    if (p.error) return failedRow(key)
    const m = p.metrics
    const limit = m.limit ?? 0
    const remaining = m.remaining ?? limit
    const label = planLabel(p.window)
    const line: UsageLine = {
        label,
        type: "progress",
        used: limit - remaining,
        limit,
        resetsAt: m.reset_at,
    }
    return {
        displayName: DISPLAY_NAMES[key],
        plan: label,
        fetchedAt: p.updated_at,
        lines: [line],
    }
}

export const fetchUsage = async (): Promise<FetchResult> => {
    try {
        const proc = Bun.spawn(
            ["usage-tui", "show", "--provider", "all", "--window", "5h", "--json"],
            { stdout: "pipe", stderr: "pipe" },
        )

        const [stdout, exit] = await Promise.all([
            new Response(proc.stdout).text(),
            proc.exited,
        ])

        if (exit !== 0) {
            return { providers: lastGood, binaryMissing: false }
        }

        const parsed = JSON.parse(stdout) as UsageTuiResponse
        const providers: ProviderUsage[] = []
        for (const key of PROVIDERS) {
            const payload = parsed[key]
            if (payload) providers.push(translate(key, payload))
        }
        if (providers.length > 0) lastGood = providers
        return { providers, binaryMissing: false }
    } catch (e) {
        const err = e as NodeJS.ErrnoException
        if (err?.code === "ENOENT") {
            return { providers: lastGood, binaryMissing: true }
        }
        return { providers: lastGood, binaryMissing: false }
    }
}
