# dsh-multichat

**English** | [简体中文](README.zh.md)

[![npm version](https://img.shields.io/npm/v/@lihang212010/dsh-multichat.svg)](https://www.npmjs.com/package/@lihang212010/dsh-multichat)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-lihang212010%2Fdsh--multichat-181717?logo=github)](https://github.com/lihang212010/dsh-multichat)

Run up to **16 live conversations side by side** in the DeepSeek Harness Web GUI.

Open it from the split-view button at the **top-right of the conversation header**, add windows with **＋ New chat**, and drag any window's bottom-right corner to resize it. Every window is the real Harness conversation surface — hero, transcript, composer, approvals and streaming included — not a simplified reimplementation.

![Two chat windows side by side in the dark theme](docs/demo-dark.png)

> Unofficial community plugin. Not affiliated with or endorsed by DeepSeek.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Install](#install)
- [How to use](#how-to-use)
  - [Open the panel](#1-open-the-panel)
  - [Add windows](#2-add-windows)
  - [Add an existing conversation](#3-add-an-existing-conversation)
  - [Work in parallel](#4-work-in-parallel)
  - [Resize windows](#5-resize-windows)
  - [Expand, close, and close all](#6-expand-close-and-close-all)
  - [Everyday workflows](#7-everyday-workflows)
  - [Tips](#8-tips)
- [Troubleshooting](#troubleshooting)
- [Update and uninstall](#update-and-uninstall)
- [How it works](#how-it-works)
- [Compatibility](#compatibility)
- [Privacy](#privacy)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Native chat in every window.** Each window reuses the shipped Conversation component factory (`conversation.content`, embedded variant), so drafts, attachments, tool cards, approvals, streaming and session history behave exactly like the main conversation.
- **Top-right entry, no sidebar clutter.** A single split-view icon appears in the conversation header. Click it to open the panel with the current conversation; open another conversation and click again to add that one to the same split view. Blank sessions get the same entry as a floating button, so you can start working before the first message.
- **Up to 16 windows.** The add button disables itself at 16 and explains why in its tooltip.
- **Free resize.** Drag a window's bottom-right corner to change its width and height; double-click the corner to reset that window. The toolbar's reset action clears every custom size.
- **Open, close, expand, close all.** Close a window without losing its session, or expand a window into the full conversation view.
- **Light and dark themes** through DSH theme tokens, plus Chinese and English UI copy.
- **No telemetry, no network requests.** The plugin only talks to the local Harness UI.

## Requirements

- DeepSeek Harness `0.2.2-rc.1` or a compatible `0.2.x` release. The package declares `engines.dsh`, so the Plugin Manager can refuse an incompatible Host.
- The Harness **Web UI** (desktop app or `dsh web`). This is a browser plugin; it does not apply to `headless` or `tui` profiles.

## Install

### From the Plugin Manager (recommended)

1. Open **Plugins** in the DSH sidebar.
2. Choose **Add plugin** → **Install a third-party plugin**.
3. Enter the package name and confirm:

   ```text
   @lihang212010/dsh-multichat
   ```

4. Open an existing conversation and click the split-view button at the top-right of the header.

The field also accepts an explicit version (`@lihang212010/dsh-multichat@0.1.0`), a Git address, a tarball, or an absolute path to a local checkout.

### From an agent

Ask your DSH agent to install the package with the plugin manager, or run the equivalent `plugin_manager` `install_bundle` action with target `@lihang212010/dsh-multichat`.

### From source

```bash
git clone https://github.com/lihang212010/dsh-multichat.git
```

In the Plugin Manager, choose **Install a third-party plugin** and enter the absolute path of the checkout. The Host links the directory, so edits are picked up without copying files.

## How to use

### 1. Open the panel

1. Open a conversation. Blank sessions work too: the split-view button is shown as a floating entry until the first message.
2. Find the **split-view icon** in the conversation header, at the top-right — it sits next to the `…` menu and the right-sidebar button.
3. Click it. The main area switches to the multi-chat panel and the current conversation becomes the first window.

The panel replaces the center conversation area only. The sidebar, the right sidebar and the session history stay exactly where they were.

### 2. Add windows

- Click **＋ New chat** at the top-right of the panel.
- Each click creates a blank session in the current workspace (or the most recently used workspace) and adds a window for it.
- Windows are appended in order and wrap onto the next row when the panel is full.
- The cap is **16 windows**. At 16 the button is disabled and its tooltip says so.

### 3. Add an existing conversation

1. Click **Back** (the left arrow, next to the add button) to return to the normal conversation view.
2. Open the conversation you want from the sidebar.
3. Click the split-view icon in the header again.

That conversation is appended to the existing split view (if it is already there, nothing is duplicated). Repeat to build a board out of sessions you already have.

### 4. Work in parallel

Each window is an independent conversation:

- Its own composer, draft, attachments and model/permission controls.
- Its own running state, queue, approvals and streaming output.
- Its own workspace chip; a blank window can switch workspace before the first message.

Sending a message in one window does not change the others. The window header shows the live session title, its workspace, and whether the window is the active one.

### 5. Resize windows

- Hover a window and drag the **bottom-right corner**. The handle appears on hover.
- Drag horizontally for width, vertically for height; the minimum is 300 × 220 px.
- **Double-click** the corner to reset that window to its default size.
- The toolbar's **reset sizes** icon clears every custom size at once.
- Sizes persist when you close the panel and reopen it, or refresh the page in the same app session.

Windows use a free-wrap layout. Making one wider may push the following windows onto the next row; that is expected.

### 6. Expand, close, and close all

Each window header has two actions:

| Action | What it does |
| --- | --- |
| **Expand** | Opens that session in the full conversation view and leaves the split view. |
| **Close** | Removes the window. The session stays in the sidebar history. |

The panel toolbar also offers:

| Action | What it does |
| --- | --- |
| **Reset pane sizes** | Drops every custom width and height. |
| **Close all** | Removes all windows and shows the empty state. |
| **Back** | Returns to the regular conversation view. |
| **＋ New chat** | Adds a blank window. |

### 7. Everyday workflows

- **Compare two approaches.** Ask the same question in two windows and read the answers side by side.
- **Keep a reference conversation open.** Pin a spec, plan or notes session in one window while you implement in another.
- **Run independent tasks.** Let one window build while another reviews, without the two transcripts interleaving.
- **Use different models or permissions per task.** Each window keeps its own model and access selection.
- **Assemble a board from history.** Open old sessions one by one and click the header button to add each to the split view.

### 8. Tips

- The current conversation is always the first window; close it if it is not part of the task.
- Closing a window releases the plugin's session retention, which frees memory; the session itself is untouched.
- Prefer 2–4 windows for reading comfort; 16 is a hard cap, not a target.
- Double-click a window's resize corner to restore its default size without touching the other windows.
- Rename a session in the sidebar; the window title follows automatically.

## Troubleshooting

| Symptom | Why | Fix |
| --- | --- | --- |
| The split-view button is missing | The bundle is disabled, the page predates the install, or the Host is incompatible | Check **Plugins** that the bundle is enabled; refresh the page once; verify the Harness version against [Compatibility](#compatibility). |
| **＋ New chat** is disabled | There are already 16 windows, or this Peer may not create sessions | Close a window; check the profile's session-create permission. |
| Windows disappeared after restarting the desktop app | Pane layout is stored in browser `localStorage`, and the desktop app serves the UI from a new local port on each launch, so the origin changes | Recreate the windows; this is a known limitation. |
| A window is too narrow to read | The free-wrap layout keeps a 300 px minimum width | Enlarge the app window, resize the pane, or close some windows. |
| The panel is empty after opening | All windows were closed earlier and the current session was not added automatically | Click **＋ New chat**, or go back to a conversation and use the header button again. |
| `slot entry crashed` in the browser console | A Harness client contract changed | Check the [Compatibility](#compatibility) section and open an issue with the Harness version and console output. |
| Install fails with an `engines.dsh` error | The Harness version is outside the supported range | Upgrade or downgrade Harness, or open an issue for a compatibility release. |

## Update and uninstall

- **Update:** open **Plugins**, find the bundle, and use **Versions → Update** when a newer registry version is available.
- **Disable:** switch the bundle off; the sidebar entry and header button disappear immediately.
- **Uninstall:** remove the bundle from the same page.

## How it works

The package is a normal DSH bundle with a browser half:

- `package.json` declares `dsh.bundle.patch` and `dsh.client` (`platform: web`, `immediately: true`).
- `cordis.patch.yml` inserts the Host row that carries the bundle.
- `client.js` registers:
  - the `main` panel `multichat`, with a session-scoped child slot `multichat.pane`;
  - the `conversation.session.header.utilities` button;
  - one `SessionProvider` per window, bound to a Session reference retained with the `multichat` retention source;
  - the shipped `conversation.content` factory inside each window.

Pane identity and sizes are stored in `localStorage` under `dsh.multichat.panes.v2` (the previous `...v1` key is migrated automatically). The Host owns the session log; the plugin never writes session events.

Because the panel is a global `main` panel, opening it does not disturb the sidebar, the right sidebar, or session history.

## Compatibility

Tested with DeepSeek Harness `0.2.2-rc.1` (client commit `c59d10a`) on Windows desktop, with the `web` bundle.

This plugin intentionally uses a small set of Harness client contracts:

- the `main` keyed slot and its `entryKey` rendering;
- the `conversation.content` Component Factory with the `embedded` variant;
- `SessionProvider` and the `conversation.session.header.utilities` slot;
- `ctx.layout`, `ctx.sessions`, `ctx.uiWorkspace` and `ctx.locale`.

These are internal APIs of the current DSH line. A Harness upgrade may change them; when that happens the plugin needs a matching release. Bug reports with the Harness version and the browser console output are welcome.

## Privacy

- No analytics, telemetry, remote requests or background processes.
- The plugin reads Session data only through the same client services the UI already uses.
- Pane layout is stored locally in the browser origin; deleting site data resets it.
- Conversation content remains in DSH's normal session storage, untouched.

## Development

There is no build step: `client.js` is the browser bundle and `index.js` is the (empty) Host half.

```bash
npm test        # manifest / bundle consistency checks
npm pack --dry-run
```

Local loop:

1. Install the checkout through **Plugins → Add plugin → local directory**.
2. Edit `client.js`.
3. The Host detects the new bundle revision and pushes it to the open page; refresh once if the page does not pick it up.
4. Run through the checklist in [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the development setup, the manual test checklist and the engineering rules. Release steps live in [RELEASE.md](RELEASE.md).

## License

[MIT](LICENSE)
