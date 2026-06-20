# AeroSync — Claude Code Project Memory

## Git workflow (non-negotiable)
- Commit AND push together, every time: `git add -A && git commit -m "<type>: <msg>" && git push origin main`
- Never leave local commits unpushed. Verify with `git log --oneline -1` after every push.
- Conventional commits only: feat/fix/refactor/docs/test/chore/perf/style
- If push fails on auth, STOP and ask the user for a new PAT — do not keep coding on a broken remote.

## Design system (do not deviate without explicit instruction)
- Colors: #000000 bg, #00D4FF cyan accent, #FFB020 amber (delayed), #FF4444 red (critical)
- Fonts: Space Grotesk (headings/body), JetBrains Mono (data, codes, timestamps, labels only)
- Theme: terminal/aviation-ops aesthetic. No glassmorphism, no generic SaaS gradients.

## Domain data
- Indian aviation context: Air India, IndiGo, SpiceJet, Air Asia India
- Airports: DEL, BOM, BLR, MAA, CCU, HYD, PNQ, GOI, JAI, AMD
