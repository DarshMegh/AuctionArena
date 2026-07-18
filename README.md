# 🏏 Auction Arena — IPL 2026 Auction Simulator

Pick one of the 10 real IPL 2026 franchises, build a squad from a ₹125 Cr budget bidding head-to-head against the other 9 (AI-controlled), then pick your Best XI. A full turn-based auction — budget tracking, squad-composition rules, and heuristic AI bidders — running entirely in the browser.

> **Unofficial fan project.** This is a coding/portfolio simulation using real team names and real, publicly known players for fun. It is **not affiliated with, endorsed by, or connected to the BCCI, IPL, or any franchise**. All player ratings, base prices, and auction outcomes are simplified numbers made up for this game — not official statistics or valuations.

![Auction Arena preview](https://via.placeholder.com/900x500/0B1F17/F2B807?text=Auction+Arena+%E2%80%94+IPL+2026+Auction+Simulator)

## Features

- 🏟️ **Pick your franchise** — choose any of the 10 real IPL 2026 teams to play as; the other 9 are controlled by AI
- 💰 **₹125 Cr budget management** — every bid is checked against your remaining budget, squad-size limits, and overseas-player cap before it's allowed
- 🤖 **9 AI bidding opponents** — each values a player by rating, how badly it needs that role, and its remaining budget, with a touch of randomness so no two auctions play out the same way
- 🧑 **250 real players, real descriptions** — the full real IPL 2026 player pool across all 10 franchises (retained + auction buys), each with a role, nationality, rating, and a short description of their playing style
- 📈 **Realistic bid increments** — smaller increments on cheaper players, bigger jumps as the price climbs, the same way real auctions work
- ✅ **Squad validation** — live checklist for squad size, overseas cap, minimum keeper, and balanced bowling/batting options
- 🏆 **Best XI selector** — auto-pick a valid XI respecting role and overseas constraints, or manually toggle players in and out, plus pick a Captain and Vice-Captain
- 📊 **Standings** — compare your spending and squad against all 9 other teams at a glance
- 💻 **100% client-side, no external data** — every player, team, and auction outcome is generated and computed locally, no API calls

## Tech Stack

- Vanilla JavaScript (no framework, no build step)
- A pure, DOM-free auction engine (`auction.js`) — bid increments, budget/roster rule enforcement, heuristic AI bidding, team validation, and a Best XI algorithm, all unit-testable in isolation from the UI
- Google Fonts: [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed), [Inter](https://fonts.google.com/specimen/Inter), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

## Getting Started

```bash
git clone https://github.com/DarshMegh/auction-arena.git
cd auction-arena
open index.html   # or just double-click the file
```

No install, no dependencies, no API calls — everything (players, teams, bidding) is generated and computed locally.

## Deploying to GitHub Pages (free hosting)

1. Push this repo to GitHub.
2. Go to **Settings → Pages** in your repo.
3. Under **Source**, select the `main` branch and `/ (root)` folder, then **Save**.
4. Your app goes live at `https://darshmegh.github.io/auction-arena/` within a minute or two.
5. Update the "Live Demo" link at the top of this README.

## How the AI bidders work

Each bot's willingness to bid on a player is a simple, explainable heuristic — not a trained model:

```
willingness = basePrice + (rating / 100) × 6
```

...then boosted if the bot is short on that role (especially wicketkeepers, since every team needs at least one), and capped by whatever budget and squad-size rules apply. A small random factor means a bot won't bid *every* time it can technically afford to — real auctions have some unpredictability, and this keeps things from feeling mechanical. It's a good, honest example of rule-based AI: transparent, tunable, and easy to explain in an interview, in contrast to a learned/trained model.

## Auction rules (matches real IPL conventions; ratings/prices are simplified for gameplay)

- Budget: ₹125 Cr per franchise
- Squad size: 18–25 players
- Max 8 overseas players per squad, max 4 in the playing XI
- At least 1 wicketkeeper required
- At least 3 batting options and 3 bowling options (all-rounders count toward both)
- Bid increments scale up with price: ₹20L below ₹2 Cr, ₹25L up to ₹5 Cr, ₹50L up to ₹10 Cr, ₹1 Cr beyond that

## Project Structure

```
auction-arena/
├── index.html      # team-select screen + tabs: Auction / My Squad / Best XI / Standings
├── styles.css       # pitch-green + trophy-gold "stadium" theme
├── auction.js        # the auction engine — players, rules, AI bidding, Best XI (DOM-free, unit-testable)
├── app.js             # UI wiring: team selection, rendering, tab switching, event handling
└── README.md
```

## Possible Extensions

- Expand the player pool with more real names for deeper, more realistic squads
- Multiple auction "seasons" with squad retention rules between years
- A trade/swap window after the auction closes
- Difficulty levels for the AI bidders (more aggressive vs. conservative bot profiles)
- Match simulation using the Best XI's aggregate ratings

## License

MIT — free to use, modify, and share.

---

Built as a portfolio project demonstrating rule-based simulation design: constraint enforcement, a turn-based state machine, and explainable heuristic AI opponents.

