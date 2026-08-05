# Networking Map — Ports, Binds, and Addresses

*Written 2026-08-05. A reference for what runs where, and why the numbers look the way they do.*

---

## The two-layer idea

Two separate things are involved in every URL below:

1. **The app itself** — a Python web server. It listens on a plain local port (7860, 7861, 8765). It knows nothing about Tailscale, HTTPS, or who's allowed in. It just serves pages to whoever connects on that port.
2. **Tailscale** — sits in front and does the parts the app can't: gives you a real hostname instead of an IP, handles HTTPS certificates, and decides who's allowed to reach it (tailnet only, or the whole internet).

So `:443` is not a different server. It's Tailscale's front door forwarding to the app's back door on `:7860`.

**Why not just run the app on 443 directly?** Ports under 1024 require admin privileges — a normal user process can't claim them. And you'd lose the layer that handles certificates and access control; the app would have to do it itself.

**The useful consequence:** the access decision lives *outside* the app. Making the dev lane reachable from a phone was one Tailscale command — the dev server itself didn't change at all. Same code, different door.

---

## Vocabulary

- **Port** — a numbered channel on a machine. One process listens per port.
- **Bind** — a process saying "I'm listening on this address and port." A server bound to `127.0.0.1` (localhost) only accepts connections from its own machine; bound more broadly, other machines can reach it.
- **Tailnet** — the private network Tailscale creates across Matt's devices (Mini, MacBook, phone). Nothing outside it can see tailnet-only addresses.
- **Funnel** — the Tailscale feature that exposes something to the *public internet*. This is the only thing that makes an address reachable by strangers.
- **launchd** — macOS's service supervisor. Keeps production running and restarts it after a crash or reboot.

---

## The map

Hostname for everything below: `matts-mac-mini.taild1f9b7.ts.net`

### Addresses actually typed

| Address | Who can reach it | What it is |
|---|---|---|
| `https://…ts.net/study/` (**:443**) | **Public internet** | Production Voice Tutor. Testers use this. Supervised by launchd. |
| `https://…ts.net:8443/dashboard` | Tailnet only | dev-harness dashboard. Always on. |
| `https://…ts.net:8444/study/` | Tailnet only | Dev lane — temporary, only up during a live check. Tear down when done. |

### Behind the scenes (never typed directly)

| Port | What listens there |
|---|---|
| `:7860` | Production app. `:443` forwards here. |
| `:7861` | Dev server. `:8444` forwards here. |
| `:8765` | Dashboard app. `:8443` forwards here. |

---

## The one rule that matters

**Only `:443` is public. Everything else requires being on the tailnet.**

The `8` prefix on 8443/8444 is just a convention — it carries no meaning and grants no access. What makes something public is **Funnel being enabled for that port**, and Funnel is on for 443 and nothing else.

---

## Practical notes

- **`localhost` means "the machine running the browser."** Opening `localhost:7861` on the MacBook looks for a server on the *MacBook*, not the Mini. To reach the Mini's local-only ports from another machine, either add a tailnet bind (what `:8444` is) or use an SSH tunnel: `ssh -N -L 7861:127.0.0.1:7861 mattli@matts-mac-mini`, then open `http://localhost:7861` locally.
- **The dev lane shares real data with production** — same `~/.voice-tutor/`, same vault. A session started on `:7861` writes real ledger rows, real cost, and real vault artifacts. The worktree isolates *code*, not data.
- **Tear down temporary binds.** `tailscale serve --https=8444 off`. A forgotten bind is a second copy of the app with write access to real data, sitting open on the tailnet.
- **Never restart production without confirming idle.** WebRTC media is UDP, so an active session holds UDP sockets — check those, not just the HTTP log. Restart command: `launchctl kickstart -k gui/$(id -u)/com.voice-tutor.server`.
- **Long-lived tmux servers cache their environment.** A pane opened today can print a stale URL from before a port move. Verified 2026-08-03 when a run banner printed the pre-move `:443` dashboard address.
