---
title: "Settings Page Design"
type: feature
status: approved
date: 2026-04-01
origin: projects/dotmd/README.md (Upcoming Features)
---

# Settings Page Design

## Overview

Add a `/settings` page to the dotmd dashboard that lets users edit their configuration (folders, patterns, tracked files) from a single page. Reuses the same UI components as the setup wizard but renders everything on one page instead of a step-by-step flow.

## Problem

After initial setup, users must hand-edit `~/.dotmd/config.yaml` to add/remove folders or patterns. The setup wizard exists but is designed for first-time use, not ongoing configuration.

## Design

### Route

`/settings` — accessible from the main nav bar alongside Files and Timeline.

### Layout

Single page with three stacked sections:

1. **Folders** — Chips for current `scan_roots` from config, pre-selected. Suggested roots that aren't in the current config shown as deselected chips. "Browse for folder..." button opens the same folder browser from the wizard.

2. **Patterns** — Chips for current `patterns` from config, pre-selected. Suggested patterns not in config shown as deselected. Custom text input to add arbitrary patterns.

3. **File Preview** — Auto-updates whenever folders or patterns change. Calls `POST /api/setup/discover` with current selections on each change. Shows discovered files grouped by category (Global, Memory, Projects, Other) with checkboxes. Debounced at 300ms so rapid chip clicks don't spam the server.

### Save Behavior

- "Save" button at the bottom of the page
- Calls `POST /api/setup/confirm` with roots, patterns, and excluded files
- Re-scans on save (scan is fast, milliseconds for typical file sets)
- Success shows a brief inline confirmation message — user stays on the settings page
- No page redirect (unlike the wizard which goes to a completion page)

### Nav Change

Add "Settings" link to the nav bar in `layout.ts`, after "Timeline".

### Existing Wizard

Untouched. `/setup` continues to work for first-time users who have no config file.

## Files

| File | Action | Purpose |
|------|--------|---------|
| `src/dashboard/settings.ts` | Create | HTML rendering for the settings page |
| `src/dashboard/settings-client.ts` | Create | Client-side JS: chip toggling, folder browser, auto-refresh preview, save |
| `src/dashboard/server.ts` | Edit | Add `GET /settings` route |
| `src/dashboard/layout.ts` | Edit | Add "Settings" to nav bar |

## Scope Boundaries

- No changes to the setup wizard
- No changes to the config format or storage
- No new API endpoints — reuses existing `/api/setup/discover`, `/api/setup/confirm`, `/api/setup/browse`
- No changes to the scanner or snapshot system

## Client-Side Behavior

- Chip toggling: same click-to-toggle pattern as the wizard
- Folder browser: same browse/navigate/add pattern as the wizard
- Custom pattern input: same add-by-typing pattern as the wizard
- Auto-refresh: on any change (chip toggle, folder add/remove via browser, pattern add/remove via input), debounce 300ms then call `/api/setup/discover` and re-render the file preview section
- Save: POST to `/api/setup/confirm`, show inline success/error, no redirect
