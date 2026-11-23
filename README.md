# CU Lifting — next version

The rebuilt Cleary Baseball 2026-27 lifting app. Same program (every phase, lift, video and coach note) as `cleary-lifting`, with a new night-game design, focus-mode workouts, streaks, XP, weekly capsules, an optional player card, the season map, team pulse/feed/leaderboards and a Hall of Fame.

**Test build:** saves on the phone only (its own storage names, so it can't touch the live app). The sample team stands in until real accounts are connected.

**Switch-over plan:** connect to the same Supabase backend (log format is identical to the old app), add the push-sending function, then copy these files into `cleary-lifting` so players keep the same link and Home Screen icon.

Files: `data.js` program · `core.js` logic · `fx.js` sound/celebrations/share images · `map.js` season map · `app.js` screens · `sw.js` offline + push.
