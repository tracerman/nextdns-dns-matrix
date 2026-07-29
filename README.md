# NextDNS DNS Matrix

**Find the lowest-latency NextDNS servers for your network.** Open a single HTML file in any browser — no install, no dependencies, no backend.

**[→ Open the live tool](https://tracerman.github.io/nextdns-dns-matrix/)**

Benchmarks every NextDNS PoP available to you — anycast, ultralow, and individual edge servers — then turns the result into a compatible, step-by-step setup runbook for your device.

Most DNS benchmarks tell you which server is quickest and stop there. This one closes the loop: if a specific edge server beats your steered routing, you get the URL that actually pins you to it, the trade-off that comes with pinning, and the steps for your hardware.

## Quick Start

1. **[Open the live tool](https://tracerman.github.io/nextdns-dns-matrix/)** — or download [`index.html`](index.html) to run locally
2. If you're on NextDNS, the tool auto-detects your connection and which server you're on
3. Enter your NextDNS config ID (from [my.nextdns.io](https://my.nextdns.io) → Setup)
4. Click **Run Benchmark**
5. Your current server is highlighted in the results — see instantly if you're on the best node
6. Copy the recommended config strings
7. Under **Set up your recommended route**, choose a category and device, then click **Show setup**

That's it. No server, no build step, no dependencies.

### Pre-fill your Config ID via URL

Use a URL fragment to skip the input step:

```
https://tracerman.github.io/nextdns-dns-matrix/#id=abc123
```

Fragments are not sent to GitHub Pages or included in HTTP referrers. The tool reads the value and immediately removes it from the address bar and browser-history entry. Legacy `?id=` links still work, but query values reach the web server before JavaScript can remove them and should not be shared.

## Why?

NextDNS gives you a default DNS config, but it's not always optimal. Their infrastructure has three tiers:

| Type | What It Is | Pros | Cons |
|------|-----------|------|------|
| **Anycast** | Global IPs (`45.90.28.0` / `45.90.30.0`) routed via BGP | Stable, auto-failover, never changes | BGP routing ≠ lowest latency |
| **Ultralow** | DNS-steered unicast via `*.dns.nextdns.io` | Dynamically picks a nearby healthy PoP | Needs a client that follows the hostname; its short-lived resolved IP must not be pasted as a bootstrap address |
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

**Results table** — Rank, Node ID, Location, Type, Hostname, IP, median RTT, Min, MAD (median absolute deviation), and Success rate. Click any hostname or IP to copy it. Rows that lack server-reported RTT remain visible as **client measured**, but receive no comparable rank because a full browser HTTPS duration is not the same metric. A `via anycast1` or `via ultralow1` badge means that route currently reaches the shown edge; the row remains labeled **edge** and its RTT remains the direct-edge measurement.

**Detected server** — highlighted with a golden row background and green dot. If it's not rank #1, a latency delta badge shows how much slower it is than the best option.

**Insight box** — stat pills showing server / IPv4 / IPv6 / unreachable counts, detected-route context, and the same routing recommendation used everywhere else on the page

**Routing choices** — three side-by-side choices for Stable / Anycast, Steered / Ultralow, and Direct / Pinned. Every card keeps its DoH URL, measured IPv4 and IPv6 median/MAD, and matching addresses together. Ultralow resolved addresses are diagnostic only and are never offered as bootstrap values.

**Pin to Lowest-Latency Server** — always shows the measured pinned option, both address families, the DoH URL, and a CLI forwarder string with failover. Pinning is recommended only when its median gain clears all three decision terms: 3ms, 5% of the routed baseline, and the combined MAD. The UI calls this a **clear measured advantage**, not statistical significance.

**Config panel** — ready-to-paste config formats:
- A single **Recommended** badge driven by the benchmark's unified routing model
- DNS-over-HTTPS for all three tiers, each paired with its own measured latency and addresses:
  - `anycast` — `https://anycast.dns1.nextdns.io/{id}` · stable IPs, auto-failover
  - `ultralow` — `https://dns.nextdns.io/{id}` · steered to nearest PoP
  - `pinned` — `https://{server}.edge.nextdns.io/{id}` · one measured edge, no automatic failover
- Bootstrap address references for IPv4 and IPv6, without claiming the second value is an ordered fallback
- DNS-over-TLS hostname paired with addresses from the same route
- Device-specific entry counts and upstream-selection behavior in Guided Setup
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

**How preference works:** Preference breaks a close measured result; it never overrides a clear advantage. The close-result window is derived from `max(3ms, 5% of the baseline median, combined MAD)`. In Auto mode, stable anycast breaks a close result against ultralow. A direct edge is considered separately under the same rule.

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

**DoT cannot pin by server hostname alone.** `{configId}.{server}.edge.nextdns.io` does not resolve. DoT pins by pairing the edge IP with `{configId}.dns.nextdns.io`; the guided setup decides whether that address should stand alone or share traffic with anycast. Edge IPs serve certificates valid for the NextDNS hostname, so TLS validation holds.

### The trade-off

NextDNS does not officially recommend pinning, and the reason is sound: steering exists to route around outages. A dead pinned endpoint can cause hard failure or recurring multi-second stalls while the client retries and backs it off; exact behavior depends on the client. In practice pinning is the only way to lock one PoP, and it is offered when the measured gain is clear.

If you pin: prefer a client with documented ordered failover. Use **Monitor this pin locally** to store the profile-free edge hostname, address, timing, and timestamp. On reload the tool checks rotation; a separate button remeasures degradation. A changed DNS answer is urgent evidence that the bootstrap value is stale, not proof that the old address has already stopped serving.

Do not assume that adding IPv4, IPv6, pinned, and anycast rows creates passive backups. Some clients actively distribute queries across every configured entry. Follow the device-specific entry set in Guided Setup.

## How It Works

Uses two NextDNS APIs (both CORS `*`):

1. **`GET https://router.nextdns.io/?source=ping`** — returns PoP servers geo-tailored to your location
2. **`GET https://{hostname}/info`** — returns `{ pop, rtt, locationName }` where `rtt` is server-measured TCP RTT in microseconds

Since browsers can't resolve DNS directly, IPs are resolved via a **public DoH API** after benchmarking (Google or Cloudflare).

### Benchmark Phases

1. **Discovery** — fetch server list from `router.nextdns.io`, add anycast + ultralow endpoints
2. **Discovery benchmark** — hit `/info` on each hostname using the selected round count, batches of 6, and a 3s timeout
3. **Finalist refinement** — remeasure both anycast members, both ultralow members, and the leading edge candidates with seven randomized, interleaved, non-concurrent checks
4. **IP Resolution** — bulk-resolve all hostnames via the selected DoH resolver
5. **Routing model** — rank comparable server RTT medians, calculate MAD, and apply the clear-advantage rule
6. **Config** — generate every recommendation, setup-guide value, and AI prompt from that same routing decision

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

Verified Asuswrt-Merlin builds generate Stubby configuration with `round_robin_upstreams: 1`. Entries are active upstreams, not guaranteed ordered primary/fallback rows. Stock AsusWRT likely inherits related behavior from ASUS GPL sources, but exact behavior varies by model and firmware.

The guided setup therefore offers three quantitative native-DoT modes:

| Mode | Emitted entries | Behavior |
|---|---|---|
| **Reliable** (default) | Anycast DNS1 + DNS2 over IPv4 and IPv6 | Four stable active upstreams when dual-stack is available |
| **Balanced** | Each family’s lowest-latency measured edge + its faster measured anycast member | Four active upstreams; IPv4 and IPv6 may use different PoPs |
| **Maximum performance** | The independently selected lowest-latency edge for IPv4 and IPv6 | Two active transports that may target different PoPs; each fixed edge can fail independently |

**IPv4 + IPv6 is the default** when both anycast members were successfully measured over IPv6. The family selector can reduce the guide to IPv4-only, producing the previous two/two/one entry layouts. If the benchmark cannot fully measure IPv6, the guide falls back to IPv4-only and says why.

Balanced and Maximum performance unlock only when the complete emitted active set has a **clear measured advantage over the Reliable active-set estimate**. The gate requires a gain greater than the largest of 3ms, 5% of the Reliable estimate, or the combined observed variation. Dual-stack pinning chooses the lowest-latency resolved IPv4 and IPv6 edges independently; the two families are never forced onto the same PoP, though they can naturally select it when it wins both measurements.

The displayed `≈Xms` is a transport-RTT estimate, not a DNS lookup prediction: cache fragmentation, resolver processing, address-family reachability, and Stubby scheduling can change real behavior. Adding active upstreams can also fragment NextDNS's per-PoP caches because queries are distributed between locations.

On the verified Merlin settings, a permanently dead pinned address can make affected queries wait about 6 seconds (two 3-second retries). Stubby then removes it from rotation for 15 minutes before trying it again, so the stall can recur. Stock AsusWRT likely behaves similarly but still needs model-and-firmware-specific confirmation.

Two different IPv6 settings are easy to conflate:

- NextDNS IPv4 and IPv6 **upstream** addresses both go in **WAN → Internet Connection → DNS-over-TLS Server list**.
- When LAN clients should reach the router for DNS over IPv6, the router’s **IPv6** page should advertise its own LAN IPv6 link-local address—not one of the NextDNS upstream addresses.

The DNS servers above the WAN DoT section are used by the router itself and do not replace the LAN DHCP or IPv6 router-advertisement settings that tell clients to use the router.

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

## Guided Setup

The setup section is a short flow rather than a catalog of generic snippets:

1. Choose the scope: router/firewall, computer/mobile, browser/ChromeOS, or server/DNS
2. Choose the device and, when needed, its firmware or capability
3. For native Asus DoT, choose Reliable, Balanced, or Maximum performance
4. For native Asus DoT, keep the dual-stack default or choose IPv4-only
5. Click **Show setup** to generate one compatible route and a complete runbook

Before benchmarking, the guide uses a neutral **Standard encrypted setup** and makes no latency claim. After a run, it adapts the measured recommendation to the device's real capabilities — for example, Android receives steered DoT even if a pinned edge won overall. The runbook includes prerequisites, paste-ready values, numbered steps, platform-specific recovery, official sources, and a fresh connection check.

Primary paths cover AsusWRT/Merlin, pfSense, OPNsense, OpenWrt, UniFi OS, generic routers by capability, Windows 11, Apple profiles, Android, Linux/NextDNS CLI, Firefox, Chrome, ChromeOS, AdGuard Home, Pi-hole, and Synology DSM. Less common platforms and protocol notes remain in **Advanced reference**.

**Share guide** creates a device/variant/mode/address-family deep link and removes every accepted config-ID parameter before copying it. A recipient gets the instructions without receiving your profile ID.

**Local history is profile-free.** The newest ten runs store endpoint identity, family, resolved IP, median, MAD, timestamp, and recommendation in this browser. The config ID and generated profile URLs are never stored. History and the saved pin have separate clear actions.

**Verification is deliberately scoped.** The in-page re-check can confirm that this browser reached NextDNS and compare the reported profile. It cannot prove router-wide coverage or the DNS transport used, because a browser, VPN, cache, or another client path may behave differently. Each runbook therefore adds a platform-specific check.

**Device still not listed?** The collapsed assistant prompt inherits the selected device and compatible route while leaving the config ID as `{your-config-id}`. It tells the assistant which NextDNS mechanics it must preserve and asks it to admit uncertainty about firmware-specific menu paths.

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
