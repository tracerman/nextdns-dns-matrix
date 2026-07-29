# Changelog

All notable changes to NextDNS DNS Matrix are documented here.

## [2.1.0] — 2026-07-28

### Added
- **Complete route-board redesign** — the benchmark is now the clear first action, the full IPv4/IPv6 route register remains the primary evidence, and optional configuration values stay secondary.
- **Truthful benchmark phase rail** — Discover, Probe, Refine, Resolve, and Rank expose the real stage of a run before the measured result locks into the route register.
- **Dual-stack native Asus guides by default** — when both IPv6 anycast members are measured, Reliable emits Anycast DNS1/DNS2 over IPv4 and IPv6, Balanced emits each family’s lowest-latency edge plus its fastest anycast member, and Maximum performance emits the independently selected lowest-latency edge for each family.
- **Asus address-family choice** — users can switch the generated active set to IPv4-only. Shared guide links preserve this choice without carrying the NextDNS profile ID.

### Changed
- Asus mode estimates and clear-advantage gating now include every emitted IPv4 and IPv6 active upstream.
- IPv4 and IPv6 pinned targets are selected independently by measured latency instead of forcing IPv6 onto the IPv4 winner’s PoP. Each pinned address retains its matching family-specific DoH hostname.
- Asus runbooks distinguish WAN DoT upstream addresses from LAN IPv6 DNS advertisement: the IPv6 page advertises the router’s LAN link-local address, not a NextDNS upstream.
- The current NextDNS connection is a compact header readout rather than a competing hero panel, and completion/copy feedback now uses bounded reduced-motion-safe board transitions.

## [2.0.0] — 2026-07-27

### Added
- **Asus native-DoT operating modes** — Reliable emits two anycast upstreams, Balanced emits one measured PoP plus anycast, and Maximum performance emits one pinned PoP. Each mode shows its active entry set and an arithmetic-mean transport RTT estimate instead of pretending every configured row waits as a fallback.
- **Finalist refinement and robust variation** — both anycast members, both ultralow members, and the leading edge candidates receive seven randomized, interleaved, non-concurrent checks. Rankings now use median server RTT and MAD instead of mean and range.
- **Clear measured advantage gate** — route preferences and pinning use `max(3ms, 5% of the baseline median, combined MAD)`. The UI presents this as a conservative decision rule rather than statistical significance.
- **Profile-free pin monitor and run history** — saved pins are checked for DNS rotation on load and can be remeasured for degradation. The newest ten benchmark summaries remain local and store endpoint identity, IP, median, MAD, timestamp, and recommendation, never the NextDNS config ID.
- **Unified routing cards** — Stable / Anycast, Steered / Ultralow, and Direct / Pinned now appear as comparable choices with their own DoH URL, IPv4 and IPv6 latency, matching addresses, trade-off, and one shared recommendation badge.
- **Copy feedback and keyboard semantics** — generated values are real buttons with visible copy confirmation; scrollable result tables and the AI prompt are named, focusable regions.
- **Guided setup flow** — the former accordion catalog is now Scope → Device / variant → Show setup → Best compatible setup → visible runbook → scoped verification. It covers routers and firewalls, computers and mobile, browsers and ChromeOS, and server/DNS deployments without showing every platform at once.
- **Capability-aware runbooks** — every primary path includes prerequisites, paste-ready values, numbered steps, platform-specific recovery, official sources, and a last-checked date. Android automatically avoids pinned routes; Pi-hole requires a local encrypted proxy; browser paths are labeled browser-only.
- **Safe guide sharing** — generated device/variant/mode deep links remove `id`, `ID`, `configId`, and `config` before copying.
- **Active connection re-check** — a randomized `test.nextdns.io` lookup distinguishes expected profile, different profile, unknown profile, and not detected while explicitly limiting the claim to this browser.

### Fixed
- **Ultralow IPs could be frozen into bootstrap configurations.** Ultralow resolved addresses are now diagnostic only. Devices that require bootstrap IPs exclude ultralow, while dynamic hostname and URL clients retain it.
- **Asus “fallback” rows were actually active upstreams.** Verified Merlin configuration uses Stubby round robin, so native Asus guides no longer label later rows primary/backup or emit four entries. Balanced mode quantifies the dilution created by sharing traffic with anycast.
- **Fallback browser timing could receive a normal rank.** Full HTTPS duration rows remain visible with a `client measured` badge but sort after every server-RTT row and receive no numeric rank or recommendation.
- **Route-to-PoP badges could relabel an edge measurement.** Mapped anycast/ultralow routes now appear as explicit `via` badges while the row stays labeled edge, so a direct-edge RTT is not presented as the routed hostname's RTT.
- **Windows could receive an address and DoH template from different routes.** Setup-guide values now come from the recommended routing tier as one matched pair, with an explicit warning not to mix cards.
- **Windows alternate servers could be under-specified.** Every preferred and alternate address is now registered independently with its matching DoH template, limited to the two slots Windows exposes per address family.
- **Recommendations could contradict each other.** The insight box, routing cards, pin section, device guide, and AI prompt now consume one routing model. Direct pinning is recommended only when it clears the measured threshold.
- **Dual-stack URLs were presented with IPv4-only latency.** Each routing card now reports IPv4 and IPv6 separately and keeps both family addresses with the URL they belong to.
- **Raw addresses could look profile-aware when used as plain DNS.** The linked-IP warning now sits directly beside the bootstrap addresses and distinguishes encrypted-DNS bootstrap from unencrypted DNS use.
- Copyable table values now inherit the surrounding text color instead of falling back to the browser's button color.

