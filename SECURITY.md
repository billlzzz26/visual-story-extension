# Security Policy

## Supported Versions

| Version        | Supported          |
| -------------- | ------------------ |
| 3.x.x          | :white_check_mark: |
| < 3.0.0        | :x:                |

## Reporting a Vulnerability

We take the security of bl1nk-visual-mcp seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT
- Open a public GitHub issue
- Discuss the vulnerability in public forums or Discord
- Share exploit details with anyone outside the security response team

### Do
1. **Email us privately** at the project maintainers' contact
2. Include the following in your report:
   - Type of vulnerability (e.g., XSS, RCE, path traversal, credential leak)
   - Affected component(s) and file path(s)
   - Steps to reproduce (minimal code or config required)
   - Potential impact assessment
   - Suggested fix (if any)
3. **Allow 72 hours** for initial response

### Response Timeline
| Stage | Timeframe |
|-------|-----------|
| Initial acknowledgment | 72 hours |
| Vulnerability confirmation | 7 days |
| Security patch release | 30 days |
| Public disclosure | 14 days after patch release |

### Scope

#### In Scope
- MCP server tool endpoints and input validation
- File system operations (path traversal, arbitrary file write)
- OAuth/JWT authentication flows
- API key handling and credential storage
- Template injection (Handlebars)
- CSV injection via exported files
- Dependency vulnerabilities

#### Out of Scope
- Dependencies we don't control (e.g., `@modelcontextprotocol/sdk`, `zod`)
- Social engineering attacks
- DoS/DDoS attacks
- Issues in third-party MCP servers or plugins

## Security Best Practices for Contributors

1. **Never commit secrets** — API keys, tokens, or credentials
2. **Use `.env` files** — Add to `.gitignore`, document in `.env.example`
3. **Validate all inputs** — Use Zod schemas at tool boundaries
4. **Avoid `any` types** — Use `unknown` and narrow explicitly
5. **Escape output** — HTML, CSV, JSON, and file paths
6. **Use `with` for JSON imports** — Replace deprecated `assert { type: "json" }`
7. **Clone global regex** — Avoid shared `lastIndex` state in concurrent contexts

## Known Vulnerabilities

See [GitHub Security Advisories](https://github.com/billlzzz26/visual-story-extension/security/advisories) for current advisories.

## Dependency Security

We use Dependabot for automated vulnerability scanning. All `npm audit` findings are reviewed before each release.

```bash
# Check for vulnerabilities
npm audit

# Check for fixable vulnerabilities
npm audit fix

# Audit with production dependencies only
npm audit --omit=dev
```
