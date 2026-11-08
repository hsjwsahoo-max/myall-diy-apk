# NEXUSTRADE — PHASE 1: COMPLETE VISUAL FIDELITY AUDIT REPORT

**Document ID:** `VISUAL_AUDIT_REPORT.md`  
**Phase:** Phase 1 — Audit Only (Zero Source Code Modifications)  
**Target Reference:** Supplied Binance Mobile Application Recording (`Screen_Recording_20261108_013428_Binance.mp4`, `00:00`–`02:15`)  
**Current Implementation:** Supplied NexusTrade Application Recording (`Screen_Recording_20261108_013739_Chrome.mp4`, `00:00`–`00:19`) & Existing Source Code (`src/*`)  
**Brand Constraint:** Retain independent **NexusTrade** branding (`NexusTrade`, `Nexus Support`, `Nexus Pay`, `Nexus Earn`) and preserve all underlying functionality while achieving visual, structural, and typographic parity with the reference mobile experience.

---

## 1. OVERALL VISUAL ASSESSMENT

### 1.1 Executive Summary
NexusTrade already possesses a comprehensive functional architecture—including live WebSocket market tickers, SQLite-backed ledger state, spot/futures order books, Black-Scholes options chains, convert/swap flows, and Web3 wallet state. However, when compared frame-by-frame against the reference recording, **several critical visual and structural divergences prevent NexusTrade from looking like a consumer-grade mobile exchange and Web3 wallet:**

1. **Developer Telemetry & Audit Banner Clutter (Critical):** Nearly every screen in NexusTrade injects non-reference system telemetry banners, provenance badges (`LIVE WS`, `LIVE`, `REF`, `SQLite Ledger / Persistent Sync Active`, `Demo Spot Ledger · 0.10% Fee`, `Demo USDⓈ-M Derivatives Ledger`, `Self-Custody Web3 Vault`), and sandbox debug toolbars directly into the primary viewport. The reference interface is completely free of system diagnostics, status badges, and instructional disclaimers.
2. **Exchange Assets Screen Structural Mismatch (Critical):** In the reference (`00:29`–`00:32`, `01:47`–`01:50`), the Exchange **Assets -> Overview** screen is a sleek consumer portfolio view featuring `Overview | Spot | Futures` tabs, `Est. Total Value ₹0.00`, a smooth yellow (`#F0B90B`) portfolio line chart with `1D | 7D | 1M | 6M | 1Y` pills, compact recent transaction status tickers (`Crypto withdraw 5.62 USDT Completed >`), and a `Crypto` card listing `USDT`, `XRP`, and `USD1` with APR badges and `Add Funds` buttons. In NexusTrade (`src/screens/AssetsScreen.tsx`, Video 1 `00:06`–`00:08`), it renders a developer-style ledger console with 3 debug buttons, 3 USDT accounting boxes, a candlestick chart, and a 6-month ledger table.
3. **Spot Trading Viewport Prioritization & Default Pair (Critical):** In NexusTrade (`src/screens/TradeScreen.tsx`, Video 1 `00:03`), opening `Trade -> Spot` defaults to `USDT/USD` (a stablecoin pair) and renders an expanded `265px` candlestick chart + warning banner at the top, pushing the actual 2-column Spot Order Form and Live Order Book below the fold. In the reference (`00:17`), `Spot` opens directly to `BTC/USDT` with the 2-column Order Ticket (left) and Live Order Book (right) immediately visible at the top of the screen, and the candlestick chart is accessed via the mini candlestick icon in the pair header.
4. **Web3 Wallet Home & Web3 Assets Overhaul Required (Critical):**
   - **Web3 Home (`00:36`–`00:45`, `02:00`–`02:12`):** The reference displays `My Wallet > [Copy]`, `₹527.89` balance with a yellow `Receive` button on the right, a smooth yellow portfolio line chart with `1D | 7D | 30D` tabs, 5 shortcut icons (`Alpha`, `Stocks`, `DeFi`, `Referral`, `More`), a 3-slide promo banner carousel, `Tracker` / `Earn` 2-column bento cards, and an on-chain `Holdings | Trending | Stocks | Perps` list (`FLOAT`, `José`, `STONK`, `STANK`, `HYPE`) with chain badges. NexusTrade hides the balance/chart behind a `"Self-Custody Web3 Vault"` connection box.
   - **Web3 Assets (`00:55`–`01:25`, `02:14`–`02:15`):** The reference displays a dynamic `"Assets"` header, `My Wallet >` + green Pie/Portfolio icon (which opens the **Portfolio Donut Chart** screen at `01:02`–`01:09`), `₹527.89` balance, 4 icon buttons (`Send`, `Receive`, `History`, `Approvals`) that open clean full-screen native views (`01:13`–`01:23`), a `"Hold tokens to earn rewards Up to 5.00% APR"` card, `Tokens | Stocks | DeFi | NFTs | Perps` tabs, the `USDT` (`5.62` / `₹527.89`) row, and a collapsible `Low value (5)` accordion (`BNB`, `ETH`, `SOL`). NexusTrade (`Video 1 00:13`–`00:19`) instead renders a technical EIP-1193/Solana wallet connection manager.
5. **P2P Express Numpad & Markets "For You" Curated Feed Missing (High):**
   - Reference `Trade -> P2P` (`00:20`–`00:22`) opens in **P2P Express** mode (`Express | P2P | Block Trade`) with a `Buy | Sell` pill toggle, `0 INR ▾` large display, `Lightning UPI` selector, preset pills (`₹400`, `₹2K`, `₹10K`, `₹20K`), a 3×4 numeric keypad, and a P2P bottom bar.
   - Reference `Markets -> For You` (`00:13`) displays `Smart Tracker - Mine` (`TRUMP -5.09% Pullback`), `Master Trades` (3-column institutional holdings), and `Indices` (`TRUMP FLAT` inflow/outflow bar + 3-ticker strip).
6. **Surface, Border, and Control Token Discrepancies (High):** NexusTrade frequently uses `border border-[#2B3139]` on cards and nested inner boxes (`bg-[#202630] border border-[#2B3139]`), creating a "boxed-in" wireframe look. The reference uses borderless flat dark cards (`#1E2329` or `#202630` on `#181A20`) separated by clean vertical spacing (`8px`–`12px`) or ultra-subtle `1px` hairlines.

---

## 2. PART A: REFERENCE RECORDING SCREEN-BY-SCREEN ANALYSIS

Below is the chronological, timestamp-verified breakdown of every screen and interaction in the reference recording (`00:00`–`02:15`):

### A.1 Global App Shell (`00:00`–`02:15`)
- **Top Header (`h-11` / `44px`, `px-4`):**
  - **Exchange Mode (`00:00`–`00:32`, `01:29`–`01:50`):**
    - **Left:** Hamburger menu icon (`20px`, `#EAECEF`) with a small `#F0B90B` notification dot on top-right + Customer Support headset icon (`20px`, `#EAECEF`) spaced `16px` apart.
    - **Center:** `Exchange | Wallet` segmented control (`h-8`, `bg-[#202630]`, `rounded-lg`, `p-0.5`, no border). Active tab has `bg-[#2B3139]` (or `#333B47`), `text-[#EAECEF] text-[13px] font-semibold px-3.5`; inactive tab has `text-[#848E9C] text-[13px] font-medium px-3.5`.
    - **Right:** Chat/Message bubble icon with small yellow dot + Pay/QR-Scan icon (`20px`, `#EAECEF`). *(Note: hidden on Trade, Futures, and Assets tabs where screen-specific headers take over).*
  - **Wallet Mode — Home, Markets, Trade, Discover (`00:35`–`00:52`, `01:55`–`02:12`):**
    - **Left:** Hamburger menu icon (with yellow dot) + Headset icon.
    - **Center:** `Exchange | Wallet` segmented control (`Wallet` active).
    - **Right:** Gift/Rewards box icon + Chat/Notification bubble icon (with yellow dot).
  - **Wallet Mode — Assets Tab (`00:53`–`01:01`, `02:13`–`02:15`):**
    - Top header dynamically transforms: **Left:** Hamburger menu icon (with yellow dot); **Center:** Title `"Assets"` (`text-[17px] font-semibold text-[#EAECEF]`); **Right:** Shield-Check security icon + Wallet-Settings icon. (When in sub-selector mode at `01:24`, displays `[Wallet icon] My Wallet ▾` on left and `All Wallets ▾` pill on right).
- **Bottom Navigation Bar (`h-[54px]`, `bg-[#181A20]`, `border-t border-[#2B3139]/60`):**
  - **Exchange Mode (5 Tabs):** `Home`, `Markets`, `Trade`, `Futures`, `Assets`.
  - **Wallet Mode (5 Tabs):** `Home`, `Markets`, `Trade`, `Discover`, `Assets`.
  - **Icon & Label Styling:** Icons are `20px–22px`; labels are `10px` (`font-medium`). Active tab label is `#EAECEF` (crisp white); inactive tab label is `#848E9C`. Active icons use a two-tone light-gray + yellow (`#F0B90B`) accent fill—**not** a giant solid yellow circle background. When `Trade` is active (`00:14`–`00:23`), its icon is a circular outline containing two horizontal swap arrows with a yellow inner accent.

### A.2 Exchange Home Screen (`00:00`–`00:12`, `01:29`–`01:40`)
- **Search Bar (`00:05`, `00:08`, `01:30`):** Full-width `h-9 rounded-xl bg-[#202630] px-3 flex items-center justify-between`. Left: magnifying glass icon (`#848E9C`) + rotating hot query (`"🔥 BTC is trending now"` / `"Alphabet Apple AI focus"`). Right: QR scanner icon (`#848E9C`).
- **Onboarding Tasks Card (`00:00`, `00:04`–`00:09`):**
  - Rendered directly below the search bar when user balance is `0`.
  - Container: `bg-[#1E2329] rounded-2xl p-4` (no visible heavy border).
  - Top row: `Onboarding Tasks 3/3` (`text-xs text-[#848E9C]`) on left; 3 horizontal progress bars (`w-4 h-1 rounded-full bg-[#F0B90B]`) on right.
  - Headline: `"Start Your First Trade"` (`text-[18px] font-bold text-[#EAECEF] mt-1 mb-3`).
  - Primary CTA: Full-width bright yellow button `"Trade"` (`h-10 rounded-lg bg-[#FCD535] text-[#181A20] font-semibold text-sm`).
  - Divider: `border-t border-[#2B3139]/60 my-3`.
  - Bottom tutorial row: Green/yellow book illustration icon (`w-7 h-7`) + `"Spot Trading Explained: A Beginner's Guide"` (`text-xs text-[#EAECEF] leading-snug flex-1`) + dark pill button `"Go"` (`bg-[#2B3139] text-[#EAECEF] text-xs font-medium px-3 py-1.5 rounded-lg`).
- **Convert Widget Card (`00:00`–`00:04`, `00:10`):**
  - Single unified card (`bg-[#1E2329] rounded-2xl p-4`).
  - Header: `"Convert >"` (`text-[15px] font-bold text-[#EAECEF]`). No `"Zero Fee"` label on the right.
  - `From` section (flat inside the card, no nested box): Top row `From` (`text-xs text-[#848E9C]`) on left, `Available 0 USDT` (`text-xs text-[#848E9C]`) on right. Bottom row: `[USDT icon] USDT ▾` (`text-base font-bold text-[#EAECEF]`) on left, `> 0.01` (`text-lg font-semibold text-[#474D57]`) on right.
  - Center separator: Thin horizontal line (`border-[#2B3139]`) with a centered circular/rounded-lg swap icon button (`w-7 h-7 bg-[#2B3139] text-[#848E9C]`).
  - `To` section (flat inside the card): Top row `To` (`text-xs text-[#848E9C]`). Bottom row: `[BTC icon] BTC ▾` on left, `> 0.00000013` (`text-lg font-semibold text-[#474D57]`) on right.
  - Bottom button: Full-width dark button `"Convert"` (`h-10 rounded-lg bg-[#2B3139] text-[#EAECEF] text-sm font-semibold mt-3`).
- **2-Column Bento Grid: Earn & BNB Sparkline (`00:00`–`00:04`, `00:11`):**
  - `grid-cols-2 gap-2.5`.
  - **Left Card (`Earn >`):** `bg-[#1E2329] rounded-2xl p-3.5`. Header `"Earn >"` (`text-[15px] font-bold`). Lists two coins vertically:
    1. `[USDC icon] USDC` with `APR 9.14%` (`9.14%` in `#0ECB81`).
    2. `[U icon] U` with `APR 8.15%` (`8.15%` in `#0ECB81`).
  - **Right Card (`BNB >`):** `bg-[#1E2329] rounded-2xl p-3.5 flex flex-col justify-between`. Top row: `[BNB icon] BNB >`. Middle: Large price `697.09` (`text-[19px] font-bold text-[#EAECEF] tabular-nums`), with `▲ 0.36%` (`text-xs font-semibold text-[#0ECB81]`) directly below the price. Bottom: Smooth green sparkline with subtle gradient fill.
- **Stocks Card (`00:01`–`00:03`, `00:11`):**
  - Container: `bg-[#1E2329] rounded-2xl p-4`.
  - Header row: `Stocks` (`text-[15px] font-bold text-[#EAECEF]`) on left; `Last Price` and `Change(%)` (`text-xs text-[#848E9C]`) on right.
  - 3 Stock rows (`NVDA`, `MU`, `AMD`):
    - Left: Circular logo (`32px`) + Symbol (`NVDA`, `text-[15px] font-bold text-[#EAECEF]`, no `"Stock"` badge pill) + truncated company name below (`NVIDIA Corporation...`, `text-xs text-[#848E9C]`).
    - Middle (right-aligned): USD price (`188.72`, `694.77`, `448.09` in `text-[15px] font-semibold text-[#EAECEF] tabular-nums`) + INR fiat equivalent below (`₹17,749.21`, `₹65,343.02`, `₹42,142.96` in `text-[11px] text-[#848E9C] tabular-nums`).
    - Right: Green percentage badge (`+3.93%`, `+5.76%`, `+10.64%` in `bg-[#0ECB81] text-white font-semibold text-xs w-[72px] h-7 rounded-md flex items-center justify-center`).
