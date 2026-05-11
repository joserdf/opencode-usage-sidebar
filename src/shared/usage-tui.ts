import type { ProviderUsage, UsageLine } from "./limits.js"

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

// Per-provider rate limit cooldown tracking (provider -> timestamp of last failure)
const providerFailures = new Map<string, number>()
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

const isProviderInCooldown = (provider: string): boolean => {
    const lastFailTime = providerFailures.get(provider)
    if (!lastFailTime) return false
    return Date.now() - lastFailTime < RATE_LIMIT_COOLDOWN_MS
}

const markProviderFailed = (provider: string): void => {
    providerFailures.set(provider, Date.now())
}

const getDisplayName = (provider: string): string => {
    const map: Record<string, string> = {
        claude: "Claude",
        codex: "Codex",
        copilot: "Copilot",
        openai: "OpenAI",
        openrouter: "OpenRouter",
    }
    return map[provider] || provider.charAt(0).toUpperCase() + provider.slice(1)
}

const planLabel = (window: string): string => {
    if (window === "5h") return "Session"
    if (window === "7d") return "Weekly"
    if (window === "30d") return "Monthly"
    return window
}

const spawnUsageTui = async (window: string): Promise<UsageTuiResponse | null> => {
    try {
        const proc = Bun.spawn(
            ["usage-tui", "show", "--provider", "all", "--window", window, "--json"],
            { stdout: "pipe", stderr: "pipe" },
        )

        const [stdout, exit] = await Promise.all([
            new Response(proc.stdout).text(),
            proc.exited,
        ])

        if (exit !== 0) return null
        return JSON.parse(stdout) as UsageTuiResponse
    } catch {
        return null
    }
}

export const fetchUsage = async (): Promise<FetchResult> => {
    try {
        const data5h = await spawnUsageTui("5h")
        await new Promise(resolve => setTimeout(resolve, 500))
        const data7d = await spawnUsageTui("7d")

        if (!data5h) {
            return { providers: lastGood, binaryMissing: false }
        }

        const providers: ProviderUsage[] = []

        // Discover all configured providers dynamically
        for (const providerKey of Object.keys(data5h)) {
            const payload5h = data5h[providerKey]
            if (!payload5h) continue

            const lines: UsageLine[] = []
            const error = payload5h.error

            if (error) {
                // Mark provider as failed for rate limit cooldown
                markProviderFailed(providerKey)
                // Show error row (e.g., rate limited, auth failed)
                lines.push({ label: "—", type: "progress", used: 0, limit: 0, resetsAt: null })
            } else {
                // Add Session (5h) line
                const m5h = payload5h.metrics
                const limit5h = m5h.limit ?? 0
                const remaining5h = m5h.remaining ?? limit5h

                lines.push({
                    label: "Session",
                    type: "progress",
                    used: limit5h - remaining5h,
                    limit: limit5h,
                    resetsAt: m5h.reset_at,
                })

                // Try to add Weekly (7d) line only if provider is NOT in cooldown
                if (!isProviderInCooldown(providerKey) && data7d?.[providerKey]) {
                    const payload7d = data7d[providerKey]
                    if (!payload7d.error) {
                        const m7d = payload7d.metrics
                        const limit7d = m7d.limit ?? 0
                        const remaining7d = m7d.remaining ?? limit7d

                        lines.push({
                            label: "Weekly",
                            type: "progress",
                            used: limit7d - remaining7d,
                            limit: limit7d,
                            resetsAt: m7d.reset_at,
                        })
                    } else {
                        // Mark provider as failed if 7d query returns error
                        markProviderFailed(providerKey)
                    }
                }
            }

            providers.push({
                displayName: getDisplayName(providerKey),
                plan: error ? "error" : "Usage",
                fetchedAt: payload5h.updated_at,
                lines,
            })
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
