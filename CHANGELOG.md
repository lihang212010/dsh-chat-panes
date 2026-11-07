# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-11-07

### Changed

- README (English and Chinese): add the language switcher link and a usage
  guide, so the npm package page documents installation and the split-view
  workflow.

## [0.1.0] - 2026-11-07

### Added

- Multi-chat panel with up to 16 live conversation windows.
- Top-right split-view button in the conversation header.
- Freely resizable windows (drag the bottom-right corner), double-click reset,
  and a toolbar action to reset all pane sizes.
- Native conversation surface per window (hero, transcript, composer,
  approvals, streaming) through the shipped Conversation component factory.
- Expand a window into the full conversation, close a single window, or close
  all windows.
- Chinese and English UI copy, light and dark theme support through DSH theme
  tokens.
- Pane list and per-pane sizes are persisted in the browser's local storage.