- **Social / Square Feed (`00:02`, `00:11`):**
  - Immediately follows the `Stocks` card (there is **no** second Market Watchlist card between `Stocks` and `Discover`).
  - Sticky horizontal tab bar: `Discover` (active, bold `#EAECEF` with short `w-4 h-[3px] bg-[#F0B90B]` bottom bar) | `Following` | `Stocks` | `Leaderboard` | `Announcements` | `News`.
  - Feed post item: Author avatar + `Crypto Master 786` + verified badge + `Nov 7` + `...` menu, post body copy, and embedded token performance card.

### A.3 Exchange Markets Screen (`00:13`)
- **Top Search Bar:** Full-width `bg-[#202630] h-9 rounded-xl px-3` with `"Search coins and trends"` placeholder + `...` icon outside on the right.
- **Primary Category Tabs:** `For You` (active `#EAECEF font-bold`), `Favorites`, `Crypto`, `TradFi`, `Alpha`, `Square`/`Data`. Clean text tabs without a `"LIVE WS"` badge or refresh button on the right.
- **`For You` Tab Content (`00:13`):**
  1. **Smart Tracker - Mine (`bg-[#1E2329] rounded-2xl p-4`):**
     - Header: `"Smart Tracker - Mine"` on left, `"Nov 7 04:30:21 Triggered >"` on right.
     - Token row: `[TRUMP icon] TRUMP` + `"Pullback"` tag + `-5.09%` (`text-[#F6465D] font-bold`) on left; mini red sparkline with yellow event marker dot on right.
     - Insight pill (`bg-[#202630] rounded-lg px-3 py-2 mt-2`): `"⚡ The price rose notably before falling back, indica... >"`.
  2. **Master Trades (`mt-4`):**
     - Section title: `"Master Trades >"` (`text-base font-bold text-[#EAECEF] mb-2.5`).
     - 3-column horizontal card grid (`grid-cols-3 gap-2`):
       - Card 1: `John Rogers Ho...` (`MSGE --`, `OSW --`).
       - Card 2: `Prem Watsa Hol...` (`EGO --`, `KHC --`).
       - Card 3: `Peltz Hold...` (`GE +2.70%` in green, `SOLV --`).
  3. **Indices (`mt-4`):**
     - Section title: `"Indices >"` (`text-base font-bold text-[#EAECEF] mb-2.5`).
     - Main card (`bg-[#1E2329] rounded-2xl p-4`):
       - Header: `[Icon] TRUMP` + `FLAT` badge (`bg-[#2B3139] text-[#848E9C] text-[10px] px-1.5 py-0.5 rounded`).
       - Dual progress bar: Green left bar (`Inflow: 5.56M TRUMP`) vs Red right bar (`Outflow: 5.48M TRUMP`).
       - Bottom 3-column mini ticker strip (`pt-3 border-t border-[#2B3139]/60`):
         - `TRUMP` `1.183` `-3.66%` (red)
         - `BNB` `697.09` `+0.36%` (green)
         - `BTC` `75,805` `-0.18%` (red)

### A.4 Exchange Trade Screen (`00:14`–`00:23`)
- **Top Mode Navigation (`00:14`, `00:17`, `00:18`):**
  - Left-aligned horizontal tabs: `Convert` | `Spot` | `Stocks` | `P2P` | `Alpha`. Active tab is `text-[18px] font-bold text-[#EAECEF]`; inactive tabs are `text-[15px] font-medium text-[#848E9C]`. Far right: Hamburger menu icon (`#848E9C`).
- **Mode 1: Convert (`00:14`–`00:16`):**
  - Top Promo Strip (`bg-[#202630] rounded-xl px-3 py-2`): `[Coin icon] Explore SIP From $0.1 and Zero Fees >`.
  - Sub-mode bar: `Instant` (active pill `bg-[#2B3139] text-[#EAECEF] px-3 py-1 rounded-lg text-xs font-semibold`), `SIP`, `Limit` on left; Chart/Candlestick icon + Order-History icon on right.
  - `From` Card (`bg-[#202630] rounded-2xl p-4`): Top row `From` on left, `[Wallet icon] 0 USDT (+)` (`+` in yellow circle) on right. Bottom row `[USDT icon] USDT ▾` on left, `> 0.01` (`text-xl font-semibold text-[#474D57]`) on right.
  - Center Swap Button: Overlapping `w-9 h-9 rounded-xl bg-[#2B3139] border-4 border-[#181A20]` with vertical `⇅` arrows.
  - `To` Card (`bg-[#202630] rounded-2xl p-4`): Top row `To` on left. Bottom row `[BTC icon] BTC ▾` on left, `> 0.00000013` on right.
  - Bottom CTA: Full-width button `"Preview"` (`h-12 rounded-xl bg-[#655A24] text-[#848E9C] font-bold` when empty, `#FCD535 text-[#181A20]` when amount entered).
- **Mode 2: Spot (`00:17`):**
  - Top Campaign Ticker (`bg-[#2D2618] text-[#F0B90B] text-xs px-3 py-1.5 flex items-center justify-between`): `"🔥 Hot Campaign: Binance Launches Limited-Time Spot Ta... [x]"`. *(Use `"NexusTrade Launches Limited-Time Spot Zero-Fee Campaign"`).*
  - Pair Bar (`py-2.5 px-4`): Left `BTC/USDT ▾` (`text-[18px] font-bold text-[#EAECEF]`) + `-0.19%` (`bg-[#F6465D]/15 text-[#F6465D] text-xs px-1.5 py-0.5 rounded`). Right: Mini Candlestick Chart icon, Bot/Grid icon, `...` menu icon.
  - **2-Column Split Main Area (`px-4 gap-3`):**
    - **Left Column (~56% width — Order Ticket):**
      - Top row: `Buy` (active `#0ECB81` angled right edge) / `Sell` (`#202630` dark background) toggle + `Margin [switch]` above right.
      - Order Type Selector: `bg-[#202630] h-9 rounded-lg px-3` with `(i)` info icon on left, centered `Market`, `▾` on right.
      - Amount/Total Input: `bg-[#202630] h-10 rounded-lg px-3` with `Total` label and `USDT ▾` selector.
      - Slider / Stepper: 4-node diamond percentage bar (`0%`, `25%`, `50%`, `75%`, `100%`).
      - Checkbox row: `[ ] Slippage Tolerance` (`text-xs text-[#848E9C]` underlined dashed).
      - Metrics rows (`text-[11px] space-y-1`):
        - `Avbl` — `0 USDT (+)` (yellow `+` circle)
        - `Max Buy` — `-- BTC`
        - `Est. Fee` — `-- BTC`
      - Primary Action Button: Full-width `h-10 rounded-lg bg-[#0ECB81] text-white font-bold text-sm` (`"Buy BTC"`).
    - **Right Column (~44% width — Live Order Book):**
      - Header: `Price (USDT)` on left, `Amount (BTC)` on right (`text-[10px] text-[#848E9C]`).
      - 5 Ask Rows (red `#F6465D` prices `75,798.55` down to `75,798.47`, right-aligned BTC amounts `0.00534`, `1.28172`, with subtle red right-anchored depth bars).
      - Center Ticker Price: `75,798.46` (`text-[16px] font-bold text-[#0ECB81] tabular-nums`) + `≈ ₹7,128,845.16` (`text-[11px] text-[#848E9C]`).
      - 5 Bid Rows (green `#0ECB81` prices `75,798.45` down to `75,797.59`, right-aligned BTC amounts, green depth bars).
      - Buy/Sell Pressure Bar: `4.32%` (green left) / `95.68%` (red right).
      - Footer Controls: `0.01 ▾` tick size dropdown (`bg-[#202630] rounded px-2 py-1 text-[11px]`) + order book mode icon.
  - **Bottom Orders & Holdings Section (`mt-3 border-t border-[#2B3139]`):**
    - Tabs: `Open Orders (0)` (active) | `Holdings (1)` | `Bots` on left; Document/History icon on right.
    - Empty State (`py-8 flex flex-col items-center`): Wallet illustration icon + `"Available Funds: 0.00 USDT"` (`text-sm font-semibold text-[#EAECEF]`) + `"Transfer funds to your Spot wallet to trade"` (`text-xs text-[#848E9C]`) + `"Add Funds"` button (`bg-[#2B3139] text-[#EAECEF] text-xs font-semibold px-4 py-2 rounded-lg mt-3`).
- **Mode 3: Stocks (`00:18`–`00:19`, `00:23`):**
  - Header: `[Apple icon] AAPL ▾` (`text-lg font-bold`) on left, with `"Mid Closed $342.822 +0.13%"` (`+0.13%` in green) below; right side has Candlestick Chart icon, Megaphone/Announcement icon, and `...` icon.
  - Order Controls Row: Left 60% has `Buy | Sell` segmented control (when `Sell` active, `bg-[#F6465D] text-white`); Right 40% has `Market ▾` dropdown (`bg-[#202630]`).
  - Input Box (`bg-[#202630] rounded-xl p-3.5`): Left `Shares` (`text-sm text-[#848E9C]`), right `Min 0.01531407` (`text-sm text-[#474D57]`).
  - Slider: 5-dot horizontal percentage slider with `0%` on right.
  - Info rows: `Avbl 0 AAPL`, `Receive to` — `USDC >`.
  - CTA Button: Full-width `h-11 rounded-xl bg-[#7A2736] text-[#848E9C] font-bold` (`"Preview"`).
  - Promo Banner (`bg-[#202630] rounded-xl p-3 flex items-center gap-3`): Gift box illustration + `"NexusTrade Stocks Welcome Rewards: Transfer-In for Up to 12,000 USDC! More Details"` + `×` close button.
  - Bottom Tabs: `Open Orders (0)` (active) | `Positions (0)` | `Recurring (0)` + History icon on right. Empty state shows magnifying glass document icon + `"No Open Orders"` + `"Explore"` button (`bg-[#2B3139]`).
- **Mode 4: P2P (`00:20`–`00:22`):**
  - Top Sub-Header: `<-` back arrow | `Express` (active, bold `#EAECEF`) | `P2P` | `Block Trade` | `Lifestyle`.
  - Mode Row: `Buy` (active pill `bg-[#2B3139]`) / `Sell` toggle on left; Funnel filter icon on right.
  - Coin Pill (centered): `[USDT icon] USDT 11.56% APR ▾` (`bg-[#202630] rounded-full px-3 py-1`).
  - Large Amount Display (centered): `0 INR ▾` (`0` in `text-[44px] font-bold text-[#474D57]`, `INR` in `text-base font-bold text-[#EAECEF]`). Below: `⇅ 0 USDT` (`text-xs text-[#848E9C]`).
  - Payment Method Card (`bg-[#202630] rounded-xl px-4 py-3`): Left `Pay with`, Right `[Orange lightning icon] Lightning UPI >`.
  - Quick Multipliers / Presets Row: 4 pills (`₹400`, `₹2K`, `₹10K`, `₹20K` when buying; `1x`, `5x`, `10x`, `20x` or `Max` when selling).
  - Primary CTA Button: `"Select Payment Method"` (`h-11 rounded-xl bg-[#655A24] text-[#848E9C] font-bold`).
  - Custom 3×4 Numeric Keypad (`1 2 3 / 4 5 6 / 7 8 9 / . 0 ⌫`, clean borderless dark keys `text-xl font-semibold text-[#EAECEF]`).
  - Dedicated P2P Sub-Footer (`h-12 border-t border-[#2B3139]`): `P2P` (active yellow), `Orders`, `Ads`, `Chat (32)`, `Profile`.

### A.5 Exchange Futures Screen (`00:24`–`00:28`)
- **Top Mode Bar:** `USDⓈ-M` | `COIN-M` | `Options` (active `#EAECEF`) | `Smart Money` + Hamburger menu icon on right.
- **Options View (`00:25`–`00:28`):**
  - **Underlying & Expiry Bar:** Left `[ETH icon] ETH ▾` (`text-base font-bold`). Right: horizontally scrollable expiry pills (`11-08 (11h:57m)`, `11-09 (1d:11h)`, `11-10 (2d:11h)`, `11-13 (5d:11h)`).
  - **Promo Banner (`bg-[#202630] rounded-xl p-3 mx-4 my-2 flex items-center justify-between`):** Left icon + `"Trade U.S. Stock Options — Now on NexusTrade"` + subtitle `"NVDA, AAPL, TSLA and 1,000+ U.S. stock options. Explore Now"` (`Explore Now` in `#F0B90B`) + `×` close button.
  - **Filter Row (`px-4 py-2`):** Left pills `All` (active `bg-[#2B3139]`), `Call`, `Put`. Right: 2 utility icons (Greeks/chart icon + settings sliders icon).
  - **T-Chain Table Header (`grid-cols-5 text-[11px] text-[#848E9C] px-4 py-1.5 border-y border-[#2B3139]`):**
    - Col 1 (left): `Ask / IV`
    - Col 2 (right): `Bid / IV`
    - Col 3 (center, `bg-[#202630]`): `Strike`
    - Col 4 (left): `Ask / IV`
    - Col 5 (right): `Bid / IV`
  - **T-Chain Rows (`text-xs tabular-nums`):**
    - Strikes: `2,000`, `2,050`, `2,075`, `2,100`, `2,125`, `2,150`, `2,175`, `2,200`, `2,225`, `2,250`, `2,300`, `2,350`.
    - Left (Calls): Ask price in `#F6465D` (`239.0`, `189.0`, `164.0`, `139.0`, `114.6`, `90.0`, `66.8`, `44.6`, `25.8`, `12.6`, `2.0`, `1.2`) with IV% (`194.09%`, `149.85%`, etc.) below in `#848E9C`; Bid price (`0.0`, `60.2`, `38.6`, `17.6`, `10.0`, `1.2`, `0.2`) with IV% below.
    - Right (Puts): Ask price in `#0ECB81` (`0.4`, `0.6`, `1.0`, `2.0`, `3.6`, `7.4`, `14.8`, `25.6`, `43.2`) with IV% below; Bid price (`0.6`, `0.8`, `2.0`, `3.2`, `5.8`, `12.0`, `22.6`, `40.0`, `63.6`, `88.6`, `138.0`, `188.0`) with IV% below.
    - Current Spot Index separator badge centered between in-the-money and out-of-the-money strikes (`ETH 2,179.91`).
  - **Sticky Bottom Activation Banner (`bg-[#1E2329] border-t border-[#2B3139] p-4`):**
    - Text: `"Wanna hedge risks? Activate your Options Account and Explore this fascinating feature now!"` (`text-xs text-[#848E9C] mb-3`).
    - Button: Full-width bright yellow CTA `"Activate Options Account"` (`h-11 rounded-xl bg-[#FCD535] text-[#181A20] font-bold text-sm`).

