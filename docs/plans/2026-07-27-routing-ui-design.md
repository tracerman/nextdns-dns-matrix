# Unified Routing and Configuration Design

## Goal

Make every recommendation and setup string agree about which NextDNS routing mode
the user is configuring. Preserve the browser-only, single-file application and its
dark network-operations aesthetic.

## Model

The benchmark produces three routing-tier objects:

- **Anycast / stable** — matching DoH URL, stable DNS1/DNS2 addresses, IPv4 and
  IPv6 measurements, and automatic-failover trade-off.
- **Ultralow / steered** — matching DoH URL, measured steered addresses per family,
  and dynamic-routing trade-off.
- **Pinned / direct** — selected edge hostname, matching addresses per family,
  measured gain, CLI forwarder, and explicit no-failover warning.

One tier is marked recommended. Pinning wins only when the selected edge beats the
best non-pinned route by more than the existing threshold. Otherwise preference
and latency choose between stable and steered routing.

## Interface

The configuration panel leads with three routing-mode cards. Each card shows its
recommendation state, IPv4 and IPv6 latency, DoH URL, and matching address pair.
A separate DoT/bootstrap block presents the selected tier’s primary and backup
addresses. Plain IPv4 is not presented as equivalent to bootstrap configuration;
its linked-IP requirement appears beside the copyable values.

Copyable values use real buttons and a live status toast. Progress and errors use
live regions. Scrollable tables and prompts are keyboard-focusable. Reduced-motion
preferences stop both CSS and JavaScript animation.

## Data Flow

`runBenchmark` ranks raw results, selects the pin target, builds routing tiers,
marks one tier recommended, and generates configuration from those tiers. The
insight, configuration panel, pin section, setup guide, and AI prompt receive the
same generated configuration object.

## Verification

Node’s built-in test runner exercises routing decisions and address/template
pairing without dependencies. Browser verification covers both public DoH
resolvers, desktop and mobile widths, keyboard access, reduced motion, and axe.
