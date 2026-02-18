# Changelog

All notable changes to NextDNS DNS Matrix are documented here.

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