### A.6 Exchange Assets Screen (`00:29`–`00:32`, `01:47`–`01:50`)
- **Top Sub-Navigation (`px-4 pt-2 pb-3`):**
  - Clean horizontal text tabs: `Overview` (active `#EAECEF font-bold text-base`) | `Spot` (`#848E9C`) | `Futures` (`#848E9C`). No underline bar, no `"History"` button crowding the right side.
- **Total Value & Chart Section (`px-4`):**
  - Top label row: `Est. Total Value` (`text-xs text-[#848E9C]`) + Eye visibility icon (`14px`) on left; right side has a compact chart-toggle icon button (`w-7 h-7 rounded-lg bg-[#202630]`).
  - Balance row: `₹0.00` (`text-[28px] font-bold text-[#EAECEF] tabular-nums`).
  - Portfolio Line Chart (`h-28 my-2 relative`):
    - Top-right annotation: `₹529.50` (`text-[10px] text-[#848E9C]`).
    - Smooth horizontal yellow line (`#F0B90B`, `strokeWidth={2}`).
    - Bottom-left annotation: `₹268.98` (`text-[10px] text-[#848E9C]`).
  - Timeframe Pills Row (`flex justify-between px-2 py-2`): `1D` (active `bg-[#202630] text-[#EAECEF] px-3 py-1 rounded-md text-xs font-semibold`), `7D`, `1M`, `6M`, `1Y` (`text-xs text-[#848E9C]`).
- **Recent Transaction Status Tickers (`px-4 space-y-2 my-2`):**
  - Row 1 (`bg-[#1E2329] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs`): Left `● Crypto withdraw 5.62 USDT` (green dot `#0ECB81`), Right `Completed >` (`text-[#848E9C]`).
  - Row 2 (`bg-[#1E2329] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs`): Left `● P2P buy 2.77 USDT` (green dot `#0ECB81`), Right `Completed >`.
- **Crypto Card (`mx-4 mt-3 bg-[#1E2329] rounded-2xl p-4`):**
  - Section title: `"Crypto"` (`text-base font-bold text-[#EAECEF] mb-3`).
  - Row 1 (`USDT`):
    - Left: `[USDT icon]` + `USDT` (`font-bold text-sm`) / `TetherUS` (`text-xs text-[#848E9C]`) / `₹94.05` (`text-xs text-[#EAECEF] mt-1`) / `Last Price` (`text-[10px] text-[#848E9C]`).
    - Middle: `11.57%` (`text-xs font-semibold text-[#0ECB81]`) / `APR` (`text-[10px] text-[#848E9C]`).
    - Right: `"Add Funds"` button (`bg-[#2B3139] text-[#EAECEF] text-xs font-semibold px-3 py-1.5 rounded-lg`).
  - Row 2 (`XRP`):
    - Left: `[XRP icon]` + `XRP` / `XRP` / `₹109.17` / `Last Price`.
    - Middle: `53.04%` (`text-[#0ECB81]`) / `APR`.
    - Right: `"Add Funds"` button (`bg-[#2B3139]`).
  - Row 3 (`USD1`):
    - Left: `[USD1 icon]` + `USD1` / `World Liberty Financial USD`.
    - Right: `"Add Funds"` button.
  - Card Footer (`mt-4 pt-2`): Centered button `"Add More Assets"` (`w-full h-9 rounded-xl bg-[#2B3139] text-[#EAECEF] text-xs font-semibold`).

### A.7 Web3 Wallet Splash & Web3 Home Screen (`00:34`–`00:45`, `01:52`–`02:12`)
- **Mode Switch Splash (`00:34`, `01:52`):** Brief (`~450ms`) centered splash screen showing `"Welcome to NEXUSTRADE Wallet"` with golden geometric logo emblem.
- **Search Bar (`00:36`, `02:00`):** Full-width `h-9 rounded-xl bg-[#202630] px-3` with rotating placeholder (`"Hot Alpha: AKE"`, `"Hot Perps: BTCUSDT"`, `"Top Search: AGC"`) on left and magnifying glass icon on right.
- **Wallet Balance & Line Chart Header (`00:36`–`00:39`, `02:00`–`02:07`):**
  - Wallet selector row: `[Blue/Teal wallet avatar icon] My Wallet >` (`text-xs font-medium text-[#EAECEF]`) + `[Copy icon]` (`#848E9C`).
  - Balance & CTA row: Left `₹527.89` (`text-[28px] font-bold text-[#EAECEF] tabular-nums`), Right bright yellow button `"Receive"` (`bg-[#FCD535] text-[#181A20] text-xs font-bold px-4 h-9 rounded-lg`).
  - PnL subtext: `1D ₹0 (0%) ▲` (`text-xs text-[#848E9C]`).
  - Interactive Line Chart (`02:00`–`02:07`): Smooth yellow curve (`#F0B90B`) rising from `₹0` to `₹527.89` (`₹527.89` top-right label, `₹0` bottom-left label).
  - Chart Timeframe Pills (centered below chart): `1D` (active `bg-[#202630] text-[#EAECEF] px-3 py-1 rounded-md text-xs font-semibold`), `7D`, `30D`.
- **5 Quick-Action Icons (`00:36`, `02:00`):**
  - 5-column row (`grid-cols-5 gap-2 py-2`): `Alpha`, `Stocks`, `DeFi`, `Referral`, `More`. Each icon sits in a `w-11 h-11 rounded-2xl bg-[#202630]` dark container with white/yellow 2-tone icon and `11px` `#EAECEF` label below.
- **Promo Carousel Banner (`00:40`, `02:00`, `02:06`):**
  - Rounded-2xl card (`bg-[#1E2329] p-3.5 flex items-center justify-between`) with 3 slides:
    1. `"Claim your unique Agent ID! First come, first served"` / `"Claim now >"` (with yellow `.ai` 3D card illustration on right).
    2. `"Grab a share of $2M rewards in TRON Carnival Season 3"` / `"Join Now >"`.
    3. `"Subscribe USDC to share $150k rewards with Kamino"` / `"Join Now >"`.
- **2-Column Discovery Bento (`00:40`, `02:00`):**
  - Left Card (`bg-[#1E2329] rounded-2xl p-3.5`): `"Tracker >"` (`text-xs text-[#848E9C]`), `"WOJAK"` (`text-sm font-bold text-[#EAECEF]`), `"3 Traders Calls"` (`text-xs text-[#0ECB81]`) + overlapping avatar stack on right.
  - Right Card (`bg-[#1E2329] rounded-2xl p-3.5`): `"Earn >"` (`text-xs text-[#848E9C]`), `"22.16% APY"` (`text-sm font-bold text-[#0ECB81]`), red `TRX` token icon on right.
- **On-Chain Token List (`00:40`–`00:42`, `02:11`):**
  - Category Tabs: `[Star icon]` | `Holdings` | `Trending` (active `#EAECEF font-bold` with yellow underline) | `Stocks` | `Perps`.
  - Network Filter Strip: `All` (active `bg-[#2B3139] text-[#EAECEF]`) | `BSC` | `Robinhood` | `Solana` | `Ethereum` on left; `1h ▾` timeframe dropdown pill on right.
  - Token Rows (`FLOAT`, `José`, `STONK 10x`, `STANK`, `HYPE`):
    - Left: Circular token avatar (`36px`) with mini chain badge (`BSC` yellow or `Solana` purple/green) at bottom-right + Symbol (`FLOAT`, `José`, `STONK` + `10x` pill, `STANK`, `HYPE`) + Volume & Market Cap subtext (`₹214.01M  ₹827.48M`).
    - Right: Fiat price (`₹0.91006`, `₹0.12084`, `₹7.77692`, `₹0.1836`, `₹7,281.64`) + colored `%` change below (`+33.98%` in `#0ECB81`, `-5.6%`, `-9.94%`, `-21.03%`, `-0.31%` in `#F6465D`).
  - Footer link: `"View more"` centered in `#848E9C text-xs`.

### A.8 Web3 Wallet Markets Screen (`00:47`–`00:49`)
- **Top Sub-Navigation:** `Overview` (active `#EAECEF font-bold text-lg`) | `Stocks` | `Memes` | `Tracker`.
- **Search Bar:** Full-width `bg-[#202630] h-9 rounded-xl px-3` (`"Top Search: AGC"`) + watchlist/filter icon button on right.
- **3 Signal Cards (`grid-cols-3 gap-2`):**
  1. `Tracker` (radar icon on right).
  2. `BUTTER...` / `New Signal` (token avatar on right).
  3. `Perps` (candlestick icon on right).
- **Top Themes Section (`00:49`):**
  - Header: `"Top Themes"` (`text-base font-bold text-[#EAECEF]`).
  - 2×2 Grid of Theme Cards (`bg-[#1E2329] rounded-2xl p-3`):
    1. `BNB Stonks Szn` (`▼ 5.37%` red) with inner mini token row `中国人能飞 +9.64%`.
    2. `Robinhood Meme` (`▼ 2.72%` red) with inner token row `BUTTER... +11.4%`.
    3. `Pre-Access` (`▲ 1.98%` green) with inner token row `KOGE +0.02%`.
    4. `+109.76%` green highlight card (`bg-[#142922]`).
  - Carousel pagination indicator dots centered below.
- **Bottom Token Table (`00:49`):**
  - Tabs: `[Star]` | `Holdings` | `Trending` (active) | `Alpha` | `Stocks` | `Perps`.
  - Chain Pills: `All` | `BSC` | `Robinhood` | `Solana` | `Ethereum` + `1h ▾`.
  - Table Column Headers: `Vol / Market Cap` on left; `Last Price / Change` on right.
  - Rows: `STONK` (`10x`, `₹208.73M ₹6.05B`, `₹7.80123`, `-9.66%` red pill), `FLOAT` (`₹214.01M ₹827.48M`, `₹0.91006`, `+33.98%` green pill), `José` (`-5.60%` red pill), `STANK` (`-21.03%` red pill).

### A.9 Web3 Wallet Trade / Swap Screen (`00:50`)
- **Top Bar:** Left tabs `Swap` (active `#EAECEF font-bold text-lg`) | `Bridge` | `Pro` | `Perps`. Right: Candlestick chart icon + Settings sliders icon.
- **Swap Cards:**
  - `From` Card (`bg-[#202630] rounded-2xl p-4`): Top row `From` on left, `[Wallet icon] 0 (+)` on right. Bottom row `[BNB icon + BSC badge] BNB ▾` (`BNB Smart Chain` subtext) on left, `0` (`text-2xl font-bold text-[#474D57]`) on right.
  - Center Swap Button: `w-9 h-9 rounded-xl bg-[#2B3139] border-4 border-[#181A20]` with `⇅` icon.
  - `To` Card (`bg-[#202630] rounded-2xl p-4`): Top row `To` on left, `[Wallet icon] 5.62` on right. Bottom row `[USDT icon + BSC badge] USDT ▾` (`BNB Smart Chain` subtext) on left, `0` on right.
  - CTA Button: Full-width `"Enter Amount"` (`h-12 rounded-xl bg-[#655A24] text-[#848E9C] font-bold`).
- **Bottom Open Orders / Holdings Panel:**
  - Tabs: `Open Orders` (active with yellow underline) | `Holdings` on left; Order history document icon on right.
  - Filter bar: `[ ] Only show current token` on left; Refresh + Filter icons on right.
  - Empty State: Document magnifying glass illustration + `"No Orders"`.

### A.10 Web3 Wallet Discover Screen (`00:52`)
- **Search Bar:** Full-width `bg-[#202630] h-9 rounded-xl px-3` (`"Search DApps"`).
- **Sub-Navigation Tabs:** `Featured` (active `#EAECEF font-bold`) | `Earn` | `Booster` | `Airdrops` | `DApps`.
- **Featured Promo Banner:** `"Grab a share of $2M rewards in TRON Carnival Season 3"` + `"Join Now >"` button.
- **Simple Yield Header:** `"Simple Yield"` on left, `"TVL $1,683,310,415 >"` on right.
- **2-Column Yield Cards:** `USDC` (`3.55%` APR) and `USDT` (`2.16%` APR) on left; `Locked Products` / `Lista Lending` on right.
- **Hot Vaults Card:** `Hot Vaults` (`B USDT`, `6.15% APR`).
- **Popular DApps Section:** Header `"Popular DApps >"`, horizontal list with ` Venus`, `PancakeSwap`, `Four.Meme`, `Lista DAO`.

### A.11 Web3 Wallet Assets, Portfolio, Send, Receive, History & Approvals (`00:53`–`01:25`, `02:13`–`02:15`)
- **Web3 Assets Main View (`00:55`–`01:01`, `02:14`–`02:15`):**
  1. **Top Header:** Left Hamburger menu icon; Center `"Assets"` (`text-[17px] font-semibold`); Right Shield-Check icon + Wallet-Settings icon.
  2. **Wallet Row:** Left `[Blue/Teal wallet icon] My Wallet >`; Right dark circular button with green Pie-Chart icon (opens **Portfolio** view).
  3. **Balance:** `₹527.89` (`text-[30px] font-bold text-[#EAECEF] tabular-nums`).
  4. **4 Action Buttons (`grid-cols-4 gap-3 my-4`):**
     - `Send` (`↑`), `Receive` (`↓`), `History` (`📄`), `Approvals` (`🛡️`). Each button has a `w-14 h-12 rounded-2xl bg-[#202630] flex items-center justify-center` container and `11px` `#848E9C` label below.
  5. **Hold-to-Earn Card (`bg-[#202630] rounded-2xl p-3.5 mb-4 flex items-center gap-3`):**
     - Left: Golden hand-holding-coin illustration (`w-9 h-9`).
     - Right: `"Hold tokens to earn rewards"` (`text-xs text-[#848E9C]`) + `"Up to 5.00% APR"` (`text-sm font-bold text-[#EAECEF]`).
  6. **Asset Category Tabs (`border-b border-[#2B3139] flex items-center justify-between`):**
     - Left tabs: `Tokens` (active with yellow underline) | `Stocks` | `DeFi` | `NFTs` | `Perps`.
     - Right: Search magnifying glass icon (`#848E9C`).
  7. **Total Assets Summary Row (`py-3 flex items-center justify-between`):**
     - Left: `"Total Assets"` (`text-xs text-[#848E9C]`) + `"₹527.89"` (`text-sm font-bold text-[#EAECEF]`).
     - Right: Filter/Manage sliders icon (`#848E9C`).
  8. **Primary Token Row (`USDT`):**
     - Left: `USDT` icon (`36px`) with `BSC` chain badge on bottom-right + `USDT` (`font-bold text-sm`) + `Up to 11.64% APY` (`bg-[#2D2618] text-[#F0B90B] text-[10px] px-1.5 py-0.5 rounded`) + second line `₹93.93 +0.01%` (`+0.01%` in `#0ECB81`).
     - Right: `5.62` (`font-bold text-sm text-[#EAECEF]`) + `₹527.89` (`text-xs text-[#848E9C]`).
  9. **Collapsible `Low value (5)` Accordion (`00:55` collapsed, `00:58`–`01:01` expanded):**
     - Header row: `"Low value (5)"` (`text-xs text-[#848E9C]`) on left, chevron `∨` / `∧` on right.
     - Expanded rows (`00:58`–`01:01`):
       - `BNB` (`Native` pill, `Up to 1.57% APY` amber pill, `₹65,455.1 +0.33%`, right `0 / ₹0`)
       - `ETH` (BSC badge, `Up to 3.28% APY` amber pill, `₹204,704.96 -0.22%`, right `0 / ₹0`)
       - `ETH` (`Native` pill, `Up to 0.67% APY` amber pill, `₹204,704.96 -0.22%`, right `0 / ₹0`)
       - `SOL` (`Native` pill, `Up to 5.09% APY` amber pill, `₹8,434.33 -0.80%`, right `0 / ₹0`)
