<img src="docs/icon-readme.png" width="32" height="32" alt="DevPilot" style="vertical-align: middle; margin-right: 8px;" /> DevPilot
===

**A desktop GUI client for Claude Code** — multi-provider support, MCP extensions, custom skills, and an assistant workspace that understands your projects.

[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)](https://github.com/Logic955/CodePilot/releases)
[![License](https://img.shields.io/badge/license-BSL--1.1-orange)](LICENSE)

---

> **关于本项目 / About this project**
>
> DevPilot 是 [@op7418](https://github.com/op7418) 的 [CodePilot](https://github.com/op7418/CodePilot) 的个人 fork 和衍生版本，原项目采用 [Business Source License 1.1](LICENSE) 授权。
>
> DevPilot is a personal fork and derivative of [CodePilot](https://github.com/op7418/CodePilot) by [@op7418](https://github.com/op7418), licensed under [Business Source License 1.1](LICENSE).
>
> **与上游的主要差异 / Key differences from upstream:**
> - 项目更名为 **DevPilot**，用于个人使用 / Renamed to DevPilot for personal use
> - 专注于 Claude Code 桌面工作流 / Focused solely on Claude Code desktop workflow
>
> 原始版权和许可条款继续有效，详见 [LICENSE](LICENSE)。
> All original copyright and license terms remain in effect. See [LICENSE](LICENSE) for details.

---

## Quick Start

### Path A: Download a release

1. Install the Claude Code CLI: `npm install -g @anthropic-ai/claude-code`
2. Authenticate: `claude login`
3. Download the installer for your platform from the [Releases](https://github.com/Logic955/CodePilot/releases) page
4. Launch DevPilot

### Path B: Build from source

| Prerequisite | Minimum version |
|---|---|
| Node.js | 18+ |
| Claude Code CLI | Installed and authenticated |
| npm | 9+ (ships with Node 18) |

```bash
git clone https://github.com/Logic955/CodePilot.git
cd CodePilot
npm install
npm run dev              # browser mode at http://localhost:3000
# -- or --
npm run electron:dev     # full desktop app
```

---

## First Launch

1. **Authenticate Claude** — Run `claude login` in your terminal if you haven't already.
2. **Configure a Provider** — Go to **Settings > Providers** to add API credentials (Anthropic, OpenRouter, Bedrock, Vertex, or custom endpoints).
3. **Create a conversation** — Pick a working directory, select a mode (Code / Plan / Ask), and choose a model.
4. **Set up Assistant Workspace** (optional) — Go to **Settings > Assistant**, choose a workspace directory, and enable Onboarding.
5. **Add MCP servers** (optional) — Go to the **MCP** page in the sidebar to add and manage MCP servers.

---

## Core Capabilities

| Capability | Details |
|---|---|
| Interaction modes | Code / Plan / Ask |
| Providers | Anthropic / OpenRouter / Bedrock / Vertex / custom endpoints |
| MCP servers | stdio / sse / http, runtime status monitoring |
| Skills | Custom / project / global skills |
| Session control | Pause, resume, rewind to checkpoint, archive |
| Split screen | Side-by-side dual sessions |
| Assistant Workspace | soul.md / user.md / claude.md / memory.md, onboarding, check-in |
| Usage analytics | Token counts, cost estimates, daily usage charts |
| Local storage | SQLite (WAL mode), all data stays on your machine |
| Themes | Dark / Light |
| i18n | English + Chinese |

---

## Platform & Installation

| Platform | Format | Architecture |
|---|---|---|
| macOS | .dmg | arm64 (Apple Silicon) + x64 (Intel) |
| Windows | .exe (NSIS) | x64 |

<details>
<summary>macOS: Gatekeeper warning on first launch</summary>

Right-click `DevPilot.app` in Finder > Open > confirm. Or run:

```bash
xattr -cr /Applications/DevPilot.app
```
</details>

<details>
<summary>Windows: SmartScreen blocks the installer</summary>

Click "More info" on the SmartScreen dialog, then "Run anyway".
</details>

---

## Development

```bash
npm run dev                    # Next.js dev server (browser)
npm run electron:dev           # Full Electron app (dev mode)
npm run test                   # Typecheck + unit tests
npm run electron:pack:mac      # macOS DMG
npm run electron:pack:win      # Windows NSIS installer
```

---

## License

[Business Source License 1.1 (BSL-1.1)](LICENSE)

- **Personal / academic / non-profit use**: free and unrestricted
- **Commercial use**: requires a separate license
- **Change date**: 2029-03-16 — after which the code converts to Apache 2.0

Original project: [CodePilot](https://github.com/op7418/CodePilot) © op7418
