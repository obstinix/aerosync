# AeroSync — Agent Rules

## Git Identity & Credentials
- Git identity: obstinix / obstinix@gmail.com
- Every task: `git add -A && git commit -m "<type>: <msg>" && git push origin main` — chained, immediately.
- If push fails on auth, stop and ask the user for a new PAT (https://github.com/settings/tokens/new, repo scope) — do not keep coding on a broken remote.

## Design System
- Theme: #000000 bg, #00D4FF cyan, #FFB020 amber, #FF4444 red.
- Fonts: Space Grotesk + JetBrains Mono. No deviation.
- Terminal / aviation-ops aesthetic. No glassmorphism.

## Subagent/Handoff Rules
- Full autonomy. No confirmation prompts, no asking permission.