- **Sub-Screen 1: Portfolio Donut Chart (`01:02`–`01:09`):**
  - Triggered by clicking the green Pie-Chart icon on Web3 Assets.
  - Header: `<-` back arrow | `"Portfolio"` centered | Shield icon + Wallet icon on right.
  - Balance summary: `Est. Total Value` / `₹527.89`.
  - Tabs: `Tokens` (active with yellow underline) | `Stocks` | `DeFi` | `NFTs`.
  - Donut Chart Area (`Tokens` tab `01:02`–`01:05`): Large emerald-green (`#0ECB81`) Donut Ring on left (`w-32 h-32`), legend `■ USDT  100%` on right. Below: `Total (1) ₹527.89` and the `USDT` (`100%`, `5.62 / ₹527.89`) row.
  - `Stocks` tab (`01:07`): Empty state box illustration + `"You don't hold any stock assets yet."` + yellow link `"Explore Stocks in Market"`.
  - `DeFi` & `NFTs` tabs (`01:08`–`01:09`): Empty state illustration + `"No protocol found"` / `"No Data"`.
- **Sub-Screen 2: Send Token (`01:13`):**
  - Header: `<-` back arrow | `"Send Token"` centered.
  - Two large action cards (`bg-[#202630] rounded-2xl p-4 space-y-3`):
    1. `[Exchange icon] Transfer to NexusTrade Exchange` — `"Transfer assets to your NexusTrade Account"` + `>`
    2. `[Wallet arrow icon] Send to Wallet Address` — `"Send your assets to onchain wallet address"` + `>`
- **Sub-Screen 3: Receive Tokens (`01:15`, `02:08`):**
  - Header: `<-` back arrow | `"Receive Tokens"` centered.
  - Three large action cards (`bg-[#202630] rounded-2xl p-4 space-y-3`):
    1. `[Exchange icon] Transfer from NexusTrade Exchange` — `"Withdraw assets from your NexusTrade Account"` + `>`
    2. `[QR/Wallet icon] Receive Tokens via Address` — `"Receive funds via wallet address or QR code"` + `>`
    3. `[P2P icon] Buy with P2P` — `"Buy crypto from selected merchants"` + `>`
- **Sub-Screen 4: History (`01:18`–`01:21`):**
  - Header: `<-` back arrow | `"History"` centered.
  - Search Input: `bg-[#202630] h-9 rounded-xl px-3` (`"Token symbol or contract address"`).
  - Filter Row: `[Wallet icon] My Wallet ▾` pill + `All Networks ▾` pill on left; Funnel filter icon on right.
  - Date Group Header: `2026-11-08` (`text-xs text-[#848E9C]`).
  - Transaction Item: Left circular `↓` icon + `Receive` (`font-semibold text-sm`) / `From: 0xA010...763bf4` (`text-xs text-[#848E9C]`). Right: `+5.62 USDT` (`text-sm font-bold text-[#0ECB81]`) + `[USDT + BSC icon]`.
  - Footer: `"No more records found"` (`text-xs text-[#474D57] text-center py-6`).
- **Sub-Screen 5: Approvals (`01:23`):**
  - Header: `<-` back arrow | `"Approvals"` centered | `"Batch Revoke"` (`text-xs font-semibold text-[#F0B90B]`) on right.
  - Filter Row: `All Wallets ▾` | `All Protocols ▾` | `All Networks ▾` | `[Filter icon]`.
  - Empty State: Magnifying glass document icon + `"No records"`.

### A.12 Global Drawers & Modals (`01:32`–`01:44`)
- **Profile & My Tasks Drawer (`01:32`–`01:33`):**
  - Top bar: `<-` back arrow on left; Settings gear icon + Sun/Moon theme icon on right.
  - User Profile Row: Left 3D Trophy/Badge avatar (`w-14 h-14`), Center `UID: 1061155439 [Copy]` (`text-xs text-[#848E9C]`), `User-a11dd` (`text-lg font-bold text-[#EAECEF]`), pills `Verified` (`bg-[#0ECB81]/15 text-[#0ECB81]`) + `Regular` (`bg-[#2B3139] text-[#EAECEF]`), Right `>` chevron.
  - Support Strip (`bg-[#202630] rounded-xl p-3 flex items-center justify-between`): `[Headset icon] Nexus Support` on left, `"Get Support"` button (`bg-[#2B3139]`) on right.
  - 2-Column Referral & Promo Cards (`grid-cols-2 gap-2.5`):
    - Left: `"Refer&Earn Together"` / `"Unlock Up to 400 USDC Monthly"` + coin graphic.
    - Right: `"For You"` / `"Referral Rush 2026: Share $550,000 in USDT"` + rocket graphic.
  - **My Tasks Card (`bg-[#1E2329] rounded-2xl p-4`):**
    - Header: `"My Tasks"` (`text-base font-bold`).
    - Subheader: `"Unlock rewards worth 27 PTS today >"` + `"End Time 03H : 56M"`.
    - 7-Day Check-In Bar (`grid-cols-7 gap-1.5 my-3`): Days 1–5 (`+0` check), Day 6 highlighted in bright yellow (`bg-[#FCD535] text-[#181A20] font-bold`), Day 7 gift box.
    - Task 1 (`bg-[#202630] rounded-xl p-3`): `[2 PTS badge] Daily Spot trading ≥ $10` (`0 / 10 USDT`) + yellow `"Go"` button (`bg-[#FCD535] text-[#181A20]`).
    - Task 2 (`bg-[#202630] rounded-xl p-3 mt-2`): `"Complete daily Convert trading to earn big point rewards!"` + milestone progress bar (`0 USDT` — `10 (1 PTS)` — `50 (2 PTS)`).
  - Bottom 2-Column Cards: `Spot Copy` and `Futures Copy`.
- **Messages / Notifications Screen (`01:41`–`01:44`):**
  - Top bar: `<-` back arrow on left; `"Message"` centered; Broom (mark read) + `+` icon on right.
  - Primary Tabs: `Chat` (active with yellow underline) | `Square` | `Notifications` (with yellow dot).
  - Sub-filter pills under `Chat`: `All` (active `bg-[#2B3139]`) | `Unread`.
  - List items:
    1. `[Headset icon] Nexus Support` (`Get Support`, `04/21`, pin icon).
    2. `[P2P icon] P2P Message` (`[New] Chat as User-a11dd`, `01:33`).
    3. `[Archive icon] Archived Messages`.

---

## 3. PART B & C: SCREEN-BY-SCREEN COMPARISON MATRIX

### Screen 1: Global Shell, Top Header & Bottom Navigation (`src/App.tsx`, `src/index.css`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | Top header (`44px`): Left has Hamburger Menu (with yellow dot) + Headset icon; Center has `Exchange \| Wallet` pill toggle (`bg-[#202630]`, active `bg-[#2B3139]`, no border); Right has Chat + Pay/Scan in Exchange mode (`Home`), or Gift + Chat in Wallet mode (`Home/Markets/Trade/Discover`). On Wallet `Assets` (`00:55`), top header transforms to Hamburger (left), `"Assets"` title (center), Shield + Wallet-Settings icons (right). Bottom nav (`54px`): 5 tabs with 2-tone active icons and `#EAECEF` active text. |
| **2. Existing Layout** | `src/App.tsx` (lines 118–260) renders the top header on all screens (except Trade/Futures in Exchange), uses a bordered pill `border border-[#2B3139]/60`, shows the same right-side icons on Wallet `Assets` instead of `"Assets"` title + Shield/Wallet icons, and renders a solid yellow circle (`w-7 h-7 rounded-full bg-[#FCD535] text-[#181A20]`) when the `Trade` bottom tab is active (lines 217–228). |
| **3. Visual Mismatch** | **[High]** The solid yellow circle on the active `Trade` tab in `src/App.tsx` does not match the reference (`00:14`–`00:23`), where `Trade` uses a dark circular outline icon with two horizontal swap arrows and a yellow inner accent. Also, Exchange `Assets` (`00:29`) in reference hides the global top header or integrates smoothly with `Overview \| Spot \| Futures`, whereas Wallet `Assets` (`00:55`) replaces the `Exchange \| Wallet` pill with the centered title `"Assets"` and right-side Shield + Wallet icons. |
| **4. Missing UI Elements** | **[High]** Missing the Mode Switch Splash transition (`"Welcome to NEXUSTRADE Wallet"` at `00:34` / `01:52`) when toggling from `Exchange` to `Wallet`; missing dynamic Wallet `Assets` top bar (`Hamburger` \| `"Assets"` \| `Shield` + `Wallet`). |
| **5. Incorrect Spacing** | **[Low]** Top header icon gap is `gap-3.5`; reference uses `gap-4` (`16px`) and `px-4`. |
| **6. Incorrect Typography** | **[Low]** Bottom nav labels use `text-[10px]`; ensure active label is `text-[#EAECEF] font-medium` and inactive is `text-[#848E9C]`. |
| **7. Component Sizing** | **[Medium]** Active `Trade` bottom nav button (`w-7 h-7 rounded-full bg-[#FCD535]`) is oversized compared to the `22px` outlined icon in reference. |
| **8. Navigation Differences** | **[Medium]** Clicking the top-left Hamburger icon opens `ProfileDrawer`; clicking Chat opens `NotificationsDrawer`. On Wallet `Assets`, top header right icons should support security/approvals and wallet management. |
| **9. Required Corrections** | 1. **[High]** Replace the solid yellow circle on the active `Trade` bottom tab (`src/App.tsx` lines 217–228) with the reference 2-tone circular swap-arrows SVG icon.<br>2. **[High]** Add the brief `"Welcome to NEXUSTRADE Wallet"` transition overlay (`~450ms`) when switching from Exchange to Wallet.<br>3. **[Medium]** Update the top header on Web3 Wallet `Assets` to show `Hamburger` (left), `"Assets"` (center), and `ShieldCheck` + `Wallet` icons (right), while keeping the `Exchange \| Wallet` toggle accessible or switchable. |

---

### Screen 2: Exchange Home Screen (`src/screens/HomeScreen.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | 1. Search bar (`🔥 BTC is trending now` + right QR scan icon).<br>2. `Onboarding Tasks 3/3` card (`Start Your First Trade`, full-width yellow `Trade` button, `Spot Trading Explained: A Beginner's Guide` + `Go` button).<br>3. `Convert >` card (flat `From` / `To` rows separated by a single horizontal line + swap button, `> 0.01` / `> 0.00000013` placeholders, dark `Convert` button).<br>4. 2-Column Bento: `Earn >` (`USDC 9.14%`, `U 8.15%`) and `BNB >` (`697.09`, `▲ 0.36%` under price, green sparkline).<br>5. `Stocks` card (`NVDA`, `MU`, `AMD` with USD price + `₹` subtext + green `%` pill).<br>6. Sticky `Discover \| Following \| Stocks \| Leaderboard \| Announcements \| News` social feed. |
| **2. Existing Layout** | `src/screens/HomeScreen.tsx` renders: Search bar (without QR scan icon) -> `"Est. Total Value (INR) ₹0.00"` + `"Unconnected / 0.00 Balance"` + `"LIVE WS"` badge + `"Expand asset trend chart"` -> `Onboarding Tasks 3/3` (with extra inner USDT box and `"Transfer USDT Between Spot & Futures Wallets"`) -> `"Community Appreciation - Earn"` banner -> `Convert` card (with nested inner boxes, prefilled `100` / `0.001320`, `"Zero Fee >"`) -> `Earn` / `BNB` bento -> `Stocks` (with `"Stock"` badges and no `₹` subtext) -> an extra `"Market Watchlist (Favorites \| Hot \| New)"` card -> `Discover` social feed. |
| **3. Visual Mismatch** | **[Critical]** When balance is `0`, the reference (`00:00`–`00:09`) does **not** render the `"Est. Total Value / Unconnected / LIVE WS"` block above `Onboarding Tasks`, nor does it render the `"Community Appreciation"` banner or the duplicate `"Market Watchlist"` table above `Discover`. Furthermore, the `Convert` card in NexusTrade wraps `From` and `To` in separate bordered boxes instead of a flat unified card. |
| **4. Missing UI Elements** | **[High]** Missing QR scan icon on the right side of the search bar; missing `₹` fiat secondary price (`₹17,749.21`, `₹65,343.02`, `₹42,142.96`) under the USD stock prices in the `Stocks` widget; missing `U` (`APR 8.15%`) in the `Earn` bento card. |
| **5. Incorrect Spacing** | **[Medium]** Excess vertical clutter from non-reference cards pushes the `Convert`, `Earn/BNB`, and `Stocks` widgets far down the page. Card borders (`border border-[#2B3139]`) add visual noise. |
| **6. Incorrect Typography** | **[Medium]** In the `BNB` sparkline card (`lines 783–795`), `+0.36%` is placed in the top-right corner instead of directly beneath the `697.09` price (`00:00`). In `Stocks`, a `[Stock]` pill is appended to `NVDA`/`MU`/`AMD`, which does not exist in the reference. |
| **7. Component Sizing** | **[Medium]** `Convert` card inner boxes add unnecessary height (`~260px` vs `~190px` in reference). |
| **8. Navigation Differences** | **[Low]** Clicking `"Go"` on `"Spot Trading Explained: A Beginner's Guide"` or `"Trade"` navigates to `Spot` trade. |
| **9. Required Corrections** | 1. **[Critical]** Remove the `"Unconnected / 0.00 Balance / LIVE WS"` status bar when balance is `0` so `Onboarding Tasks 3/3` sits directly under the Search Bar (`00:00`), while keeping the balance header available when funded.<br>2. **[High]** Clean up `Onboarding Tasks 3/3`: remove the nested `USDT` box above the yellow `Trade` button, and update the bottom row copy to `"Spot Trading Explained: A Beginner's Guide"` with `"Go"` button.<br>3. **[High]** Remove the non-reference `"Community Appreciation - Earn"` card and the duplicate `"Market Watchlist"` card above the `Discover` feed.<br>4. **[High]** Restyle the Home `Convert >` card to match `00:00`: remove `"Zero Fee >"`, use flat `From` / `To` rows separated by a thin divider + center `⇅` button, display `> 0.01` and `> 0.00000013` placeholders when empty, and remove heavy borders.<br>5. **[Medium]** Update `Earn >` (`USDC 9.14%`, `U 8.15%`), `BNB >` (`▲ 0.36%` below price), and `Stocks` (remove `"Stock"` tag, add `₹` subtext under USD price). |

