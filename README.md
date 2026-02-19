# NextDNS DNS Matrix

**Find the lowest-latency NextDNS servers for your network.** Open a single HTML file in any browser — no install, no dependencies, no backend.

**[→ Open the live tool](https://tracerman.github.io/nextdns-dns-matrix/)**

Benchmarks all available NextDNS PoPs (anycast, ultralow, and individual servers) and recommends the optimal DNS configuration with ready-to-paste strings for Asus routers, DoH, DoT, and plain DNS.

## Quick Start

1. **[Open the live tool](https://tracerman.github.io/nextdns-dns-matrix/)** — or download [`index.html`](index.html) to run locally
2. Enter your NextDNS config ID (from [my.nextdns.io](https://my.nextdns.io) → Setup)
3. Click **Run Benchmark**
4. Copy the recommended config strings

That's it. No server, no build step, no dependencies.

### Pre-fill your Config ID via URL

Pass your config ID as a URL parameter to skip the input step:

```
https://tracerman.github.io/nextdns-dns-matrix/?id=abc123
```

Useful for bookmarking or sharing a direct link. The field is pre-filled on load — just hit **Run Benchmark**.

## Why?

NextDNS gives you a default DNS config, but it's not always optimal. Their infrastructure has three tiers:

| Type | What It Is | Pros | Cons |
|------|-----------|------|------|
| **Anycast** | Global IPs (`45.90.28.0` / `45.90.30.0`) routed via BGP | Stable, auto-failover, never changes | BGP routing ≠ lowest latency |
| **Ultralow** | DNS-steered unicast IPs via `*.dns.nextdns.io` | Dynamically picks "closest" PoP | Requires encrypted DNS (DoT/DoH) |
| **PoP Servers** | Individual servers (e.g., `tier-clt`, `hetzner-iad`) | Can be lowest-latency for your location | IPs rotate, servers go down |

**The problem:** These IPs rotate, servers go down, and the "best" option changes based on your ISP routing. This tool benchmarks them all and tells you which to use *right now*.

## What It Shows

**Results table** — Rank, Node ID, Location (country code badge + city), Type, Hostname, IP, Avg latency (with inline sparkbar), Min, Jitter, Success rate

**Insight box** — stat pills showing tested / reachable / unreachable counts, plus a latency comparison vs anycast

**IPv4 and IPv6 recommendations** — best + backup server for each family, with resolved IPs and anycast fallbacks

**Bento config grid** — six ready-to-paste config formats in a card layout:
- Asus Router DoT (2-column IP + Hostname per entry)
- DNS-over-HTTPS URL
- DNS-over-TLS hostname
- Plain DNS IPs (best, backup, anycast fallback)

Color-coded latency: green (<20ms), yellow (<40ms), red (≥40ms)

## DoH Resolver Selection

The tool resolves server hostnames to IPs via a public DoH API. Choose whichever works on your network:

| Resolver | Endpoint |
|----------|----------|
| **Google** (default) | `dns.google/resolve` |
| **Cloudflare** | `cloudflare-dns.com/dns-query` |

Both support browser CORS (`Access-Control-Allow-Origin: *`) and return the same JSON format. Use Cloudflare if Google is restricted on your network. The resolver choice doesn't affect benchmarking accuracy — it only matters for IP resolution.

> **Why only two?** Browsers require `Access-Control-Allow-Origin: *` for cross-origin fetch calls. When the tool is opened as a local file, the origin is `null`, which most providers reject. Google and Cloudflare are the only major public DoH providers that reliably send this header and support the JSON query API (`?name=&type=`).

## Server Preference Modes

| Mode | Best For |
|------|----------|
| **Auto** (default) | Most users — pure latency wins |
| **Ultralow** | ISPs with good NextDNS peering |
| **Anycast** | Maximum reliability, stable IPs |

**How preference works:** Within a tolerance window (default 10ms), preferred servers win. So if you prefer ultralow and ultralow is 25ms vs another server at 20ms, ultralow wins. But if the other server is 5ms and ultralow is 25ms, latency still wins — preference doesn't override large differences.

## How It Works

Uses two NextDNS APIs (both CORS `*`):

1. **`GET https://router.nextdns.io/?source=ping`** — returns PoP servers geo-tailored to your location
2. **`GET https://{hostname}/info`** — returns `{ pop, rtt, locationName }` where `rtt` is server-measured TCP RTT in microseconds

Since browsers can't resolve DNS directly, IPs are resolved via a **public DoH API** after benchmarking (Google or Cloudflare).

### Benchmark Phases

1. **Discovery** — fetch server list from `router.nextdns.io`, add anycast + ultralow endpoints
2. **Benchmark** — hit `/info` on each hostname (3 rounds, 6 concurrent, 3s timeout)
3. **IP Resolution** — bulk-resolve all hostnames via the selected DoH resolver
4. **Ranking** — sort by latency with optional type preference boost
5. **Config** — generate all output formats using resolved IPs

## Config Output Formats

### Asus Router (DoT)

For ASUSWRT / Merlin routers: **WAN → DNS → DNS Privacy Protocol → DNS-over-TLS**

Each entry has two fields (leave port blank):
- **IP:** the resolved server IP
- **Hostname:** `{configId}.dns.nextdns.io`

Includes: Primary (lowest latency), Secondary (backup), and two Anycast fallbacks.

### DNS-over-HTTPS (DoH)

```
https://dns.nextdns.io/{configId}
```

### DNS-over-TLS Hostname

```
{configId}.dns.nextdns.io
```

### Plain DNS IPs

Raw IPs for non-encrypted fallback or IoT devices. IPv4 + IPv6, best + backup + anycast fallback.

## NextDNS API Reference

| Endpoint | Returns | CORS |
|----------|---------|------|
| `GET https://router.nextdns.io/?source=ping` | `[{ pop, server, ipv4, ipv6 }]` — geo-tailored server list | `*` |
| `GET https://{hostname}/info` | `{ pop, rtt, locationName }` — `rtt` in microseconds | `*` |

Hostnames that work with `/info`: anycast (`ipv4-anycast.dns1.nextdns.io`), ultralow (`ipv4.dns1.nextdns.io`), and PoP servers (`ipv4-{server}.edge.nextdns.io`).

## License

MIT — AMDC

---

Made with Love, Blood, and Coffee.