### Changed
- URL prefills now use `#id=` fragments, are removed immediately after reading, and are protected by a `no-referrer` policy. Legacy query prefills remain accepted and are sanitized for compatibility.
- Bootstrap output is labeled as an address reference rather than an ordered primary/fallback prescription; Guided Setup owns device-specific entry counts.
- Pinned details remain available as an informed alternative even when automatic steering is recommended.
- JavaScript animation respects `prefers-reduced-motion`; semantic landmarks, live status, progress metadata, focus treatment, and contrast were tightened across the page.
- Config-ID validation and URL prefill now accept only the supported identifier format.
- Setup remains useful before benchmarking with a neutral Standard encrypted route and no performance claim; a completed run adds the measurement timestamp and device-compatible personalization.
- The assistant fallback is collapsed by default and inherits the selected device and compatible route while keeping the real config ID out of the prompt.

## [1.6.0] — 2026-07-26

### Added
- **Pin to Lowest-Latency Server** — new section that closes the gap between what the benchmark finds and what you can actually configure. When a specific edge server beats both anycast and ultralow by more than 3ms, it emits the pinned DoH URL (`https://{server}.edge.nextdns.io/{configId}`) and a NextDNS CLI forwarder string with anycast failover. When pinning wouldn't help, it says so rather than recommending it anyway. Raised by [SeriousHoax on r/nextdns](https://www.reddit.com/r/nextdns/).
- **Pinned config carries its own disclaimer** — NextDNS does not officially recommend pinning; a pinned server going offline takes your DNS with it. Stated on the card itself, alongside the failover form that mitigates it.
- **All three DoH tiers in the config panel** — anycast, ultralow, and (when it wins) pinned, each with its measured latency and its trade-off, so the choice is made on numbers rather than on our ranking. The anycast DoH URL (`https://anycast.dns1.nextdns.io/{configId}`) was previously not offered at all; the panel had anycast IPs but no anycast DoH string.
- `server` (e.g. `vultr-bom-1`) is now retained from the router API alongside `pop` (`vultr-bom`). The bare `{server}.edge.nextdns.io` host is dual-stack and is the only form usable as a pinned DoH URL.

- **"Where do I paste this?" setup guide** — a collapsible section covering generic routers (organised by capability, not brand), Asus/Merlin, pfSense/OPNsense/unbound, the NextDNS CLI, Windows 11, Android, browsers, and Apple devices. Values fill in with your own after a run. Prompted by the same Reddit thread: the tool handed you strings without saying where they go. Every menu path was verified against vendor documentation rather than written from memory.
- **Pinned server now shows both IPv4 and IPv6 addresses.** Pinning gives up automatic failover, so a second address family is the nearest substitute — if one stack breaks, the other still resolves. Use both anywhere a client accepts two entries (manual DNS, DoT server lists, a router's separate IPv4/IPv6 pages). If the pinned server has no IPv6 address, the section says so rather than leaving you silently single-stacked. The guide carries the same rule, noting that separate IPv4/IPv6 pages are exactly why people end up configuring one family and leaving the other pointed at their ISP.
- **Plain-DNS linked-IP warning.** Unencrypted IPv4 has nowhere to carry your config ID, so NextDNS identifies you by public IP — which must be registered at my.nextdns.io, using the profile-specific addresses shown there rather than the `.0` anycast IPs. Without it DNS resolves normally while no blocklists apply, which is silent and easy to miss. IPv6 needs no linking.

### Fixed
- **The DoT and DoH rows did not say which addresses to pair them with.** The panel listed the IPv4 and IPv6 addresses and the DoT hostname, but nothing connected them — a DoT client wants an IP *plus* the hostname, one pair per family, and that was left implicit. Both rows now carry a pairing note. The DoH note also states that these are dual-stack hostnames, so there is deliberately no per-family URL, while pointing out that clients pairing an IP with a DoH template (Windows 11) take the addresses above.
- **The pinned DoH URL and the pinning disclaimer vanished when pinning was not recommended.** Both the config panel row and the pin section were gated on the >3ms threshold, so if steered routing was already good enough the pinned URL appeared nowhere on the page — and the disclaimer went with it, making the warning invisible to exactly the people most likely to go and pin manually anyway. Recommending against something is not a reason to withhold it: the verdict now changes, but the strings and the disclaimer are always shown, under an explicit "If you want to pin anyway" heading.
- **Latency could be reported lower than reality.** `benchmarkServer` decided whether to use server-reported RTT from the first round alone. If a later round returned no `rtt`, `null / 1000` evaluated to `0` — zeroing `minMs` and dragging the average down, making a server look faster than it was. Samples are now filtered individually, and the metric used (`server` vs `client`) is recorded so the two are never mixed when ranking.
- **Detected-server highlighting landed in the wrong table on dual-stack connections.** Highlighting was scoped by `hasIPv6`, which only reports whether the *browser* can reach NextDNS over IPv6 — not which family the DNS connection uses. The detected PoP is now highlighted wherever it appears, with per-table latency deltas.

### Changed
- Consolidated the two divergent HTML escapers into a single `escAttr()` for attribute position. `escHtml()` is textContent-based and does not escape quotes, so it was unsafe in the `data-copy="…"` attributes it was being used for.
- README: documented pinning end to end, corrected the "based on your active protocol" claim, and updated the stale bento-grid description of the config panel.

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