---

### Screen 3: Exchange Markets Screen (`src/screens/MarketsScreen.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | Top search bar (`"Search coins and trends"`) + `...` icon. Category tabs: `For You` (active), `Favorites`, `Crypto`, `TradFi`, `Alpha`, `Square`. Inside `For You` (`00:13`):<br>1. `Smart Tracker - Mine` card (`Nov 7 04:30:21 Triggered >`, `TRUMP Pullback -5.09%`, red sparkline, `"⚡ The price rose notably before falling back..."`).<br>2. `Master Trades >` 3-column horizontal strip (`John Rogers Ho...`, `Prem Watsa Hol...`, `Peltz Hold...`).<br>3. `Indices >` card (`TRUMP FLAT`, green/red `Inflow: 5.56M TRUMP` / `Outflow: 5.48M TRUMP` bar, and 3-column ticker footer `TRUMP 1.183 -3.66%`, `BNB 697.09 +0.36%`, `BTC 75,805 -0.18%`). |
| **2. Existing Layout** | `src/screens/MarketsScreen.tsx` (Video 1 `00:02`) shows `LIVE` badge + refresh icon in the tab bar, and inside `For You` renders `Market Brief`, `Top Movers`, `Trade Ideas`, and `Trader Picks` with `LIVE` and `REF` provenance badges on every ticker. |
| **3. Visual Mismatch** | **[Critical]** The `For You` tab content in `MarketsScreen.tsx` does not match the reference `00:13` screen (`Smart Tracker - Mine`, `Master Trades`, `Indices`), and is cluttered with `LIVE` / `REF` telemetry badges. |
| **4. Missing UI Elements** | **[Critical]** Missing `Smart Tracker - Mine` card, `Master Trades` 3-column institutional cards, and `Indices` inflow/outflow card in `For You`; missing `...` menu button next to the search bar. |
| **5. Incorrect Spacing** | **[Medium]** Tab bar is crowded by the `LIVE` indicator and refresh button on the right. |
| **6. Incorrect Typography** | **[Medium]** Top tabs (`For You`, `Favorites`, `Crypto`, `TradFi`, `Alpha`, `Data`) should use `text-[15px] font-semibold` with `#EAECEF` active and `#848E9C` inactive (no yellow underline on the top primary category bar). |
| **7. Component Sizing** | **[Low]** Search bar height should be `h-9` (`36px`) with `rounded-xl bg-[#202630]`. |
| **8. Navigation Differences** | **[Low]** Clicking any ticker in `For You`, `Favorites`, `Crypto`, `TradFi`, or `Alpha` opens the pair chart or trade screen. |
| **9. Required Corrections** | 1. **[Critical]** Replace the top of the `For You` tab in `src/screens/MarketsScreen.tsx` with the exact 3 reference sections from `00:13`: `Smart Tracker - Mine`, `Master Trades >`, and `Indices >` (existing `Market Brief` / `Top Movers` can follow below the fold or under `Data`).<br>2. **[High]** Remove all `LIVE`, `LIVE WS`, and `REF` provenance badges from `MarketsScreen.tsx`. |

---

### Screen 4: Exchange Trade Screen — Convert, Spot, Stocks, P2P, Alpha (`src/screens/TradeScreen.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | Top bar: `Convert \| Spot \| Stocks \| P2P \| Alpha` + Hamburger icon.<br>• **Convert (`00:14`):** `Explore SIP From $0.1 and Zero Fees >` banner; `Instant \| SIP \| Limit` pills + 2 right icons (chart + history); `From` (`USDT`, `> 0.01`) and `To` (`BTC`, `> 0.00000013`) cards; `Preview` button.<br>• **Spot (`00:17`):** Hot Campaign ticker; `BTC/USDT ▾ -0.19%` header + mini chart/bot/`...` icons; immediate 2-column split (Left: `Buy/Sell`, `Market ▾`, `Total USDT`, diamond slider, `Slippage Tolerance`, `Avbl / Max Buy / Est. Fee`, green `Buy BTC` button; Right: 5 Ask / 5 Bid Order Book with `75,798.46` mid price & `4.32% / 95.68%` ratio bar); Bottom `Open Orders (0) \| Holdings (1) \| Bots` with wallet empty state (`Available Funds: 0.00 USDT` + `Add Funds`).<br>• **Stocks (`00:18`):** `AAPL ▾` (`Mid Closed $342.822 +0.13%`) + 3 right icons; `Buy \| Sell` + `Market ▾`; `Shares` (`Min 0.01531407`); `Receive to USDC`; `Preview` button; Welcome Rewards `12,000 USDC` banner; `Open Orders (0) \| Positions (0) \| Recurring (0)` + `"No Open Orders"` / `"Explore"`.<br>• **P2P (`00:20`):** `<- \| Express \| P2P \| Block Trade \| Lifestyle` top bar; `Buy \| Sell` pill; `USDT 11.56% APR ▾`; `0 INR ▾` display; `Pay with Lightning UPI >`; preset pills (`₹400`, `₹2K`, `₹10K`, `₹20K`); `Select Payment Method` CTA; 3×4 numeric keypad; P2P bottom bar. |
| **2. Existing Layout** | `src/screens/TradeScreen.tsx` (Video 1 `00:03`):<br>• Defaults `activeSymbol` to `USDT/USD`.<br>• In `Spot`, shows an amber `"Demo Spot Ledger · 0.10% Fee · No Live Exchange Order Routing"` banner and expands a `265px` candlestick chart at the top, pushing the order form and order book below the fold.<br>• In `Convert`, shows `"Wallet: SPOT"` text instead of the chart/history icons, and prefills `100`.<br>• In `Stocks`, omits the bottom `Open Orders (0) \| Positions (0) \| Recurring (0)` section.<br>• In `P2P`, shows only a merchant list without the `Express` numpad view (`00:20`–`00:22`). |
| **3. Visual Mismatch** | **[Critical]** 1. `Spot` has the chart expanded by default (instead of collapsed behind the header candlestick icon as in `00:17`), shows `USDT/USD` instead of `BTC/USDT`, and displays a demo warning banner.<br>2. `P2P` lacks the reference `Express` keypad view (`00:20`–`00:22`).<br>3. `Stocks` lacks the bottom `Open Orders (0) \| Positions (0) \| Recurring (0)` panel (`00:18`). |
| **4. Missing UI Elements** | **[Critical]** Missing P2P `Express` mode (large `0 INR` display, `Lightning UPI` row, preset pills, 3×4 numpad, P2P bottom nav); missing Spot `"Hot Campaign"` top ticker and `"Available Funds: 0.00 USDT / Add Funds"` empty state under `Open Orders (0)`; missing Stocks bottom tabs (`Open Orders (0) \| Positions (0) \| Recurring (0)`). |
| **5. Incorrect Spacing** | **[High]** Top mode bar (`Convert \| Spot \| Stocks \| P2P \| Alpha`) in `TradeScreen.tsx` has a heavy bottom border and cramped padding; reference uses clean borderless typography (`text-[18px] font-bold` active). |
| **6. Incorrect Typography** | **[Medium]** Convert `From`/`To` placeholders should show `> 0.01` and `> 0.00000013` in `#474D57` when empty. |
| **7. Component Sizing** | **[High]** Having `showChart` default to `true` on `Spot` consumes `265px` of vertical height above the order book. In the reference (`00:17`), `showChart` is `false` by default (toggled via the mini candlestick icon in the pair header). |
| **8. Navigation Differences** | **[High]** P2P tab should default to `Express` (`Express \| P2P \| Block Trade \| Lifestyle`), allowing users to use the numpad or switch to the `P2P` merchant list tab. |
| **9. Required Corrections** | 1. **[Critical]** Change default `activeSymbol` in `ExchangeContext.tsx` from `'USDTUSD'` to `'BTCUSDT'`, and set `showChart` in `TradeScreen.tsx` to `false` by default so `Spot` immediately renders the 2-column Order Ticket + Order Book (`00:17`).<br>2. **[Critical]** Remove the `"Demo Spot Ledger"` warning banner and add the dismissible `"🔥 Hot Campaign"` strip and bottom `"Available Funds: 0.00 USDT / Transfer funds to your Spot wallet to trade / Add Funds"` empty state.<br>3. **[Critical]** Build the reference **P2P Express** numpad view (`00:20`–`00:22`) as the default `Express` sub-tab inside `P2P`, while preserving the merchant list under the `P2P` sub-tab.<br>4. **[High]** Complete the `Stocks` view (`00:18`–`00:19`, `00:23`) by adding the header icons, `Receive to USDC`, and the bottom `Open Orders (0) \| Positions (0) \| Recurring (0)` tabs + empty state.<br>5. **[Medium]** Update `Convert` (`00:14`–`00:16`) with chart/history icons next to `Instant \| SIP \| Limit`, `> 0.01` / `> 0.00000013` placeholders, and `Preview` button. |

---

### Screen 5: Exchange Futures Screen — USDⓈ-M, COIN-M, Options (`src/screens/FuturesScreen.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | Top bar: `USDⓈ-M \| COIN-M \| Options \| Smart Money` + Hamburger icon.<br>In `Options` (`00:25`–`00:28`):<br>1. `[ETH icon] ETH ▾` + expiry date pills (`11-08 (11h:57m)`, `11-09 (1d:11h)`, `11-10 (2d:11h)`, `11-13 (5d:11h)`).<br>2. `"Trade U.S. Stock Options — Now on NexusTrade"` promo card (`NVDA, AAPL, TSLA and 1,000+ U.S. stock options. Explore Now`).<br>3. `All \| Call \| Put` filter pills + 2 right icons.<br>4. 5-column T-Chain table (`Ask / IV` \| `Bid / IV` \| `Strike` \| `Ask / IV` \| `Bid / IV`) with Strikes `2,000` to `2,350`.<br>5. Sticky bottom banner: `"Wanna hedge risks? Activate your Options Account..."` + full-width yellow `"Activate Options Account"` button. |
| **2. Existing Layout** | `src/screens/FuturesScreen.tsx` (Video 1 `00:04`–`00:05`) defaults `USDⓈ-M` to `USDTUSDT Perp`, renders an amber `"Demo USDⓈ-M Derivatives Ledger"` warning strip, and in `Options` renders a Black-Scholes formula notice, uses `Call Premium \| Call Δ / Breakeven \| Strike (USDT)` headers instead of `Ask / IV \| Bid / IV \| Strike`, and omits both the U.S. Stock Options promo card and the sticky bottom `"Activate Options Account"` CTA banner. |
| **3. Visual Mismatch** | **[Critical]** 1. Defaulting `USDⓈ-M` to `USDTUSDT Perp` looks broken (`BTCUSDT Perp` is standard).<br>2. `Options` (`00:25`–`00:28`) is missing the U.S. Stock Options promo card, uses non-reference column headers, and lacks the sticky bottom `"Activate Options Account"` card. |
| **4. Missing UI Elements** | **[High]** Missing `"Trade U.S. Stock Options — Now on NexusTrade"` banner; missing `"Activate Options Account"` sticky bottom panel; missing countdown format `(11h:57m)` on expiry tabs. |
| **5. Incorrect Spacing** | **[Medium]** The amber disclaimer banners in `USDⓈ-M`, `COIN-M`, and `Options` waste `48px–64px` of top viewport space. |
| **6. Incorrect Typography** | **[Medium]** In the reference Options T-Chain (`00:26`), Call Ask prices on the far left are colored red (`#F6465D`) and Put Ask prices on the right are colored green (`#0ECB81`), with `IV%` in `#848E9C` underneath each price. |
| **7. Component Sizing** | **[Medium]** Center `Strike` column should have a subtle `bg-[#202630]` background tint and compact `44px` row height so 8–10 strikes fit on screen simultaneously. |
| **8. Navigation Differences** | **[Low]** Clicking `"Activate Options Account"` or any option row opens the Options order/activation sheet. |
| **9. Required Corrections** | 1. **[Critical]** Remove the amber `"Demo Derivatives Ledger"` and `"Black-Scholes"` disclaimer banners in `src/screens/FuturesScreen.tsx`, and ensure `USDⓈ-M` defaults to `BTCUSDT Perp`.<br>2. **[High]** Update the `Options` view (`00:25`–`00:28`) to default to `ETH`, format expiry tabs with countdowns (`11-08 (11h:57m)`), add the `"Trade U.S. Stock Options"` promo banner, use `Ask / IV \| Bid / IV \| Strike \| Ask / IV \| Bid / IV` columns, and add the sticky bottom `"Activate Options Account"` CTA card. |

---

