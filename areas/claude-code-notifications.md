# Claude Code Finish Notifications

Desktop notifications on my **MacBook Pro** when Claude Code (running on the **Mac Mini**, which I SSH into) finishes a task or needs my input. Built 2026-07-20.

## The problem

I run Claude Code on the Mac Mini over SSH, usually inside Ghostty + tmux from my MacBook. When a long task finishes I want a native macOS notification **on the MacBook** — but Claude Code and its hooks run on the *Mini*, so a notification raised there is invisible to me.

## The mechanism

The only thing continuously connecting the two machines is the terminal session itself. So the notification travels **back up the wire**:

```
Claude Code (Mac Mini) emits an OSC 777 escape sequence
  → back over SSH (the pty)
  → through tmux (if present)
  → to Ghostty on the MacBook
  → Ghostty raises a native macOS notification
```

No push service, no reverse SSH, no extra network setup. Ghostty natively understands the [OSC 777](https://ghostty.org) desktop-notification escape sequence.

## The pieces

| File | Role |
|------|------|
| `~/.claude/notify-done.sh` | Does the work: finds the terminal, emits the OSC 777 notification. Takes a mode arg (`done` \| `input`). |
| `~/.claude/settings.json` | Two hooks wired to the script: `Stop` → `notify-done.sh` (done), `Notification` → `notify-done.sh input`. |

Both live in `~/.claude/` on the **Mac Mini only** (see sync note below).

### The two notifications

Everything rides on a **single title line** — `<project> · <status>`:

- **`<project> · ✅ Done`** — fires on the `Stop` event (every time Claude finishes a turn).
- **`<project> · ❓ Needs you`** — fires on the `Notification` event (permission prompts / waiting for input).

Edit the `title=` lines in the script to change wording. The `body` is deliberately left empty (see the forced-subtitle gotcha below).

**Why a single line, not title + body:** Ghostty forces a middle subtitle into every notification (see gotcha #6), so a two-field `title`/`body` layout gets a third line (the session topic) wedged between them. Keeping our content on one title line puts the useful info together, above the unavoidable topic line.

## Gotchas discovered while building this (the non-obvious parts)

1. **Hooks have no controlling terminal.** The obvious approach — write the escape sequence to `/dev/tty` — fails silently: Claude Code spawns hook processes without a controlling tty, so `/dev/tty` can't be opened. **Fix:** the script walks *up the process tree* to the `claude` process (which *is* attached to a real tty) and writes there instead.

2. **Ghostty focus-gates notifications.** It only shows the notification when its window is **unfocused**. If I'm actively watching the terminal, nothing pops — which is actually ideal (pings me only when I've tabbed away). This was the source of "it worked earlier but not now" confusion during setup: the difference was window focus, not the code.

3. **tmux blocks passthrough by default.** For the escape sequence to reach the outer terminal through tmux, tmux needs `set -g allow-passthrough on` (already set here — tmux 3.7b) and the sequence must be wrapped in the tmux passthrough DCS (`\033Ptmux;…\033\\`) with inner ESC bytes doubled. The script auto-detects `$TMUX` and wraps only when inside tmux, so it works both in and out of tmux.

4. **Do Not Disturb suppresses it.** The app that raises the notification is **Ghostty**, not "Claude Code" (there's no Claude Code app on the MacBook). To get pings through a Focus/DND mode, allow **Ghostty** in System Settings → Focus → (mode) → Allowed apps.

5. **Built-in channel turned off to avoid duplicates.** Claude Code has a native `preferredNotifChannel: "ghostty"` setting, but it's focus-gated and its message isn't customizable. Since the custom hooks now own both notifications, `preferredNotifChannel` is set to `"notifications_disabled"` so the built-in doesn't double-fire alongside the custom `Notification` hook. **Revert:** set it back to `"ghostty"` if the custom input notification ever goes silent.

6. **Ghostty forces the tab title in as a middle subtitle — and it can't be turned off.** Every OSC 777 (and OSC 9) notification gets a middle line showing the terminal's tab title, which Claude Code sets to the session topic (e.g. "Set up Claude Code completion notifications"). Confirmed 2026-07-20 there is **no escape**: no Ghostty config toggles it ([open, unimplemented feature request — Ghostty #10186](https://github.com/ghostty-org/ghostty/discussions/10186)), OSC 9 behaves the same, and Claude Code has no documented way to stop setting the tab title. Blanking the title from the `Stop` hook doesn't work either — Claude Code re-writes the topic before Ghostty snapshots the notification (race). And overwriting the tab title would destroy the topic labels I *use* to tell my two tabs apart. **Decision:** accept the topic middle line, and merge project + status onto one title line above it (`second-brain · ✅ Done`) so our content stays together. If Ghostty ever ships the `no-pwd`/`no-subtitle` option from #10186, revisit — a two-field title/body layout would then look cleaner.

## Editing / maintenance

- **Message wording** (`title`/`body` in `notify-done.sh`): edit freely, **no reload needed** — the hook command doesn't change, only the script it calls.
- **Hook wiring** (adding/removing hooks, changing the `command` in `settings.json`): needs a **`/hooks` reload** (open the `/hooks` menu once) or a Claude Code restart, because Claude Code doesn't always hot-reload hook *command* changes mid-session.
- Review or disable the hooks anytime via `/hooks`.

## Cross-machine sync

This setup lives entirely in `~/.claude/` on the **Mac Mini**, which is **not synced** to the MacBook (consistent with the findings in [[claude-code-skills]] — nothing replicates `~/.claude/` between machines today). It doesn't need to be: the MacBook is where I *view* notifications, not where Claude Code runs. If I ever run Claude Code locally on the MacBook and want the same pings, I'd copy `notify-done.sh` and the two hooks there too. Eventual dotfiles-repo sync would handle this surgically.

## Ideas not yet built

- Clock time / elapsed duration in the message.
- Distinct sound per notification type.
- Richer "needs input" text (the actual permission being requested — available in the `Notification` hook's stdin JSON).
