# Changelog

All notable changes to NextDNS DNS Matrix are documented here.

## [1.5.0] — 2026-02-18

### Added
- **Current PoP indicator** — the insight box now shows which PoP anycast is currently routing you to (e.g., "Anycast routes you to: **hetzner-iad** [US] Ashburn · 19ms"). The `/info` API response for the anycast endpoint reveals the active PoP, which is the same routing path DNS uses.
- **Table row highlight** — the edge server row matching your current anycast PoP is highlighted with a subtle cyan tint and a `▶` marker in the rank column, making it easy to spot where you are in the ranking.

## [1.4.0] — 2026-02-18

### Added
- **Animated banner header** — gradient title text (cyan → white → magenta), animated cycling gradient border via CSS mask technique, ambient radial glow from bottom, and a pulsing green "live" dot.
- **Footer pill links** — NextDNS, yokoffing/NextDNS-Config, and repo links are now styled pill buttons with hover states. Note and credit lines have clear typographic hierarchy.

### Changed
- **Bento equal-height rows** — removed `align-items: start` from the config grid; cards in the same row now stretch to equal height (default CSS grid behavior).

## [1.3.0] — 2026-02-18

### Fixed
- **Country code badges** — replaced Regional Indicator emoji (broken on Windows) with styled CSS `<span class="cc-badge">` badges showing the 2-letter ISO code next to the city name. Works cross-platform.
- **Bento whitespace** — Asus Router card now uses an internal 2-column CSS grid, halving its vertical height. Config block padding reduced (`1rem 1.25rem` → `0.75rem 1rem`). Grid gap reduced to `0.75rem`. Entry margins tightened throughout recommendation cards.

### Changed
- Config grid now uses `align-items: start` so cards only expand to their content height.

## [1.2.0] — 2026-02-18

### Added
- **Flag emojis in location column** — ISO country codes from the `/info` API are converted to Regional Indicator flag emoji (e.g. 🇺🇸 Ashburn). Falls back gracefully for non-standard location strings.
- **Insight box stat pills** — tested / reachable / unreachable counts are now styled pill badges with color coding (green = reachable, red = unreachable). The main insight and note lines are structured divs instead of `<br>` concatenation.
- **Inline latency sparkbars** — each row in the Avg column now shows a 2px proportional bar beneath the latency number, scaled relative to the slowest server in the table. Inherits the green/yellow/red latency color.
- **Styled server badges** for unreachable servers — the error list now renders each server as a small red badge instead of comma-separated plain text.
- **Section header cyan accent** — "Benchmark Results" and "Recommended Configuration" headers now have a 3px cyan left-border accent via `::before`.

## [1.1.0] — 2026-02-18

### Added
- **DoH resolver selection** — choose between Google and Cloudflare for IP resolution. Useful when one provider is restricted on your network.

### Fixed
- **Removed non-functional resolvers** — Quad9 retired their browser-compatible JSON API (port 5053) on May 5, 2025; their standard DoH endpoint and AdGuard DNS both lack `Access-Control-Allow-Origin: *` headers, causing silent failures when the tool is opened as a local file (`origin: null`). Only Google and Cloudflare reliably support browser CORS for this use case.
- **Cloudflare rate limiting** — reduced batch size and added inter-batch delay to prevent 429 errors from the Cloudflare resolver.

### Changed
- Progress status now shows which DoH resolver is being used during IP resolution.

## [1.0.0] — 2025-05-01

### Added
- Initial release: single-file browser-based DNS benchmark tool.
- Discover all NextDNS PoP, anycast, and ultralow servers via `router.nextdns.io`.
- Benchmark each server with configurable rounds (1/3/5/10).
- Resolve server IPs via Google DoH API.
- Rank servers by latency with optional type preference (auto/ultralow/anycast).
- Generate ready-to-paste configs: Asus DoT, DoH, DoT hostname, plain DNS IPs.
- IPv4 and IPv6 support.
- Dark monospace UI, copy-to-clipboard, color-coded latency.
