# Contributing

Thanks for taking a look at `dsh-multichat`. This is a small, build-free plugin; the most useful contributions are compatibility fixes, accessibility improvements, and carefully scoped layout features.

## Development setup

Requirements:

- DeepSeek Harness `0.2.2-rc.1` or a compatible `0.2.x` release, with the Web UI available (`dsh web` or the desktop app).
- Node.js 20+ for the checks.

Install the checkout without copying it:

1. Open **Plugins → Add plugin → Install a third-party plugin**.
2. Enter the absolute path of this repository (for example
   `C:\Users\me\code\dsh-multichat`).
3. Open an existing conversation and use the split-view button.

The Host links the directory, so edits to `client.js` take effect through HMR;
refresh the page if a revision does not arrive.

## Checks

```bash
npm test
```

`scripts/check.mjs` verifies that:

- `package.json`, `cordis.patch.yml` and the `__ModuleLoader__` bundle id agree on
  the package name;
- locale files parse and expose `meta.title` / `meta.description`;
- the icon exists and is under the 256 KiB manifest limit;
- `client.js` and `index.js` parse;
- the `dsh.bundle` / `dsh.client` manifest sections are present.

`npm publish` runs the same check in `--publish` mode, which additionally
rejects `private: true` and the template `your-github-user` repository URL.

## Manual test checklist

Run through these before opening a pull request:

- [ ] The split-view button appears at the top-right of a conversation with
      messages, and is absent for a blank session.
- [ ] Opening the panel adds the current session; opening another session and
      clicking the button again appends it.
- [ ] `＋ New chat` adds a blank session; the 16th addition disables the button.
- [ ] Dragging a window corner resizes it; the size survives closing and
      reopening the panel; double-clicking the corner resets that window.
- [ ] Close, close all, back to chat, and expand-to-full-conversation all work.
- [ ] Light and dark themes show no unreadable controls.
- [ ] The browser console has no errors (`slot entry crashed`, React warnings,
      unhandled rejections).

## Engineering rules

- Keep the browser half dependency-free. React comes from the Host's module
  table; do not bundle or install React, Harness client packages, or a UI kit.
- Use `--dsw-alias-*` theme tokens. No literal UI colors, so both themes keep
  working.
- Register every resource through `ctx.effect` / `ctx.slots.inject` so unloading
  the plugin removes it.
- Route visible text through the client locale service; keep `zh` and `en`
  dictionaries in sync.
- Do not write Session events. The session log belongs to the Host.
- The plugin deliberately depends on a few Harness client contracts
  (`conversation.content`, `SessionProvider`, the `main` slot, header
  utilities). Document any contract change in the pull request and update the
  compatibility section.

## Pull requests

- Keep changes focused; one behavior per pull request.
- Describe the user-visible result and the Harness version you tested.
- Include a screenshot or recording for visual changes. Redact conversation
  content and personal paths.
- Update `CHANGELOG.md` under `Unreleased` for user-visible changes.

## Release

See [RELEASE.md](RELEASE.md).