### Screen 6: Exchange Assets Screen (`src/screens/AssetsScreen.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | (`00:29`–`00:32`, `01:47`–`01:50`):<br>1. Top tabs: `Overview` (active `#EAECEF`) \| `Spot` \| `Futures`.<br>2. `Est. Total Value [Eye]` + `₹0.00` (or user total) + right chart-line toggle button.<br>3. Smooth yellow (`#F0B90B`) portfolio line chart with `₹529.50` (top-right) and `₹268.98` (bottom-left) labels + `1D \| 7D \| 1M \| 6M \| 1Y` selector pills.<br>4. Recent status ticker rows: `● Crypto withdraw 5.62 USDT — Completed >` and `● P2P buy 2.77 USDT — Completed >`.<br>5. `Crypto` card (`bg-[#1E2329] rounded-2xl p-4`): rows for `USDT` (`₹94.05 Last Price`, `11.57% APR`, `Add Funds` button), `XRP` (`₹109.17 Last Price`, `53.04% APR`, `Add Funds`), `USD1` (`World Liberty Financial USD`, `Add Funds`), and bottom `"Add More Assets"` button. |
| **2. Existing Layout** | `src/screens/AssetsScreen.tsx` (Video 1 `00:06`–`00:08`) renders 5 tabs (`Overview \| Spot \| Futures \| Funding \| Earn`) + `History` button, a `"SQLite Ledger / Persistent Sync Active"` pill, 3 sandbox mode toggle buttons (`Sandbox Demo`, `Empty State`, `Sync Read-Only API`), 3 USDT accounting boxes (`Available USDT`, `Locked USDT`, `Total TetherUS`), 3 square action tiles (`Add Funds`, `Send`, `Transfer`), an `Asset Allocation` bar, a `TetherUS USDT/USD` candlestick chart, and a 6-month activity table. |
| **3. Visual Mismatch** | **[Critical]** Complete visual and structural mismatch on `Overview`. The existing screen looks like a backend database debugger rather than the reference consumer portfolio view (`00:29`–`00:32`). |
| **4. Missing UI Elements** | **[Critical]** Missing the yellow portfolio value line chart with `1D \| 7D \| 1M \| 6M \| 1Y` pills; missing the compact recent transaction status rows (`Crypto withdraw 5.62 USDT Completed >`, `P2P buy 2.77 USDT Completed >`); missing the `Crypto` card with `USDT` (`11.57% APR`), `XRP` (`53.04% APR`), `USD1`, and `"Add Funds"` / `"Add More Assets"` buttons. |
| **5. Incorrect Spacing** | **[High]** Excessive cards and debug controls require 3+ screen heights of scrolling. |
| **6. Incorrect Typography** | **[Medium]** Top tabs in reference are `Overview \| Spot \| Futures` in `text-base font-semibold` without a bottom border line or yellow underline bar. |
| **7. Component Sizing** | **[High]** Replace the `200px` candlestick chart and 3 accounting boxes with the compact `110px` yellow portfolio line chart and `Crypto` list card. |
| **8. Navigation Differences** | **[Medium]** Clicking `"Add Funds"` on any asset row opens the Deposit/Buy options modal; clicking a recent transaction ticker opens transaction details/history. |
| **9. Required Corrections** | 1. **[Critical]** Redesign the `Overview` tab in `src/screens/AssetsScreen.tsx` to match `00:29`–`00:32` & `01:47`–`01:50`: top `Overview \| Spot \| Futures` bar, `Est. Total Value` + `₹0.00` (dynamically reflecting live balance if funded), yellow portfolio line chart (`₹529.50` / `₹268.98`) with `1D \| 7D \| 1M \| 6M \| 1Y` pills, the 2 recent transaction status pills (`Crypto withdraw 5.62 USDT`, `P2P buy 2.77 USDT`), and the `Crypto` card (`USDT`, `XRP`, `USD1` with APRs and `Add Funds` / `Add More Assets` buttons).<br>2. **[High]** Move any sandbox/demo balance controls out of the primary UI (or into the Profile/Settings drawer) so the main Assets viewport is 100% clean. |

---

### Screen 7: Web3 Wallet Home Screen (`src/screens/Web3WalletViews.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | (`00:36`–`00:45`, `02:00`–`02:12`):<br>1. Search bar (`Hot Alpha: AKE` / `Hot Perps: BTCUSDT`).<br>2. Wallet header: `[Wallet icon] My Wallet > [Copy]`, `₹527.89` on left + yellow `Receive` button on right, `1D ₹0 (0%) ▲` below, smooth yellow line chart (`₹0` to `₹527.89`), and centered `1D \| 7D \| 30D` timeframe pills.<br>3. 5 Quick-Action icons: `Alpha`, `Stocks`, `DeFi`, `Referral`, `More`.<br>4. 3-slide Promo Banner Carousel (`Claim your unique Agent ID!`, `TRON Carnival Season 3 $2M`, `Subscribe USDC $150k Kamino`).<br>5. 2-Column Bento: `Tracker >` (`WOJAK`, `3 Traders Calls`) and `Earn >` (`22.16% APY`, `TRX`).<br>6. Token List: `[Star] \| Holdings \| Trending \| Stocks \| Perps` tabs, `All \| BSC \| Robinhood \| Solana \| Ethereum` + `1h ▾` filter, and rows for `FLOAT`, `José`, `STONK 10x`, `STANK`, `HYPE` + `View more`. |
| **2. Existing Layout** | `src/screens/Web3WalletViews.tsx` (lines 780–1160, Video 1 `00:09`–`00:10`) hides the wallet balance and chart when unconnected, showing a large `"Self-Custody Web3 Vault / Create or Connect Your Web3 Wallet"` card with `Create Web3 Wallet`, `Import Seed Phrase`, and `Connect Browser Wallet` buttons. Also uses Exchange pairs in the token list if fallback occurs. |
| **3. Visual Mismatch** | **[Critical]** In the reference (`00:36`, `02:00`), `My Wallet` is active immediately with `₹527.89` (`5.62 USDT`), the yellow `"Receive"` button, and the interactive `1D \| 7D \| 30D` yellow line chart. The bulky `"Self-Custody Web3 Vault"` onboarding box in NexusTrade breaks the entire top half of the screen. |
| **4. Missing UI Elements** | **[Critical]** Missing the `₹527.89` default active wallet state + interactive `1D \| 7D \| 30D` yellow line chart (`02:00`–`02:07`); missing the 3-slide rotating promo banner (`Agent ID`, `TRON Carnival Season 3`, `Kamino USDC`); missing the exact reference trending tokens (`FLOAT +33.98%`, `José -5.6%`, `STONK 10x -9.94%`, `STANK -21.03%`, `HYPE -0.31%`) with `BSC`/`Solana` chain badges. |
| **5. Incorrect Spacing** | **[Medium]** Shortcut icons (`Alpha`, `Stocks`, `DeFi`, `Referral`, `More`) should sit in `w-11 h-11 rounded-2xl bg-[#202630]` containers with `gap-2`. |
| **6. Incorrect Typography** | **[Low]** Token list tabs should be ordered `[Star] \| Holdings \| Trending \| Stocks \| Perps` with `Trending` active by default. |
| **7. Component Sizing** | **[Medium]** The yellow `"Receive"` button on the right of the balance is `h-9 px-4 rounded-lg bg-[#FCD535] text-[#181A20] text-xs font-bold`. |
| **8. Navigation Differences** | **[High]** Clicking the yellow `"Receive"` button on Web3 Home (`02:08`) opens the full-screen `"Receive Tokens"` modal (`Transfer from NexusTrade Exchange`, `Receive Tokens via Address`, `Buy with P2P`). |
| **9. Required Corrections** | 1. **[Critical]** Default `My Wallet` to an active state holding `5.62 USDT` (`₹527.89`) so Web3 Home immediately displays `My Wallet > [Copy]`, `₹527.89`, the yellow `Receive` button, and the `1D \| 7D \| 30D` yellow line chart (`00:36`, `02:00`).<br>2. **[High]** Add the 3-slide promo carousel (`Agent ID`, `TRON Carnival Season 3`, `Kamino USDC`) and populate the `Trending` tab with the reference on-chain tokens (`FLOAT`, `José`, `STONK 10x`, `STANK`, `HYPE`) with chain badges and `₹` volume/market-cap subtext. |

---

### Screen 8: Web3 Wallet Markets Screen (`src/screens/Web3WalletViews.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | (`00:47`–`00:49`):<br>1. Top tabs: `Overview` (active) \| `Stocks` \| `Memes` \| `Tracker`.<br>2. Search bar: `Top Search: AGC` + right watchlist icon.<br>3. 3 Signal Cards: `Tracker`, `BUTTER... New Signal`, `Perps`.<br>4. `Top Themes`: 2×2 grid (`BNB Stonks Szn ▼ 5.37%`, `Robinhood Meme ▼ 2.72%`, `Pre-Access ▲ 1.98%`, `+109.76%` green card) + carousel dots.<br>5. Bottom Token List: `[Star] \| Holdings \| Trending \| Alpha \| Stocks \| Perps` tabs, `All \| BSC \| Robinhood \| Solana \| Ethereum` + `1h ▾`, `Vol / Market Cap` & `Last Price / Change` headers, and rows (`STONK 10x`, `FLOAT`, `José`, `STANK`) with solid colored `%` pills. |
| **2. Existing Layout** | `src/screens/Web3WalletViews.tsx` (lines 1655–1805, Video 1 `00:11`) shows a `"LIVE WS"` badge in the header, omits the search bar, renders simplified theme cards without inner token rows, omits the `[Star] \| Holdings \| Trending \| Alpha \| Stocks \| Perps` tab bar and chain filter pills, and lists `USDTUSDT 200x` instead of on-chain tokens. |
| **3. Visual Mismatch** | **[High]** Missing the search bar, rich 2×2 `Top Themes` cards, bottom category tabs/chain filters, and on-chain token rows (`STONK`, `FLOAT`, `José`, `STANK`). |
| **4. Missing UI Elements** | **[High]** Search bar (`Top Search: AGC`), inner token rows inside `Top Themes` cards, `[Star] \| Holdings \| Trending \| Alpha \| Stocks \| Perps` tab strip, and `All \| BSC \| Robinhood \| Solana \| Ethereum` chain filter bar. |
| **5. Incorrect Spacing** | **[Low]** Add `mb-4` between `Top Themes` pagination dots and the bottom token table. |
| **6. Incorrect Typography** | **[Low]** Remove `"LIVE WS"` indicator from the top right of the tab bar. |
| **7. Component Sizing** | **[Low]** Right-hand `%` change badges in Web3 Markets (`-9.66%`, `+33.98%`, `-5.60%`, `-21.03%`) are solid colored pills (`w-[72px] h-7 rounded-md font-semibold text-xs text-white`). |
| **8. Navigation Differences** | **[Low]** Clicking any token row opens its on-chain token chart/swap sheet. |
| **9. Required Corrections** | 1. **[High]** Update `Web3MarketsTab` in `src/screens/Web3WalletViews.tsx` to match `00:49`: remove `"LIVE WS"`, add the `"Top Search: AGC"` search bar, upgrade the 3 signal cards and 2×2 `Top Themes` grid, and add the full `[Star] \| Holdings \| Trending \| Alpha \| Stocks \| Perps` + chain filter bar with `STONK`, `FLOAT`, `José`, and `STANK`. |

---

### Screen 9: Web3 Wallet Trade / Swap Screen (`src/screens/Web3WalletViews.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | (`00:50`):<br>1. Top bar: `Swap` (active) \| `Bridge` \| `Pro` \| `Perps` on left; Candlestick chart icon + Settings sliders icon on right.<br>2. `From` card (`BNB`, `BNB Smart Chain`, balance `0 (+)`) and `To` card (`USDT`, `BNB Smart Chain`, balance `5.62`) with overlapping center `⇅` button.<br>3. Full-width `"Enter Amount"` button (`bg-[#655A24] text-[#848E9C] h-12 rounded-xl font-bold`).<br>4. Bottom section: `Open Orders \| Holdings` tabs + history icon; `[ ] Only show current token` + refresh/filter icons; empty state icon + `"No Orders"`. |
| **2. Existing Layout** | `src/screens/Web3WalletViews.tsx` (lines 1810–2058) renders a multi-line `"Demo Exchange Spot Balance Mode"` instructional banner and checkbox above the swap cards, omits the top-right chart and settings icons, and omits the bottom `Open Orders \| Holdings` panel. |
| **3. Visual Mismatch** | **[High]** The instructional banner clutter and missing bottom `Open Orders \| Holdings` section break visual parity with `00:50`. |
| **4. Missing UI Elements** | **[High]** Missing top-right Chart + Settings icons; missing bottom `Open Orders \| Holdings` tabs, `[ ] Only show current token` filter bar, and `"No Orders"` empty state. |
| **5. Incorrect Spacing** | **[Medium]** Swap cards should sit directly below the `Swap \| Bridge \| Pro \| Perps` bar (`mt-2`). |
| **6. Incorrect Typography** | **[Low]** Token sub-labels (`BNB Smart Chain`) use `text-xs text-[#848E9C]`. |
| **7. Component Sizing** | **[Low]** `From` and `To` cards use `rounded-2xl bg-[#202630] p-4`. |
| **8. Navigation Differences** | **[Low]** Clicking the top-right Settings icon opens slippage/swap settings; clicking `Holdings` shows the user's `5.62 USDT` holding. |
| **9. Required Corrections** | 1. **[High]** Remove the `"Demo Exchange Spot Balance Mode"` banner box from `Web3TradeTab` in `src/screens/Web3WalletViews.tsx`.<br>2. **[High]** Add the top-right Chart + Settings icons, set `From` (`BNB`, `0`) and `To` (`USDT`, `5.62`), and add the bottom `Open Orders \| Holdings` section with `"No Orders"` empty state (`00:50`). |

---

### Screen 10: Web3 Wallet Discover Screen (`src/screens/Web3WalletViews.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | (`00:52`): Search bar (`"Search DApps"`), tabs (`Featured \| Earn \| Booster \| Airdrops \| DApps`), `"Grab a share of $2M rewards in TRON Carnival Season 3 / Join Now >"` banner, `"Simple Yield"` (`TVL $1,683,310,415 >`) with `USDC 3.55%` & `USDT 2.16%` + `Locked Products / Lista Lending`, `"Hot Vaults"` (`B USDT 6.15% APR`), and `"Popular DApps >"` (`Venus`, `PancakeSwap`, `Four.Meme`, `Lista DAO`). |
| **2. Existing Layout** | `src/screens/Web3WalletViews.tsx` (lines 2065–2470, Video 1 `00:12`) already implements this layout closely. |
| **3. Visual Mismatch** | **[Low]** Minor card border and spacing refinements needed (`border-[#2B3139]` removal for cleaner flat `#1E2329`/`#202630` surfaces). |
| **4. Missing UI Elements** | None. |
| **5. Incorrect Spacing** | **[Low]** Standardize horizontal padding to `px-4`. |
| **6. Incorrect Typography** | **[Low]** Ensure `Simple Yield` TVL value uses `tabular-nums`. |
| **7. Component Sizing** | Matches reference. |
| **8. Navigation Differences** | Matches reference. |
| **9. Required Corrections** | 1. **[Low]** Polish card surfaces and borders in `Web3DiscoverTab` to match the borderless `#1E2329` / `#202630` aesthetic in `00:52`. |

