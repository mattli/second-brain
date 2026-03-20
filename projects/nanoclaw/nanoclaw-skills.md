# NanoClaw Skills Priority List

## To Install

### update-nanoclaw
Pull upstream changes into the fork with preview, selective cherry-pick, and safe rollback. Run roughly once a month to stay current with new features and fixes. Does not require any ongoing setup — just run `/update-nanoclaw` in a Claude Code session from the NanoClaw directory.

### add-compact
Adds a `/compact` command for manual context compaction in long-running agent sessions. Not needed for current scheduled tasks (briefing, weekly, monthly) since each run starts fresh. Will become relevant when Phase 2 PM agent is built — multi-step research and generation tasks in a single session can hit context limits.

### add-telegram-swarm
Adds agent teams to Telegram where each subagent gets its own bot identity in the group chat. Directly relevant to Phase 3 agent swarm vision. Worth understanding before building Phase 3 to avoid reinventing something that already exists.

## To Investigate Further

### add-parallel
Not yet documented on the NanoClaw website. Likely enables parallel agent execution. Need to read the SKILL.md in the repo to understand what it actually does before deciding whether to install.

### add-ollama-tool
Adds local AI models (Llama, Gemma, etc.) as tools inside containers. Claude stays as orchestrator but can offload cheaper tasks to local models at zero API cost. Relevant to cost optimization plans but need to understand the tradeoffs before installing.

### add-voice-transcription
Transcribes voice messages automatically using OpenAI Whisper. Would enable hands-free interaction with the agent via Telegram. Worth evaluating whether the workflow improvement justifies the setup.

