# Changelog

All notable changes to NextDNS DNS Matrix are documented here.

## [Unreleased]

### Added
- **DoH resolver selection** — choose between Google, Cloudflare, or Quad9 for IP resolution. Useful when Google services are blocked on your network.

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