---

### Screen 11: Web3 Wallet Assets, Portfolio, Send, Receive, History & Approvals (`src/screens/Web3WalletViews.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | (`00:55`–`01:25`, `02:13`–`02:15`):<br>• **Main View (`00:55`):** `[Wallet icon] My Wallet >` + right green Pie-Chart icon; `₹527.89` balance; 4 action buttons (`Send`, `Receive`, `History`, `Approvals`); `"Hold tokens to earn rewards / Up to 5.00% APR"` card; `Tokens \| Stocks \| DeFi \| NFTs \| Perps` tabs + search icon; `Total Assets ₹527.89` + filter icon; `USDT` row (`Up to 11.64% APY`, `₹93.93 +0.01%`, `5.62 / ₹527.89`); collapsible `Low value (5)` accordion (`00:58`–`01:01`: `BNB`, `ETH` BSC, `ETH` Native, `SOL`).<br>• **Portfolio View (`01:02`–`01:09`):** `<- \| Portfolio` header, `Est. Total Value ₹527.89`, `Tokens \| Stocks \| DeFi \| NFTs` tabs, green Donut Chart (`■ USDT 100%`), `Total (1) ₹527.89`, and `USDT` row (`Stocks` shows `"You don't hold any stock assets yet. / Explore Stocks in Market"`).<br>• **Send Token (`01:13`):** Full-screen `<- \| Send Token` with 2 option cards (`Transfer to NexusTrade Exchange`, `Send to Wallet Address`).<br>• **Receive Tokens (`01:15`, `02:08`):** Full-screen `<- \| Receive Tokens` with 3 option cards (`Transfer from NexusTrade Exchange`, `Receive Tokens via Address`, `Buy with P2P`).<br>• **History (`01:18`–`01:21`):** Full-screen `<- \| History` with search input, `My Wallet ▾ \| All Networks ▾`, `2026-11-08`, `↓ Receive From: 0xA010...763bf4 \| +5.62 USDT`, `"No more records found"`.<br>• **Approvals (`01:23`):** Full-screen `<- \| Approvals \| Batch Revoke` with `All Wallets ▾ \| All Protocols ▾ \| All Networks ▾` and `"No records"`. |
| **2. Existing Layout** | `src/screens/Web3WalletViews.tsx` (lines 2480–3400, Video 1 `00:13`–`00:19`) renders a custom 5-pill bar (`Wallets & Balances \| Networks (9) \| Send \| Receive \| Activity`) below the action buttons and displays developer-focused connection boxes (`"1. SELF-CUSTODY WALLET CONNECTIONS"`, `"EVM Networks (EIP-1193)"`, `"1. Verified Self-Custody On-Chain Transactions"`). |
| **3. Visual Mismatch** | **[Critical]** The entire bottom half of Web3 `Assets` and all 5 sub-screens (`Portfolio`, `Send Token`, `Receive Tokens`, `History`, `Approvals`) in NexusTrade diverge from the reference recording (`00:55`–`01:25`). |
| **4. Missing UI Elements** | **[Critical]** 1. Missing `Tokens \| Stocks \| DeFi \| NFTs \| Perps` asset list on Web3 Assets with `USDT` (`5.62` / `₹527.89`) and the expandable `Low value (5)` accordion (`BNB`, `ETH`, `SOL`).<br>2. Missing the **Portfolio Donut Chart** screen (`01:02`–`01:09`) triggered from the top-right Pie-Chart icon.<br>3. Missing the 2-card **Send Token** selector screen (`01:13`).<br>4. Missing the 3-card **Receive Tokens** selector screen (`01:15`, `02:08`).<br>5. Missing the **History** screen (`01:18`–`01:21`) with `+5.62 USDT` receive record.<br>6. Missing the **Approvals** screen (`01:23`) with `"Batch Revoke"`. |
| **5. Incorrect Spacing** | **[High]** Action buttons (`Send`, `Receive`, `History`, `Approvals`) should use `grid-cols-4 gap-3` with `h-12 rounded-2xl bg-[#202630]` boxes. |
| **6. Incorrect Typography** | **[Medium]** Balance `₹527.89` uses `text-[30px] font-bold text-[#EAECEF] tabular-nums`. |
| **7. Component Sizing** | **[Medium]** Token icons in the asset list are `36px` with a `14px` network badge (`BSC` / `Native` pill). |
| **8. Navigation Differences** | **[Critical]** Clicking `Send`, `Receive`, `History`, `Approvals`, or the green `Portfolio` pie-chart icon should open full-screen overlay views matching `01:02`–`01:23` (while keeping wallet creation/import/EIP-1193 connection accessible via the top Wallet-Settings icon or `My Wallet >` selector). |
| **9. Required Corrections** | 1. **[Critical]** Replace the technical connection boxes on Web3 `Assets` (`src/screens/Web3WalletViews.tsx`) with the exact reference layout (`00:55`–`01:01`): `My Wallet >` + green Pie-Chart button, `₹527.89`, 4 action buttons (`Send`, `Receive`, `History`, `Approvals`), `"Hold tokens to earn rewards / Up to 5.00% APR"` card, `Tokens \| Stocks \| DeFi \| NFTs \| Perps` tabs, `Total Assets ₹527.89`, `USDT` (`5.62 / ₹527.89`), and the expandable `Low value (5)` accordion (`BNB`, `ETH`, `SOL`).<br>2. **[Critical]** Implement the 5 full-screen sub-views from `01:02`–`01:25`: **Portfolio Donut Chart**, **Send Token** (2 cards + drilldown to on-chain/exchange transfer), **Receive Tokens** (3 cards + drilldown to QR/address), **History** (`+5.62 USDT` record), and **Approvals** (`Batch Revoke` + filter pills). |

---

### Screen 12: Global Drawers & Modals — Profile/Tasks, Messages & Transfer (`src/components/OverlaysAndDrawers.tsx`, `src/components/TransferModal.tsx`)

| Audit Dimension | Findings & Details |
| :--- | :--- |
| **1. Reference Layout** | • **Profile & Tasks Screen (`01:32`–`01:33`):** Top bar `<-` \| `Settings` + `Theme` icons; Trophy avatar + `UID: 1061155439 [Copy]` + `User-a11dd` + `Verified` / `Regular` badges; `Nexus Support` strip (`Get Support`); 2-column promo cards (`Refer&Earn Together 400 USDC`, `Referral Rush 2026 $550,000`); `My Tasks` card (`Unlock rewards worth 27 PTS today >`, `End Time 03H : 56M`, 7-day check-in bar with Day `6` yellow, `Daily Spot trading ≥ $10` + `Go`, `Complete daily Convert trading` progress bar); bottom `Spot Copy` & `Futures Copy` cards.<br>• **Message Screen (`01:41`–`01:44`):** Top bar `<-` \| `"Message"` \| `Broom` + `+` icons; `Chat \| Square \| Notifications` tabs; `All \| Unread` pills; `Nexus Support`, `P2P Message` (`[New] Chat as User-a11dd`), `Archived Messages`. |
| **2. Existing Layout** | `src/components/OverlaysAndDrawers.tsx` renders `ProfileDrawer` (as a slide-over with Sandbox Ledger State buttons, Shortcut Grid, and More Services) and `NotificationsDrawer` (as a simple notification list). |
| **3. Visual Mismatch** | **[High]** Neither `ProfileDrawer` nor `NotificationsDrawer` matches the reference full-screen `Profile / My Tasks` (`01:32`) and `Message (Chat \| Square \| Notifications)` (`01:41`–`01:44`) layouts. |
| **4. Missing UI Elements** | **[High]** Missing the `My Tasks` card (7-day check-in stepper, `27 PTS`, Spot & Convert task cards), 2-column `Refer&Earn` / `Referral Rush` cards, and `Spot Copy` / `Futures Copy` cards in Profile; missing `Chat \| Square \| Notifications` tabs and `All \| Unread` pills in Message screen. |
| **5. Incorrect Spacing** | **[Low]** Both screens in reference are full-width (`inset-0 bg-[#181A20]`) mobile views rather than partial `max-w-[340px]` side drawers. |
| **6. Incorrect Typography** | **[Low]** `User-a11dd` uses `text-lg font-bold text-[#EAECEF]`; `Verified` badge uses `bg-[#0ECB81]/15 text-[#0ECB81] text-[11px] font-semibold px-2 py-0.5 rounded`. |
| **7. Component Sizing** | **[Low]** 7-day check-in boxes use `grid-cols-7 gap-1.5`. |
| **8. Navigation Differences** | **[Low]** Clicking `"Go"` on Spot or Convert tasks inside `My Tasks` closes the Profile screen and navigates directly to `Trade -> Spot` or `Trade -> Convert`. |
| **9. Required Corrections** | 1. **[High]** Update `ProfileDrawer` in `src/components/OverlaysAndDrawers.tsx` to match the full-screen reference layout (`01:32`–`01:33`) while retaining a discreet collapsible section or settings drawer for sandbox state testing.<br>2. **[High]** Update `NotificationsDrawer` in `src/components/OverlaysAndDrawers.tsx` to match the reference `"Message"` screen (`01:41`–`01:44`) with `Chat \| Square \| Notifications` tabs, `All \| Unread` pills, `Nexus Support`, `P2P Message`, and `Archived Messages`. |

---

## 4. PART D: SHARED DESIGN & COMPONENT PROBLEMS

Across multiple screens, the following systemic design token and component inconsistencies were identified:

1. **System Telemetry & Provenance Badge Pollution (Critical):**
   - **Problem:** Screens inject `LIVE WS`, `LIVE`, `REF`, `SQLite Ledger / Persistent Sync Active`, `Demo Spot Ledger`, `Demo USDⓈ-M Derivatives Ledger`, and `Self-Custody Web3 Vault` banners/pills.
   - **Standardization:** Strip all diagnostic telemetry badges and amber warning banners from consumer views. Real-time prices and ledger persistence should work silently and seamlessly in the background.
2. **Card Surface & Border Overuse (High):**
   - **Problem:** Existing components frequently combine `bg-[#1E2329]` or `bg-[#202630]` with explicit `border border-[#2B3139]`, and even nest bordered boxes inside bordered cards (e.g., `HomeScreen.tsx` Convert card and Onboarding Tasks card).
   - **Standardization:** Use `#181A20` for page background, `#1E2329` for primary cards with `rounded-2xl` (`16px`) and **no outer border**, and `#202630` for search bars, input fields, and secondary pills. Use `1px` dividers (`border-[#2B3139]/60`) only where explicitly shown in the reference.
3. **Inconsistent Primary & Disabled Button Tokens (High):**
   - **Problem:** Primary CTA buttons vary in height (`h-9`, `h-10`, `h-11`, `py-3.5`), radius (`rounded-lg`, `rounded-xl`), and disabled/empty states.
   - **Standardization:**
     - **Compact Card CTA** (e.g., Home `Onboarding Tasks -> Trade`, Home `Convert`): `h-10 rounded-lg font-semibold text-sm`.
     - **Full-Screen Form CTA** (e.g., Trade `Convert -> Preview`, Web3 `Swap -> Enter Amount`, Futures `Activate Options Account`): `h-11` or `h-12 rounded-xl font-bold text-sm`.
     - **Color Tokens:** Active Primary Yellow `#FCD535` with `#181A20` text; Empty/Muted Yellow-Olive `#655A24` with `#848E9C` text (`00:14`, `00:20`, `00:50`); Active Buy Green `#0ECB81` with `#FFFFFF` text; Active Sell Red `#F6465D` with `#FFFFFF` text; Empty/Muted Sell Red `#7A2736` with `#848E9C` text (`00:18`); Secondary Action Button `#2B3139` with `#EAECEF` text.
4. **Tab Bar Hierarchy & Indicator Styles (Medium):**
   - **Problem:** Some top-level mode bars (`TradeScreen.tsx`, `AssetsScreen.tsx`) use full-width bottom borders or yellow underlines where the reference uses clean typographic contrast.
   - **Standardization:**
     - **Top-Level Screen Mode Bars** (`Convert | Spot | Stocks | P2P | Alpha`, `Overview | Spot | Futures`, `For You | Favorites | Crypto`): Active tab is `text-[#EAECEF] font-bold` (`16px–18px`), inactive is `text-[#848E9C] font-medium` (`14px–15px`), **no** yellow underline bar.
     - **Content Section Sub-Tabs** (`Discover | Following | Stocks`, `Tokens | Stocks | DeFi | NFTs | Perps`, `Open Orders | Holdings`): Active tab has `text-[#EAECEF] font-semibold` + short centered `w-4 h-[3px] rounded-full bg-[#F0B90B]` bottom indicator.
     - **Filter Pill Strips** (`Instant | SIP | Limit`, `All | BSC | Robinhood | Solana | Ethereum`, `1D | 7D | 1M`): Active pill uses `bg-[#202630]` or `bg-[#2B3139] text-[#EAECEF] rounded-md px-2.5 py-1 text-xs font-medium`.
5. **Default Trading Pair & Currency Formatting (High):**
   - **Problem:** `ExchangeContext.tsx` initializes `activeSymbol` to `'USDTUSD'`, causing `Spot` and `Futures` to open on a flat `$1.00` stablecoin chart/orderbook.
   - **Standardization:** Initialize `activeSymbol` to `'BTCUSDT'` so `Spot` and `Futures` open on `BTC/USDT` (`~$75,798.46`), matching `00:17`. Retain `₹` (`INR`) secondary fiat equivalents (`₹527.89`, `₹17,749.21`, `₹7,128,845.16`) where shown in the reference.

---

## 5. PART E: EXACT FILES REQUIRING MODIFICATIONS (PHASE 2 SCOPE)

No files have been modified in Phase 1. Upon approval of this audit, the following files will be updated in Phase 2:

1. **`src/context/ExchangeContext.tsx`**
   - Line `1303`: Change initial `activeSymbol` default from `'USDTUSD'` to `'BTCUSDT'`.
   - Ensure default Web3 Wallet state initializes with `My Wallet` active (`5.62 USDT` / `₹527.89` equivalent + `Low value (5)` tokens `BNB`, `ETH`, `SOL`) so Web3 Home and Web3 Assets match the reference out of the box while still supporting custom wallet creation/import/transactions.
