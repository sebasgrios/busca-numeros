# Security Policy

Thanks for helping keep **busca-numeros** and its users safe. This document
explains which versions are supported, how to report a vulnerability and what
to expect after a report.

## Supported Versions

Only the latest released version receives security updates. The project follows
[Semantic Versioning](https://semver.org/) and is released from the `main`
branch.

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
discussions or pull requests.**

Instead, use one of the following private channels:

1. **GitHub Security Advisories (preferred).** Open a private report at
   [Security → Report a vulnerability](https://github.com/sebasgrios/busca-numeros/security/advisories/new).
   This keeps the discussion confidential until a fix is published.
2. **Email.** If you cannot use GitHub advisories, write to
   **sebas2001gr@gmail.com** with the subject line `[SECURITY] busca-numeros`.

To help us triage quickly, please include as much of the following as you can:

- A clear description of the issue and its potential impact.
- The affected version, URL or commit hash.
- Step-by-step instructions to reproduce the problem.
- Any proof-of-concept code, logs or screenshots.
- Your assessment of severity and, if known, a suggested remediation.

## Response Process

- **Acknowledgement:** within **72 hours** of your report.
- **Initial assessment:** within **7 days**, including a severity rating and
  next steps.
- **Fix and disclosure:** we aim to release a fix for confirmed vulnerabilities
  within **30 days**, depending on complexity. We will keep you informed of
  progress along the way.

We follow a **coordinated disclosure** approach: please give us a reasonable
amount of time to release a fix before any public disclosure. With your
permission, we are happy to credit you once the issue is resolved.

## Scope

busca-numeros is a client-side web game (Next.js + React) with an optional
real-time multiplayer mode powered by PartyKit. Reports are most relevant when
they concern:

- Cross-site scripting (XSS) or other client-side injection.
- Abuse, spoofing or denial-of-service vectors in the multiplayer
  (PartyKit / WebSocket) layer.
- Leakage of sensitive data through the client bundle or network traffic.
- Vulnerable third-party dependencies with a demonstrable impact.
- Misconfiguration that weakens the application's security posture.

The following are **out of scope**:

- Findings that require a compromised device, browser or network (MITM with a
  user-installed root certificate, malicious browser extensions, etc.).
- Volumetric denial-of-service attacks (flooding, traffic amplification).
- Social engineering, phishing or physical attacks.
- Missing security headers or best-practice recommendations with no
  demonstrable impact.
- Vulnerabilities in third-party platforms (GitHub, Cloudflare, the hosting
  provider) — report those to the corresponding vendor.

## Handling of Secrets and Configuration

This project only uses public, build-time environment variables prefixed with
`NEXT_PUBLIC_` (for example, the site URL and the PartyKit host). These values
are public by design and are **not** secrets. No private keys, tokens or
credentials are stored in the repository or its history.

If you ever find a credential committed to the repository, please treat it as a
vulnerability and report it through the private channels above so it can be
rotated.
