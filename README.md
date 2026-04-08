# OpenCode Limits Sidebar Plugin

A small OpenCode plugin that mirrors your local `openusage` limits into a compact sidebar table.

This thing was entirely vibe coded. It has been tested on macOS only.

![Limits sidebar screenshot](./assets/opencode-limits-sidebar.png)

If the layout looks a little rough around the edges, that's because I'm not pretending to be some elite TUI UI designer. PRs and cleanup requests are welcome.

## Prerequisites

1.  **OpenCode**: Version `>= 1.3.13`
2.  **OpenUsage**: You must have [OpenUsage](https://github.com/robinebers/openusage) running locally. The plugin strictly polls `http://127.0.0.1:6736/v1/usage`.

## Why It Has No Options

The plugin is designed to mirror whatever your current `openusage` setup already exposes.

That means it does not add its own config surface, mapping rules, or provider-specific settings. If `openusage` changes, the sidebar should reflect that. The goal is to stay out of the way, not become another thing you have to babysit.

## Installation

Use a stable per-user location that doesn't depend on a custom workspace layout. The examples below use:

`~/.local/share/opencode/plugins/opencode-limits-sidebar`

1. Clone the repo into that location:
   ```bash
   mkdir -p ~/.local/share/opencode/plugins
   gh repo clone hkay-dev/opencode-limits-sidebar ~/.local/share/opencode/plugins/opencode-limits-sidebar
   ```
2. Install dependencies and compile the plugin:
   ```bash
   cd ~/.local/share/opencode/plugins/opencode-limits-sidebar
   npm install
   npm run build
   ```
3. Install the plugin globally into your OpenCode configuration:
   ```bash
   opencode plugin ~/.local/share/opencode/plugins/opencode-limits-sidebar -g
   ```

To update it later:

```bash
cd ~/.local/share/opencode/plugins/opencode-limits-sidebar
git pull --ff-only
npm install
npm run build
opencode plugin ~/.local/share/opencode/plugins/opencode-limits-sidebar -g
```

## Tell Your Agent

```text
Install the OpenCode Limits Sidebar plugin into a predictable per-user location. Use `~/.local/share/opencode/plugins/opencode-limits-sidebar` as the checkout path. If the repo is missing, create `~/.local/share/opencode/plugins` and clone `hkay-dev/opencode-limits-sidebar` there with `gh repo clone`. If it already exists, run `git pull --ff-only` in that directory. Then run `npm install`, `npm run build`, and `opencode plugin ~/.local/share/opencode/plugins/opencode-limits-sidebar -g`.
```

## Usage

Start any new conversation in OpenCode. You'll see `USAGE LIMITS` injected into the right-hand sidebar below the context metrics.

The sidebar shows provider name, plan, last update time, percentage usage, and reset timing for percentage-based limits. It polls `openusage` every 30 seconds.

## Notes

- macOS is the only platform I've personally tested.
- If you want Linux or Windows polish, send a PR.
- If you want the table styling cleaned up, definitely send a PR.
- If your `openusage` setup is weird, that is probably exactly what this plugin will show you.

## License

MIT. Fork it, tweak it, ship your own flavor.