2. **`src/App.tsx`**
   - Lines `118–178`: Refine top global header (`Exchange | Wallet` toggle styling, dynamic `"Assets"` header with Shield & Wallet icons on Web3 Assets, and brief `"Welcome to NEXUSTRADE Wallet"` mode-switch transition splash).
   - Lines `204–245`: Replace the solid yellow circle on the active `Trade` bottom nav button with the reference 2-tone circular swap-arrows icon.
3. **`src/screens/HomeScreen.tsx`**
   - Lines `178–206`: Update top search bar with rotating hot queries (`"🔥 BTC is trending now"`) and right-side QR scanner icon.
   - Lines `209–600`: Hide the `"Unconnected / LIVE WS"` block when balance is `0`, place `Onboarding Tasks 3/3` directly below the search bar, remove the inner USDT box inside `Onboarding Tasks`, update bottom guide row to `"Spot Trading Explained: A Beginner's Guide"`, and remove the non-reference `"Community Appreciation"` banner.
   - Lines `603–718`: Restyle the `Convert >` card into a flat unified card (`> 0.01` and `> 0.00000013` placeholders, single horizontal divider + center swap button, dark `Convert` button).
   - Lines `721–1040`: Update `Earn >` (`USDC 9.14%`, `U 8.15%`), `BNB >` (`▲ 0.36%` directly under price), and `Stocks` (`NVDA`, `MU`, `AMD` with `₹` fiat subtext and no `"Stock"` badge); remove the duplicate Market Watchlist section above the `Discover` social feed.
4. **`src/screens/MarketsScreen.tsx`**
   - Lines `220–635`: Remove `LIVE WS` / `LIVE` / `REF` badges; update `For You` tab to render `Smart Tracker - Mine` (`TRUMP -5.09% Pullback`), `Master Trades >` (3-column cards), and `Indices >` (`TRUMP FLAT` inflow/outflow bar + 3-ticker strip) matching `00:13`.
5. **`src/screens/TradeScreen.tsx`**
   - Lines `115–135`: Set `showChart` to `false` by default on `Spot` (togglable via the candlestick icon in the pair bar).
   - Lines `335–485`: Update `Convert` tab (`Instant | SIP | Limit` + right chart/history icons, `> 0.01` / `> 0.00000013` placeholders, `Preview` button).
   - Lines `495–1045`: Update `Spot` tab (remove demo warning banner, add `"🔥 Hot Campaign"` strip, match 2-column Order Ticket + Live Order Book layout at `00:17`, and add `"Available Funds: 0.00 USDT / Add Funds"` empty state under `Open Orders (0)`).
   - Lines `1054–1164`: Update `Stocks` tab (`AAPL ▾`, `Mid Closed $342.822 +0.13%`, `Receive to USDC`, `Preview` button, `12,000 USDC` welcome banner, and bottom `Open Orders (0) | Positions (0) | Recurring (0)` section).
   - Lines `1169–1317`: Add the **P2P Express** numpad view (`00:20`–`00:22`: `Express | P2P | Block Trade | Lifestyle`, `Buy | Sell`, `0 INR ▾`, `Lightning UPI`, preset pills, 3×4 numeric keypad, P2P bottom bar) alongside the `P2P` merchant list.
6. **`src/screens/FuturesScreen.tsx`**
   - Lines `170–775`: Remove amber disclaimer banners; ensure `USDⓈ-M` defaults to `BTCUSDT Perp`; overhaul `Options` (`00:25`–`00:28`) with `ETH ▾` + countdown expiry tabs, `"Trade U.S. Stock Options"` promo banner, `Ask / IV | Bid / IV | Strike | Ask / IV | Bid / IV` 5-column T-Chain, and sticky bottom `"Activate Options Account"` CTA card.
7. **`src/screens/AssetsScreen.tsx`**
   - Lines `250–960`: Overhaul Exchange `Assets -> Overview` (`00:29`–`00:32`, `01:47`–`01:50`) with `Overview | Spot | Futures` tabs, `Est. Total Value` + `₹0.00`, yellow portfolio line chart (`₹529.50` / `₹268.98`) + `1D | 7D | 1M | 6M | 1Y` pills, recent status ticker rows (`Crypto withdraw 5.62 USDT`, `P2P buy 2.77 USDT`), and the `Crypto` card (`USDT`, `XRP`, `USD1` with APRs and `Add Funds` / `Add More Assets` buttons).
8. **`src/screens/Web3WalletViews.tsx`**
   - Lines `750–1160` (`Web3HomeTab`): Render active `My Wallet > [Copy]`, `₹527.89` balance, yellow `Receive` button, interactive `1D | 7D | 30D` yellow line chart (`02:00`–`02:07`), 5 shortcut icons, 3-slide promo carousel (`Agent ID`, `TRON Carnival`, `Kamino USDC`), `Tracker`/`Earn` bento, and on-chain `Trending` tokens (`FLOAT`, `José`, `STONK 10x`, `STANK`, `HYPE`).
   - Lines `1655–1805` (`Web3MarketsTab`): Add `"Top Search: AGC"` search bar, 3 signal cards, 2×2 `Top Themes` grid with inner token rows, and `[Star] | Holdings | Trending | Alpha | Stocks | Perps` + chain filters (`00:49`).
   - Lines `1810–2058` (`Web3TradeTab`): Remove demo instructional box, add top-right Chart + Settings icons, and add bottom `Open Orders | Holdings` panel (`00:50`).
   - Lines `2480–3400` (`Web3AssetsTab`): Render the exact reference Web3 Assets view (`00:55`–`01:01`) with `My Wallet >` + green Pie-Chart icon, `₹527.89`, 4 action buttons (`Send`, `Receive`, `History`, `Approvals`), `"Hold tokens to earn rewards Up to 5.00% APR"`, `Tokens | Stocks | DeFi | NFTs | Perps` tabs, `Total Assets ₹527.89`, `USDT` (`5.62 / ₹527.89`), expandable `Low value (5)` accordion (`BNB`, `ETH`, `SOL`), and the 5 full-screen sub-views (**Portfolio Donut Chart** `01:02`, **Send Token** `01:13`, **Receive Tokens** `01:15`, **History** `01:18`, and **Approvals** `01:23`).
9. **`src/components/OverlaysAndDrawers.tsx`**
   - Rebuild `ProfileDrawer` (`01:32`–`01:33`: User header, `Nexus Support`, `Refer&Earn` / `Referral Rush` bento, `My Tasks` with 7-day check-in & Spot/Convert task progress, `Spot Copy` / `Futures Copy`) and `NotificationsDrawer` (`01:41`–`01:44`: `"Message"` screen with `Chat | Square | Notifications` and `All | Unread`).

---

## 6. RECOMMENDED IMPLEMENTATION ORDER (PHASE 2)

1. **Step 1 — Core State, Default Symbols & Global Shell (`ExchangeContext.tsx`, `App.tsx`, `index.css`):**
   - Set default pair to `BTCUSDT`, initialize default Web3 Wallet portfolio state (`5.62 USDT` / `₹527.89` + `Low value (5)` tokens), fix the active `Trade` bottom nav icon, add the `"Welcome to NEXUSTRADE Wallet"` splash transition, and support the dynamic Web3 `Assets` top header.
2. **Step 2 — Exchange Home & Markets Screens (`HomeScreen.tsx`, `MarketsScreen.tsx`):**
   - Align Home screen vertical flow (`Search` -> `Onboarding Tasks 3/3` -> flat `Convert >` card -> `Earn / BNB` bento -> `Stocks` with `₹` subtext -> `Discover` feed) and rebuild `Markets -> For You` (`Smart Tracker - Mine`, `Master Trades`, `Indices`).
3. **Step 3 — Exchange Trade & Futures Screens (`TradeScreen.tsx`, `FuturesScreen.tsx`):**
   - Collapse Spot chart by default so the 2-column `BTC/USDT` Order Ticket + Live Order Book is immediately visible (`00:17`); complete `Convert` and `Stocks` (`00:14`, `00:18`); build **P2P Express** numpad view (`00:20`–`00:22`); overhaul `Futures -> Options` (`00:25`–`00:28`) with the 5-column `Ask / IV | Bid / IV | Strike` T-Chain and sticky `"Activate Options Account"` banner.
4. **Step 4 — Exchange Assets Screen (`AssetsScreen.tsx`):**
   - Replace the developer ledger console on `Assets -> Overview` with the consumer portfolio view (`00:29`–`00:32`, `01:47`–`01:50`): `Est. Total Value`, yellow portfolio line chart (`1D | 7D | 1M | 6M | 1Y`), recent transaction status rows, and `Crypto` card (`USDT`, `XRP`, `USD1`).
5. **Step 5 — Web3 Wallet Suite (`Web3WalletViews.tsx`):**
   - Upgrade Web3 `Home` (`₹527.89` + `Receive` button + `1D | 7D | 30D` yellow line chart + 3-slide carousel + on-chain trending tokens), Web3 `Markets` (`00:49`), Web3 `Swap` (`00:50`), and Web3 `Assets` (`00:55`–`01:25`) including `Low value (5)` accordion, **Portfolio Donut Chart**, **Send Token**, **Receive Tokens**, **History**, and **Approvals**.
6. **Step 6 — Profile / Tasks & Message Full-Screen Drawers (`OverlaysAndDrawers.tsx`):**
   - Complete the `Profile / My Tasks` (`01:32`) and `Message` (`01:41`–`01:44`) screens and run full compilation, lint, and visual verification.

---

## 7. VISUAL REGRESSION CHECKLIST

- [ ] **Zero Diagnostic Clutter:** No `LIVE WS`, `LIVE`, `REF`, `SQLite Ledger`, `Demo Spot Ledger`, or `Demo Derivatives Ledger` badges/banners appear anywhere in the primary UI.
- [ ] **Global Navigation:** Top `Exchange | Wallet` toggle is borderless (`bg-[#202630]`); active `Trade` bottom tab uses the 2-tone circular swap-arrows icon rather than a solid yellow circle; switching to `Wallet` triggers the brief `"Welcome to NEXUSTRADE Wallet"` splash.
- [ ] **Exchange Home (`00:00`–`00:12`):** Search bar has right QR scan icon; `Onboarding Tasks 3/3` sits directly below Search when balance is `0` with `"Spot Trading Explained: A Beginner's Guide"`; `Convert >` uses flat `From`/`To` rows with `> 0.01` / `> 0.00000013`; `BNB` card shows `▲ 0.36%` directly below `697.09`; `Stocks` shows `NVDA`, `MU`, `AMD` with `₹` subtext and no `"Stock"` tag; `Discover` feed follows immediately after `Stocks`.
- [ ] **Exchange Markets (`00:13`):** `For You` tab renders `Smart Tracker - Mine` (`TRUMP -5.09%`), `Master Trades >` (3-column cards), and `Indices >` (`TRUMP FLAT` inflow/outflow bar + 3-ticker strip).
- [ ] **Exchange Trade (`00:14`–`00:23`):**
  - `Convert` shows `Explore SIP` banner, `Instant | SIP | Limit` + 2 right icons, `> 0.01` / `> 0.00000013`, and `Preview` button.
  - `Spot` opens to `BTC/USDT` with the 2-column Order Ticket (left) and Live Order Book (right) immediately visible above the fold, and `Open Orders (0) | Holdings (1) | Bots` + `"Available Funds: 0.00 USDT / Add Funds"` below.
  - `Stocks` shows `AAPL ▾`, `Buy | Sell` + `Market ▾`, `Shares (Min 0.01531407)`, `Receive to USDC`, `Preview`, `12,000 USDC` banner, and `Open Orders (0) | Positions (0) | Recurring (0)`.
  - `P2P` opens to `Express` mode with `Buy | Sell`, `0 INR ▾`, `Lightning UPI`, preset pills, 3×4 numeric keypad, and P2P bottom nav.
- [ ] **Exchange Futures (`00:24`–`00:28`):** `USDⓈ-M` defaults to `BTCUSDT Perp`; `Options` shows `ETH ▾` with countdown expiry pills, `"Trade U.S. Stock Options"` promo banner, `Ask / IV | Bid / IV | Strike | Ask / IV | Bid / IV` columns, and sticky bottom `"Activate Options Account"` banner.
- [ ] **Exchange Assets (`00:29`–`00:32`, `01:47`–`01:50`):** Top bar shows `Overview | Spot | Futures`; `Overview` displays `Est. Total Value ₹0.00`, yellow portfolio line chart (`₹529.50` / `₹268.98`) + `1D | 7D | 1M | 6M | 1Y` pills, recent status tickers (`Crypto withdraw 5.62 USDT`, `P2P buy 2.77 USDT`), and `Crypto` card (`USDT`, `XRP`, `USD1` with `Add Funds` & `Add More Assets`).
- [ ] **Web3 Wallet Home (`00:36`–`00:45`, `02:00`–`02:12`):** Displays `My Wallet > [Copy]`, `₹527.89` + yellow `Receive` button, interactive `1D | 7D | 30D` yellow line chart, 5 shortcut icons, 3-slide promo carousel, `Tracker`/`Earn` bento, and on-chain `Trending` list (`FLOAT`, `José`, `STONK 10x`, `STANK`, `HYPE`).
- [ ] **Web3 Wallet Markets & Swap (`00:49`–`00:50`):** Web3 `Markets` includes search bar, 3 signal cards, 2×2 `Top Themes` with inner rows, and on-chain token table; Web3 `Swap` includes top-right Chart/Settings icons and bottom `Open Orders | Holdings` section.
- [ ] **Web3 Wallet Assets & 5 Sub-Screens (`00:55`–`01:25`, `02:13`–`02:15`):** Displays `"Assets"` top bar, `My Wallet >` + green Pie-Chart button, `₹527.89`, `Send / Receive / History / Approvals` buttons, `Up to 5.00% APR` banner, `Tokens | Stocks | DeFi | NFTs | Perps` tabs, `USDT (5.62 / ₹527.89)`, expandable `Low value (5)` accordion (`BNB`, `ETH`, `SOL`), and full-screen views for **Portfolio Donut Chart**, **Send Token**, **Receive Tokens**, **History**, and **Approvals**.
- [ ] **Profile & Message Screens (`01:32`–`01:44`):** Profile screen includes `My Tasks` (`27 PTS`, 7-day check-in bar, Spot/Convert tasks) and `Refer&Earn` cards; Message screen includes `Chat | Square | Notifications` and `All | Unread` pills.
