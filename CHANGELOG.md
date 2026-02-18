# Changelog

All notable changes to NextDNS DNS Matrix are documented here.

## [1.1.0] — 2026-02-18

### Added
- **DoH resolver selection** — choose between Google, Cloudflare, or AdGuard for IP resolution. Useful when one provider is blocked or restricted on your network.

### Fixed
- **Replaced Quad9 with AdGuard DNS** — Quad9 retired their browser-compatible JSON API (port 5053) on May 5, 2025. Their standard DoH endpoint lacks CORS headers, making it unusable from browsers. Replaced with AdGuard DNS (`dns.adguard-dns.com/resolve`), which uses the same JSON response format and supports browser CORS.
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
