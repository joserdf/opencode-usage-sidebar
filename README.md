# OpenCode Limits Sidebar Plugin

A small OpenCode plugin that mirrors your local `openusage` limits into a compact sidebar table.

Yep, this thing was vibe coded. I've only tested it on macOS so far.

![Limits sidebar screenshot](./assets/opencode-limits-sidebar.png)

If the layout looks a little rough around the edges, that's because I'm not some elite TUI UI designer. PRs, cleanup requests, and design suggestions are all welcome.

## Prerequisites

1.  **OpenCode**: Version `>= 1.3.13`
2.  **OpenUsage**: You need [OpenUsage](https://github.com/robinebers/openusage) running locally. The plugin polls `http://127.0.0.1:6736/v1/usage` directly.

## Why It Has No Options

This plugin is meant to mirror whatever your current `openusage` setup already exposes.

So it doesn't add its own config surface, mapping rules, or provider-specific settings. If `openusage` changes, the sidebar should change with it. The whole point is that you shouldn't have to configure the same thing twice.

## Installation

Use a stable per-user location that lines up with where OpenCode plugins usually live. The examples below use:

`~/.config/opencode/plugins/opencode-limits-sidebar`

1. Clone the repo into that location:
   ```bash
   mkdir -p ~/.config/opencode/plugins
   gh repo clone hkay-dev/opencode-limits-sidebar ~/.config/opencode/plugins/opencode-limits-sidebar
   ```
2. Install dependencies and compile the plugin:
   ```bash
   cd ~/.config/opencode/plugins/opencode-limits-sidebar
   npm install
   npm run build
   ```
3. Install the plugin globally into your OpenCode configuration:
   ```bash
   opencode plugin ~/.config/opencode/plugins/opencode-limits-sidebar -g
   ```

To update it later:

```bash
cd ~/.config/opencode/plugins/opencode-limits-sidebar
git pull --ff-only
npm install
npm run build
opencode plugin ~/.config/opencode/plugins/opencode-limits-sidebar -g
```

## Tell Your Agent

```text
Install the OpenCode Limits Sidebar plugin into a predictable per-user location. Use `~/.config/opencode/plugins/opencode-limits-sidebar` as the checkout path. If the repo isn't there yet, create `~/.config/opencode/plugins` and clone `hkay-dev/opencode-limits-sidebar` there with `gh repo clone`. If it's already there, run `git pull --ff-only` in that directory. Then run `npm install`, `npm run build`, and `opencode plugin ~/.config/opencode/plugins/opencode-limits-sidebar -g`.
```

## Usage

Start a new conversation in OpenCode and you'll see `USAGE LIMITS` in the right-hand sidebar below the context metrics.

The sidebar shows provider name, plan, last update time, percentage usage, and reset timing for percentage-based limits. It polls `openusage` every 30 seconds.

## Notes

- I've only tested it on macOS.
- If you want Linux or Windows polish, send a PR.
- If you want the table styling cleaned up, send a PR or open an issue. I'm very open to better ideas here.
- If your `openusage` setup is weird, this plugin will probably show that weirdness pretty honestly.

## License

MIT. Fork it, tweak it, and ship your own version.
