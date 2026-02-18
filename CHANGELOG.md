# Changelog

All notable changes to NextDNS DNS Matrix are documented here.

## [1.1.0] — 2026-02-18

### Added
- **DoH resolver selection** — choose between Google, Cloudflare, or Quad9 for IP resolution. Useful when Google services are blocked on your network.

### Fixed
- **Quad9 CORS fallback** — Quad9's standard DoH endpoint (`dns.quad9.net/dns-query`) does not send CORS headers, so browsers silently block all responses. Selecting Quad9 now shows a clear warning and automatically falls back to Google for IP resolution.
- **Quad9 DoH endpoint updated** — Quad9 permanently retired their JSON-over-HTTPS service on port 5053 (May 5, 2025). Quad9 config now points to the standard DoH endpoint on port 443.
- **Quad9/Cloudflare rate limiting** — reduced batch size and added inter-batch delay to prevent 429 errors from Cloudflare and Quad9 resolvers.

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
