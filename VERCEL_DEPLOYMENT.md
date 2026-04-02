# Vercel Deployment Guide

This guide explains how to deploy the Visual Story Planner MCP server to Vercel.

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/visual-story-extension)

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Upstash Redis** - Free tier at [upstash.com](https://upstash.com)
3. **Exa API Key** - Get from [dashboard.exa.ai](https://dashboard.exa.ai/api-keys)

## Setup Instructions

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Your Project

```bash
vercel link
```

### 3. Configure Environment Variables

Set the following environment variables in Vercel:

#### Required
- `EXA_API_KEY` - Your Exa AI API key

#### Rate Limiting (Recommended)
- `KV_REST_API_URL` - Upstash Redis REST URL
- `KV_REST_API_TOKEN` - Upstash Redis REST token
- `RATE_LIMIT_QPS` - Queries per second (default: 2)
- `RATE_LIMIT_DAILY` - Daily quota (default: 50)

#### OAuth (Optional - for production)
- `OAUTH_ISSUER` - OAuth issuer URL
- `OAUTH_AUDIENCE` - OAuth audience
- `OAUTH_JWKS_URI` - JWKS endpoint URL

### 4. Deploy

```bash
vercel --prod
```

## Local Development

### Run Vercel Dev Server

```bash
npm run vercel:dev
```

This will start the Vercel development server at `http://localhost:3000`.

### Test the MCP Endpoint

```bash
# Using curl
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_EXA_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

## Project Structure

```
visual-story-extension/
├── api/
│   └── mcp.ts          # Vercel Function entry point
├── src/
│   ├── index.ts        # Main MCP server entry point (stdio)
│   ├── mcp-handler.ts  # MCP server wrapper for mcp-handler lib
│   ├── plugin.ts       # KiloCode plugin entry point
│   ├── utils/
│   │   ├── auth.ts     # OAuth JWT verification
│   │   └── error-handler.ts  # Error handling utilities
│   └── ...
├── vercel.json          # Vercel configuration
└── package.json
```

## Architecture

### Request Flow

1. **Request arrives** at `/api/mcp` (or `/mcp` via rewrite)
2. **Auth extraction** from headers/query params
3. **Rate limit check** (if no API key provided)
4. **Handler creation** with per-request config
5. **Tool execution** via mcp-handler library
6. **Response** in JSON-RPC 2.0 format

### Rate Limiting

- **QPS Limit**: Sliding window (default: 2 req/sec)
- **Daily Limit**: Fixed window (default: 50 req/day)
- **Bypass**: Users with own API key skip rate limiting
- **Storage**: Upstash Redis (serverless)

### Authentication

Priority order:
1. `x-api-key` header
2. OAuth JWT in `Authorization: Bearer` header
3. Plain API key in `Authorization: Bearer` header
4. `?exaApiKey=` query parameter
5. `EXA_API_KEY` environment variable

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `EXA_API_KEY` | Exa AI API key | - |
| `KV_REST_API_URL` | Upstash Redis URL | - |
| `KV_REST_API_TOKEN` | Upstash Redis token | - |
| `RATE_LIMIT_QPS` | QPS rate limit | 2 |
| `RATE_LIMIT_DAILY` | Daily request limit | 50 |
| `OAUTH_ISSUER` | OAuth issuer | `https://mcp.exa.ai` |
| `OAUTH_AUDIENCE` | OAuth audience | `exa-mcp-api` |
| `OAUTH_JWKS_URI` | JWKS endpoint | `https://mcp.exa.ai/.well-known/jwks.json` |
| `RATE_LIMIT_BYPASS` | User-agent prefix for bypass | - |
| `EXA_API_KEY_BYPASS` | API key for bypass users | - |
| `OAUTH_USER_AGENTS` | Force OAuth user agents | - |
| `ENABLED_TOOLS` | Comma-separated tool list | All tools |
| `DEBUG` | Enable debug logging | `false` |

## Available Tools

Once deployed, your MCP server will expose these tools:

- `analyze_story` - Parse story text into StoryGraph JSON
- `export_mermaid` - Generate Mermaid diagram
- `export_canvas` - Generate Canvas JSON
- `export_dashboard` - Generate HTML dashboard
- `export_markdown` - Generate Markdown documentation
- `validate_story_structure` - Validate 3-act structure
- `extract_characters` - Extract character data
- `extract_conflicts` - Extract conflict data
- `build_relationship_graph` - Build relationship graph
- `exa_search_story` - Search web for writing references

## Usage Examples

### Claude Code

```bash
claude mcp add visual-story https://your-project.vercel.app/mcp \
  --header "x-api-key: YOUR_EXA_API_KEY"
```

### Cursor IDE

Add to MCP settings:
```json
{
  "mcpServers": {
    "visual-story": {
      "url": "https://your-project.vercel.app/mcp",
      "headers": {
        "x-api-key": "YOUR_EXA_API_KEY"
      }
    }
  }
}
```

## Monitoring

### View Logs

```bash
vercel logs
```

### Check Function Duration

The `maxDuration` is set to 60 seconds in `vercel.json`. Monitor your function execution times in the Vercel dashboard.

## Troubleshooting

### "Rate limit exceeded"

- Add your own Exa API key via `x-api-key` header
- Or increase limits in environment variables

### "Authentication required"

- Provide API key via `x-api-key` header or `?exaApiKey=` query param
- Check OAuth configuration if using JWT

### Function timeout

- Reduce `maxDuration` in `vercel.json` if needed
- Optimize tool execution time

## Pricing

- **Vercel Hobby**: Free for personal projects
- **Vercel Pro**: $20/month for teams
- **Upstash Redis**: Free tier (10K commands/day)
- **Exa API**: Pay-as-you-go pricing

## Support

For issues or questions:
1. Check [README.md](../README.md)
2. Review [Vercel documentation](https://vercel.com/docs)
3. Contact support
