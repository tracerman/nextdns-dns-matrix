# NextDNS DNS Matrix

**Find the fastest NextDNS servers for your network.** Open a single HTML file in any browser — no install, no dependencies, no backend.

Benchmarks all available NextDNS PoPs (anycast, ultralow, and individual servers) and recommends the optimal DNS configuration with ready-to-paste strings for Asus routers, DoH, DoT, and plain DNS.

## Quick Start

1. Download [`index.html`](index.html) (or clone this repo)
2. Open it in any modern browser
3. Enter your NextDNS config ID (from [my.nextdns.io](https://my.nextdns.io) → Setup)
4. Click **Run Benchmark**
5. Copy the recommended config strings

That's it. No server, no build step, no dependencies.

## Why?

NextDNS gives you a default DNS config, but it's not always the fastest. Their infrastructure has three tiers:

| Type | What It Is | Pros | Cons |
|------|-----------|------|------|
| **Anycast** | Global IPs (`45.90.28.0` / `45.90.30.0`) routed via BGP | Stable, auto-failover, never changes | BGP routing ≠ lowest latency |
| **Ultralow** | DNS-steered unicast IPs via `*.dns.nextdns.io` | Dynamically picks "closest" PoP | Requires encrypted DNS (DoT/DoH) |
| **PoP Servers** | Individual servers (e.g., `tier-clt`, `hetzner-iad`) | Can be fastest for your location | IPs rotate, servers go down |

**The problem:** These IPs rotate, servers go down, and the "best" option changes based on your ISP routing. This tool benchmarks them all and tells you which to use *right now*.

## What It Shows

- **Results table** with columns: Rank, Node ID, Location, Type, Hostname, IP, Avg latency, Min, Jitter, Success rate
- **IPv4 and IPv6 recommendations** — best + backup server for each, with resolved IPs
- **Config strings** — Asus DoT (separate IP + Hostname fields), DoH, DoT, plain DNS — all with copy-to-clipboard
- Color-coded latency: green (<20ms), yellow (<40ms), red (>=40ms)

## Server Preference Modes

| Mode | Best For |
|------|----------|
| **Auto** (default) | Most users — pure latency wins |
| **Ultralow** | ISPs with good NextDNS peering |
| **Anycast** | Maximum reliability, stable IPs |

**How preference works:** Within a tolerance window (default 10ms), preferred servers win. So if you prefer ultralow and ultralow is 25ms vs another server at 20ms, ultralow wins. But if the other server is 5ms and ultralow is 25ms, latency still wins — preference doesn't override huge differences.

## How It Works

Uses two NextDNS APIs (both CORS `*`):

1. **`GET https://router.nextdns.io/?source=ping`** — returns PoP servers geo-tailored to your location
2. **`GET https://{hostname}/info`** — returns `{ pop, rtt, locationName }` where `rtt` is server-measured TCP RTT in microseconds

Since browsers can't resolve DNS directly, IPs are resolved via the **Google DoH API** (`dns.google/resolve`) after benchmarking.

### Benchmark Phases

1. **Discovery** — fetch server list from `router.nextdns.io`, add anycast + ultralow endpoints
2. **Benchmark** — hit `/info` on each hostname (3 rounds, 6 concurrent, 3s timeout)
3. **IP Resolution** — bulk-resolve all hostnames via Google DoH (batches of 8)
4. **Ranking** — sort by latency with optional type preference boost
5. **Config** — generate all output formats using resolved IPs

## Config Output Formats

### Asus Router (DoT)

For ASUSWRT / Merlin routers: **WAN → DNS → DNS Privacy Protocol → DNS-over-TLS**

Each entry has two fields (leave port blank):
- **IP:** the resolved server IP
- **Hostname:** `{configId}.dns1.nextdns.io` or `{configId}.dns2.nextdns.io`

Includes: Primary (fastest), Secondary (backup), and two Anycast fallbacks.

### DNS-over-HTTPS (DoH)

```
https://dns1.nextdns.io/{configId}
https://dns2.nextdns.io/{configId}
```

### DNS-over-TLS Hostnames

```
{configId}.dns1.nextdns.io
{configId}.dns2.nextdns.io
```

### Plain DNS IPs

Raw IPs for non-encrypted fallback or IoT devices. IPv4 + IPv6, best + backup + anycast fallback.

## NextDNS API Reference

| Endpoint | Returns | CORS |
|----------|---------|------|
| `GET https://router.nextdns.io/?source=ping` | `[{ pop, server, ipv4, ipv6 }]` — geo-tailored server list | `*` |
| `GET https://{hostname}/info` | `{ pop, rtt, locationName }` — `rtt` in microseconds | `*` |

Hostnames that work with `/info`: anycast (`ipv4-anycast.dns1.nextdns.io`), ultralow (`ipv4.dns1.nextdns.io`), and PoP servers (`ipv4-{server}.edge.nextdns.io`).

## CLI Version

Looking for the CLI version with TCP SYN benchmarking and sub-ms precision? See [nextdns-dns-switcher](https://github.com/tracerman/nextdns-dns-switcher).

## License

MIT — AM Design & Consulting LLC
