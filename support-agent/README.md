# bl1nk Support Agent

เทมเพลตที่รวมระบบ Support Agent โดยใช้ Vercel AI SDK ร่วมกับระบบ MCP OAuth Authorization, การรองรับ CLI Agent Mode, แนวคิด Runtime Agent Skills และระบบจัดการ Sandbox Runtime เต็มรูปแบบ

## 🚀 Features

### Core Concepts
- **Agent**: การกำหนดรูปแบบพฤติกรรม (Persona) ของ AI
- **System Prompt**: ตัวตนหลักที่กำหนดขอบเขตพฤติกรรม
- **Skill**: คู่มือการทำงานเฉพาะทางในรูปแบบ Markdown
- **Tool**: ความสามารถเชิงปฏิบัติการที่เอเจนต์เรียกใช้ได้
- **Sandbox**: สภาพแวดล้อมแยกส่วน (Isolated E2B) สำหรับรันโค้ดอย่างปลอดภัย
- **Thread**: หน่วยของการสนทนาภายใน Sandbox เดียวกัน

### Security & Compliance
- ✅ PKCE (S256) สำหรับ OAuth 2.1
- ✅ RFC 9728 & RFC 8414 Metadata Discovery
- ✅ Token Refresh Flow อัตโนมัติ
- ✅ CSRF Protection ด้วย State Parameter
- ✅ Sandbox Isolation (E2B Standard)
- ✅ Command Sanitization ป้องกัน Injection

## 📁 Directory Structure

```
support-agent/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat API with streaming
│   │   └── oauth/route.ts     # OAuth endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main dashboard
├── components/ui/
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   └── radial-orbital-timeline.tsx
├── lib/
│   ├── ai.ts                  # Vercel AI SDK config
│   ├── agents/
│   │   ├── cli-bridge.ts      # CLI mode logic
│   │   └── skills-data.ts     # Skill definitions
│   ├── mcp/
│   │   ├── discovery.ts       # OAuth discovery (RFC 9728/8414)
│   │   ├── oauth-service.ts   # OAuth 2.1 service
│   │   ├── pkce.ts            # PKCE utilities
│   │   └── storage.ts         # Token storage
│   └── sandbox/
│       └── manager.ts         # Sandbox lifecycle management
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🛠️ Installation

```bash
cd support-agent

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your credentials
# - KILO_API_KEY
# - OPENAI_API_KEY
# - CLIENT_ID
# - REDIRECT_URI
# - RESEND_API_KEY (optional)

# Run development server
pnpm dev
```

## 🔐 Environment Variables

```bash
# AI & Gateway
KILO_API_KEY=your_kilo_api_key_here
DOCS_URL=https://docs.example.com

# MCP OAuth
CLIENT_ID=https://kilocode.ai/.well-known/oauth-client/vscode-extension.json
REDIRECT_URI=http://127.0.0.1:0/callback

# Email Escalation (optional)
RESEND_API_KEY=re_your_key_here
SUPPORT_EMAIL=team@yourcompany.com

# OpenAI (for Vercel AI SDK)
OPENAI_API_KEY=sk-your_openai_api_key_here
```

## 🎯 Usage

### Agent Modes

| Mode | Description | Skills |
|------|-------------|--------|
| `support` | Customer support agent | Order Lookup, Billing, Technical |
| `code` | Coding assistant | Code Review, Refactoring, Testing |
| `ask` | Q&A assistant | Knowledge Base, Documentation |
| `plan` | Project planning | Task Breakdown, Roadmaps |
| `debug` | Debugging expert | Error Analysis, Troubleshooting |

### CLI Commands

```bash
# List available agents
/agents

# Switch agent mode
/switch support

# Start new task
/newtask

# Condense context
/smol
```

### Skills System

Skills ถูกเก็บในรูปแบบ Markdown ใน Sandbox:

```markdown
---
name: Order Lookup
description: จัดการสถานะคำสั่งซื้อและการติดตามพัสดุ
---
# When to use
ใช้เมื่อผู้ใช้ถามถึงสถานะคำสั่งซื้อ

# Procedure
1. ถามหา Order Number
2. เรียก API: GET /orders/{orderId}
3. สรุปผลลัพธ์
```

## 🔒 Security Checklist

- [ ] PKCE S256 enforcement
- [ ] Resource binding ใน token request
- [ ] State parameter validation
- [ ] Token encryption at rest
- [ ] Command sanitization
- [ ] Sandbox timeout enforcement
- [ ] API key isolation

## 📊 Architecture

```
User Input → Next.js API → OAuth Check → Sandbox Manager
                                      ↓
                                  Create/Get Sandbox
                                      ↓
                                  Inject Skills (.md files)
                                      ↓
                                  Execute Kilo CLI
                                      ↓
                                  Stream stdout → Vercel AI SDK → UI
```

## 🧪 Development

```bash
# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## 📝 License

Apache-2.0
