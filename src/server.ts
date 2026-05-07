import type { Plugin } from "@opencode-ai/plugin"

const server: Plugin = () => Promise.resolve({
    event: () => Promise.resolve(),
})

export default {
    id: "opencode-usage-sidebar",
    server,
}
