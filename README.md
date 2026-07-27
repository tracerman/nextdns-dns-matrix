# NextDNS DNS Matrix

**Find the lowest-latency NextDNS servers for your network.** Open a single HTML file in any browser — no install, no dependencies, no backend.

**[→ Open the live tool](https://tracerman.github.io/nextdns-dns-matrix/)**

Benchmarks every NextDNS PoP available to you — anycast, ultralow, and individual edge servers — then hands you the exact config strings to act on the result, plus a guide to which field each one goes in.

Most DNS benchmarks tell you which server is quickest and stop there. This one closes the loop: if a specific edge server beats your steered routing, you get the URL that actually pins you to it, the trade-off that comes with pinning, and the steps for your hardware.

## Quick Start

1. **[Open the live tool](https://tracerman.github.io/nextdns-dns-matrix/)** — or download [`index.html`](index.html) to run locally
2. If you're on NextDNS, the tool auto-detects your connection and which server you're on
3. Enter your NextDNS config ID (from [my.nextdns.io](https://my.nextdns.io) → Setup)
4. Click **Run Benchmark**
5. Your current server is highlighted in the results — see instantly if you're on the best node
6. Copy the recommended config strings
7. Open **Where do I paste this?** at the bottom of the page for setup steps for your device

That's it. No server, no build step, no dependencies.

To run the routing regression tests while developing:

```powershell
node --test tests\routing.test.cjs
```

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

## Auto-Detection

On page load, the tool detects whether you're connected to NextDNS — no input needed. It shows:

- **Connection status** — which server and PoP you're connected to
- **Pre-benchmark RTT** — your current latency before running a full benchmark
- **IPv6 connectivity** — whether your connection to NextDNS supports IPv6
- **Detected-server highlighting** — after benchmarking, your detected server is highlighted with a golden row wherever it appears in the results
- **Latency delta badge** — if your current server isn't the lowest-latency option, a `+Xms` badge shows the gap
- **Optimization insight** — actionable recommendation if a lower-latency server is available

Detection uses `test.nextdns.io` (DNS leak test endpoint) and `test-ipv6.nextdns.io` — both CORS-enabled, no config ID required.

> **On IPv6:** `test-ipv6.nextdns.io` reports whether your *browser* can reach NextDNS over IPv6. It cannot tell which address family your DNS connection actually uses — browsers have no visibility into that. The IPv6 indicator is reported for what it is, and is not used to infer your DNS protocol.

## What It Shows

**Results table** — Rank, Node ID, Location (country code badge + city), Type, Hostname, IP, Avg latency (with inline sparkbar), Min, Jitter, Success rate. Click any hostname or IP to copy it.

**Detected server** — highlighted with a golden row background and green dot. If it's not rank #1, a latency delta badge shows how much slower it is than the best option.

**Insight box** — stat pills showing server / IPv4 / IPv6 / unreachable counts, detected-route context, and the same routing recommendation used everywhere else on the page

**Routing choices** — three side-by-side choices for Stable / Anycast, Steered / Ultralow, and Direct / Pinned. Every card keeps its DoH URL, measured IPv4 and IPv6 latency, and matching addresses together so values from different routes cannot be accidentally mixed.

**Pin to Lowest-Latency Server** — always shows the measured pinned option, both address families, the DoH URL, and a CLI forwarder string with failover. It only recommends pinning when the edge server beats the routed choices by more than 3ms; otherwise it explains why automatic steering is the safer default. See [Pinning to a Specific Server](#pinning-to-a-specific-server).

**Config panel** — ready-to-paste config formats:
- A single **Recommended** badge driven by the benchmark's unified routing model
- DNS-over-HTTPS for all three tiers, each paired with its own measured latency and addresses:
  - `anycast` — `https://anycast.dns1.nextdns.io/{id}` · stable IPs, auto-failover
  - `ultralow` — `https://dns.nextdns.io/{id}` · steered to nearest PoP
  - `pinned` — `https://{server}.edge.nextdns.io/{id}` · one measured edge, no automatic failover
- Recommended primary / backup bootstrap addresses for IPv4 and IPv6
- DNS-over-TLS hostname paired with those bootstrap addresses
- A prominent warning beside raw addresses explaining when plain IPv4 loses profile filtering

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
| **Auto** (default) | Most users — fastest safe routed choice; pin only for a meaningful gain |
| **Ultralow** | ISPs with good NextDNS peering |
| **Anycast** | Maximum reliability, stable IPs |

**How preference works:** Within a tolerance window (default 10ms), a preferred routed tier wins. So if you prefer ultralow and ultralow is 25ms vs anycast at 20ms, ultralow wins. But if anycast is 5ms and ultralow is 25ms, latency still wins. A direct edge is recommended separately, only when its measured gain clears the 3ms pinning threshold.

## Pinning to a Specific Server

The benchmark can tell you `vultr-bom` is your lowest-latency PoP — but the standard DoH URL (`https://dns.nextdns.io/{id}`) re-steers you somewhere else, so knowing it doesn't help. Pinning closes that gap.

**How to pin (DoH):** use the edge server's own hostname in place of `dns.nextdns.io`.

```
https://{server}.edge.nextdns.io/{configId}
```

e.g. `https://vultr-bom-1.edge.nextdns.io/abc123`

Note it's the **server** (`vultr-bom-1`), not the PoP (`vultr-bom`). The bare hostname is dual-stack — one URL covers IPv4 and IPv6. The `ipv4-` / `ipv6-` prefixed forms shown in the results table are single-family and are used for benchmarking only.

**With failover (NextDNS CLI only):**

```
forwarder https://{server}.edge.nextdns.io/{id}#{serverIP},https://anycast.dns1.nextdns.io/{id}
```

The CLI accepts a comma-separated forwarder list and falls back in order, so you get the pinned server's latency *and* an anycast safety net. `#{serverIP}` is a bootstrap IP — parsed by the CLI to skip resolving the hostname, never sent over the wire.

**DoT cannot pin by hostname.** `{configId}.{server}.edge.nextdns.io` does not resolve. DoT pins by bootstrap IP instead — the edge IP paired with `{configId}.dns.nextdns.io`, which is exactly what the Asus fields in this tool already produce. Edge IPs serve certificates valid for the NextDNS hostname, so TLS validation holds.

### The trade-off

NextDNS does not officially recommend pinning, and the reason is sound: steering exists to route around outages. **If a pinned server goes offline, your DNS stops until you change it.** In practice pinning is the only way to lock the lowest-latency PoP, and for users far from their steered PoP it measurably helps.

If you pin: prefer the failover form, and re-run this benchmark periodically — edge server IPs rotate.

**Set at least one IPv4 and one IPv6 address.** With failover gone, a second address family is the only redundancy you have left — if one stack breaks, the other still resolves. It also guards against a common misconfiguration: most routers keep IPv4 and IPv6 DNS on separate pages (Asuswrt puts IPv6 DNS on the IPv6 page, not WAN), so it's easy to configure one family and leave the other pointing at your ISP, quietly bypassing NextDNS for every lookup that takes that path. The tool shows both addresses for the pinned server, and tells you if no IPv6 one resolved.

## How It Works

Uses two NextDNS APIs (both CORS `*`):

1. **`GET https://router.nextdns.io/?source=ping`** — returns PoP servers geo-tailored to your location
2. **`GET https://{hostname}/info`** — returns `{ pop, rtt, locationName }` where `rtt` is server-measured TCP RTT in microseconds

Since browsers can't resolve DNS directly, IPs are resolved via a **public DoH API** after benchmarking (Google or Cloudflare).

### Benchmark Phases

1. **Discovery** — fetch server list from `router.nextdns.io`, add anycast + ultralow endpoints
2. **Benchmark** — hit `/info` on each hostname (3 rounds, 6 concurrent, 3s timeout)
3. **IP Resolution** — bulk-resolve all hostnames via the selected DoH resolver
4. **Routing model** — compare anycast, ultralow, and the best direct edge once, applying preference tolerance and the pinning threshold
5. **Config** — generate every recommendation, setup-guide value, and AI prompt from that same routing decision

## Config Output Formats

### Asus Router (DoT)

For ASUSWRT / Merlin routers: **WAN → Internet Connection → DNS Privacy Protocol → DNS-over-TLS (DoT)**

The DoT server list only appears once DNS Privacy Protocol is switched off `None`. Leave the **Preset servers** dropdown alone and fill the list manually:

| Field | Value |
|---|---|
| **IP Address** | the resolved server IP |
| **TLS Hostname** | `{configId}.dns.nextdns.io` |
| **TLS Port** | leave blank (defaults to 853) |
| **SPKI Fingerprint** | leave blank |

Includes the recommended route's primary and backup bootstrap addresses for both families. The hostname and addresses shown in that section belong to the same route.

Two things that catch people out: the DNS servers *above* the DoT section are only used by the router itself and have no effect on your devices once DoT is on — and IPv6 DNS servers go on the **IPv6** page, not the WAN page.

### DNS-over-HTTPS (DoH)

Three tiers — see [What It Shows](#what-it-shows) for the full list and when each appears.

```
https://anycast.dns1.nextdns.io/{configId}     stable, auto-failover
https://dns.nextdns.io/{configId}              steered (ultralow)
https://{server}.edge.nextdns.io/{configId}    pinned, no failover
```

### DNS-over-TLS Hostname

```
{configId}.dns.nextdns.io
```

### Plain DNS IPs

Raw IPs for unencrypted fallback or IoT devices.

> **IPv4 requires linking your IP, or your profile silently won't apply.** DoT carries your config ID in the TLS hostname and DoH carries it in the URL path — plain IPv4 has nowhere to put it, so NextDNS identifies you by public IP instead. Register it at [my.nextdns.io](https://my.nextdns.io) → Setup → Linked IP, and use the IPv4 addresses shown *there* — they're profile-specific and are not the anycast addresses ending in `.0`. Point a device at `45.90.28.0` unlinked and DNS resolves normally while none of your blocklists apply.
>
> **IPv6 needs no linking** — your config ID is encoded in the address. Copy the personalised IPv6 addresses from the setup page rather than constructing them by hand.

## Where Do I Paste This?

The tool has a built-in, collapsible setup guide at the bottom of the page covering generic routers (by capability rather than brand), Asus/Merlin, pfSense/OPNsense/unbound, the NextDNS CLI, Windows 11, Android, browsers, and Apple devices. Values fill in with your own after a benchmark run.

**Device not listed?** The guide ends with a copy-paste prompt for ChatGPT, Claude, Google AI Mode, or whatever you use. It carries the NextDNS mechanics models most reliably invent — that DoT can't pin by hostname, that plain IPv4 needs Linked IP — so you get steps for your hardware rather than confident fiction. Your config ID stays a placeholder: it's effectively a credential, and no assistant needs it to tell you which menu to open.

Two findings worth calling out, because neither is obvious:

- **Windows 11** only offers its encrypted-DNS dropdown for resolvers it already knows (Cloudflare, Google, Quad9). NextDNS isn't on that list — you must register the template with `Add-DnsClientDohServerAddress` first. Windows stores an *IP* and a *DoH template* as one route, so the built-in guide always fills both from the same routing card. Never mix an anycast address with the steered or pinned template.
- **Android** takes a DoT hostname only, and DoT can't address an individual edge server — so pinning isn't available there at all.

## NextDNS API Reference

| Endpoint | Returns | CORS |
|----------|---------|------|
| `GET https://router.nextdns.io/?source=ping` | `[{ pop, server, ipv4, ipv6 }]` — geo-tailored server list | `*` |
| `GET https://{hostname}/info` | `{ pop, rtt, locationName }` — `rtt` in microseconds | `*` |
| `GET https://{random}.test.nextdns.io/` | `{ type, profile, lists }` — `profile` present = connected to NextDNS | `*` |
| `GET https://{random}.test.nextdns.io/info` | `{ pop, rtt, locationName }` — detected server details, `rtt` in microseconds | `*` |
| `GET https://test-ipv6.nextdns.io/` | Plain text `OK` if IPv6 connectivity exists | `*` |

Hostnames that work with `/info`: anycast (`ipv4-anycast.dns1.nextdns.io`), ultralow (`ipv4.dns1.nextdns.io`), and PoP servers (`ipv4-{server}.edge.nextdns.io`).

The `test.nextdns.io` endpoints use a random subdomain prefix to trigger a fresh DNS lookup (the root domain 302-redirects, which fails CORS in browsers).

## License

MIT — AMDC

---

Made with Love, Blood, and Coffee.
