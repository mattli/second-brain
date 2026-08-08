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

Three-line layout — **directory on top, the (unavoidable) topic in the middle, status on the bottom:**

```
second-brain          ← line 1: directory   (our OSC title)
<session topic>       ← line 2: tab title    (forced in by Ghostty — see gotcha #6)
✅ Done               ← line 3: status       (our OSC body)
```

- Line 1 `<project>` / line 3 **`✅ Done`** — fires on the `Stop` event (every time Claude finishes a turn).
- Line 1 `<project>` / line 3 **`❓ Needs you`** — fires on the `Notification` event (permission prompts / waiting for input).

Edit the `title=` (directory line) and `body=` (status line) values in the script to change wording.

**What we settled for and why:** the ideal was directory + topic *merged onto one line* with status below, but that's not reachable — Ghostty renders the topic as its own separate row and the script has no access to the topic's text to combine it (gotcha #6). So directory and topic sit on adjacent lines instead. Rejected along the way: a fixed `Claude Code` title (redundant), and cramming `directory · status` onto one line (put status too far from where the eye lands). Settled 2026-07-20.

## Gotchas discovered while building this (the non-obvious parts)

1. **Hooks have no controlling terminal.** The obvious approach — write the escape sequence to `/dev/tty` — fails silently: Claude Code spawns hook processes without a controlling tty, so `/dev/tty` can't be opened. **Fix:** the script walks *up the process tree* to the `claude` process (which *is* attached to a real tty) and writes there instead.

2. **Ghostty focus-gates notifications.** It only shows the notification when its window is **unfocused**. If I'm actively watching the terminal, nothing pops — which is actually ideal (pings me only when I've tabbed away). This was the source of "it worked earlier but not now" confusion during setup: the difference was window focus, not the code.

3. **tmux blocks passthrough by default.** For the escape sequence to reach the outer terminal through tmux, tmux needs `set -g allow-passthrough on` (already set here — tmux 3.7b) and the sequence must be wrapped in the tmux passthrough DCS (`\033Ptmux;…\033\\`) with inner ESC bytes doubled. The script auto-detects `$TMUX` and wraps only when inside tmux, so it works both in and out of tmux.

4. **Do Not Disturb suppresses it.** The app that raises the notification is **Ghostty**, not "Claude Code" (there's no Claude Code app on the MacBook). To get pings through a Focus/DND mode, allow **Ghostty** in System Settings → Focus → (mode) → Allowed apps.

5. **Built-in channel turned off to avoid duplicates.** Claude Code has a native `preferredNotifChannel: "ghostty"` setting, but it's focus-gated and its message isn't customizable. Since the custom hooks now own both notifications, `preferredNotifChannel` is set to `"notifications_disabled"` so the built-in doesn't double-fire alongside the custom `Notification` hook. **Revert:** set it back to `"ghostty"` if the custom input notification ever goes silent.

6. **Ghostty forces the tab title in as a middle subtitle — and it can't be turned off.** Every OSC 777 (and OSC 9) notification gets a middle line showing the terminal's tab title, which Claude Code sets to the session topic (e.g. "Set up Claude Code completion notifications"). Confirmed 2026-07-20 there is **no escape**: no Ghostty config toggles it ([open, unimplemented feature request — Ghostty #10186](https://github.com/ghostty-org/ghostty/discussions/10186)), OSC 9 behaves the same, and Claude Code has no documented way to stop setting the tab title. Blanking the title from the `Stop` hook doesn't work either — Claude Code re-writes the topic before Ghostty snapshots the notification (race). And overwriting the tab title would destroy the topic labels I *use* to tell my two tabs apart. **Decision:** accept the topic middle line, and merge project + status onto one title line above it (`second-brain · ✅ Done`) so our content stays together. If Ghostty ever ships the `no-pwd`/`no-subtitle` option from #10186, revisit — a two-field title/body layout would then look cleaner.

7. **The `Notification` event is dual-purpose — it also fires an idle reminder, not just permission prompts.** Claude Code emits a `Notification` event in *two* situations: (a) a real permission prompt is waiting, and (b) Claude has been idle ~60s waiting for input after a turn ended. Both look identical to the hook. The naïve wiring — `Notification` → always ping "❓ Needs you" — therefore nags "Needs you" when nothing actually needs you: you already got the `Stop` hook's "✅ Done", then the idle reminder fires 60s later as a redundant "Needs you". **Fix (built 2026-07-20):** the `input` branch of `notify-done.sh` now reads the hook's stdin JSON and drops the message when it contains `waiting for your input`, so only genuine permission prompts ping. The message field is what distinguishes them — permission prompts read like `Claude needs your permission to use Bash`, the idle one reads `Claude is waiting for your input`. This is a script-body-only change, so **no `/hooks` reload** (per the maintenance note below). If a future notification type needs surfacing, branch on its message string the same way rather than pinging on every `Notification`.

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
