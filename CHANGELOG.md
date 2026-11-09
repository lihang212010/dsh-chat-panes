# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-11-09

### Changed

- The npm package is renamed to `dsh-multiwindow` (unscoped). Install
  `dsh-multiwindow`; the previous scoped package is deprecated.
- Chinese is now the default README (`README.md`). The English edition moved to
  `README.en.md`; both files link to each other.

## [0.1.2] - 2026-11-07

### Fixed

- Show the split-view entry on blank sessions. Harness hides the session header
  utilities while a session has no messages, so the plugin now contributes a
  floating top-right button in the header leading seat for that state.

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
