# bl1nk Support Agent

เทมเพลตที่รวมระบบ Support Agent โดยใช้ Vercel AI SDK ร่วมกับระบบ MCP OAuth Authorization, การรองรับ CLI Agent Mode, แนวคิด Runtime Agent Skills และระบบจัดการ Sandbox Runtime เต็มรูปแบบ

## Features

- **Vercel AI SDK**: Streaming chat interface พร้อม integration กับ OpenAI
- **MCP OAuth 2.1**: รองรับ RFC 9728/8414 Discovery พร้อม PKCE (S256)
- **CLI Agent Mode**: สลับโหมดเอเจนต์ได้แบบ real-time (Support, Code, Planner, Debug)
- **Runtime Agent Skills**: ระบบ Skill แบบไฟล์ Markdown ที่เอเจนต์ค้นพบได้อัตโนมัติ
- **Sandbox Runtime**: แยกส่วนคำสั่งที่ซับซ้อนออกจาก System Prompt ในสภาพแวดล้อมที่ปลอดภัย

## Project Structure

```
packages/support-agent/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # API Route สำหรับ Chat Streaming
│   │   ├── globals.css          # Global Styles
│   │   ├── layout.tsx           # Root Layout
│   │   └── page.tsx             # Main Dashboard UI
│   ├── components/ui/
│   │   └── button.tsx           # Button Component
│   └── lib/
│       ├── agents/
│       │   ├── cli-bridge.ts    # CLI Mode Logic & Agent Switcher
│       │   └── skills-data.ts   # Skill Definitions
│       ├── mcp/
│       │   ├── discovery.ts     # OAuth Discovery (RFC 9728/8414)
│       │   ├── oauth-service.ts # OAuth 2.1 Service
│       │   ├── pkce.ts          # PKCE Generation
│       │   └── storage.ts       # Token Storage
│       ├── sandbox/
│       │   └── manager.ts       # Sandbox Runtime Manager
│       ├── ai.ts                # Vercel AI SDK Config
│       └── utils.ts             # Utility Functions
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── .env.example
```

## Installation

### 1. Install Dependencies (จาก Root Monorepo)

```bash
cd /workspace
pnpm install
```

### 2. Setup Environment Variables

คัดลอก `.env.example` เป็น `.env.local`:

```bash
cp packages/support-agent/.env.example packages/support-agent/.env.local
```

แก้ไขค่าใน `.env.local`:

```bash
# AI & Gateway
KILO_API_KEY=your_kilo_api_key_here
DOCS_URL=https://docs.example.com

# MCP OAuth
CLIENT_ID=https://kilocode.ai/.well-known/oauth-client/vscode-extension.json
REDIRECT_URI=http://127.0.0.1:0/callback

# Email Escalation
RESEND_API_KEY=re_your_key_here
SUPPORT_EMAIL=team@yourcompany.com

# OpenAI (for Vercel AI SDK)
OPENAI_API_KEY=sk-your-openai-key-here
```

### 3. Run Development Server

```bash
cd packages/support-agent
pnpm dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

## Usage

### Chat Interface

- พิมพ์ข้อความเพื่อโต้ตอบกับ Support Agent
- ใช้ Slash Commands:
  - `/agents` - แสดงรายชื่อเอเจนต์ทั้งหมด
  - `/newtask` - เริ่ม task ใหม่ด้วย context สะอาด
  - `/smol` - ย่อ context window

### Agent Modes

สลับโหมดเอเจนต์ด้วยปุ่ม ← → หรือใช้ Shortcut:
- **Support Agent** - จัดการคำถามลูกค้า
- **Code Assistant** - ช่วยเหลือการเขียนโค้ด
- **Task Planner** - วางแผนและจัดการงาน
- **Debug Expert** - แก้ไขปัญหาและ debug

### Skills System

Skills ถูกเก็บเป็นไฟล์ Markdown ใน Sandbox:
- Order Lookup - จัดการสถานะคำสั่งซื้อ
- Billing Support - การชำระเงินและใบแจ้งหนี้
- Technical Support - ปัญหาทางเทคนิค

## Architecture

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | พฤติกรรม (Persona) ของ AI |
| **System Prompt** | ตัวตนหลัก ส่งไปกับทุกข้อความ |
| **Skill** | คู่มือการทำงานเฉพาะทาง (Markdown files) |
| **Tool** | ความสามารถเชิงปฏิบัติการ |
| **Sandbox** | สภาพแวดล้อมแยกส่วน (Isolated E2B) |
| **Thread** | หน่วยการสนทนาภายใน Sandbox |
| **Relay** | บริการเชื่อมต่อแอปกับเอเจนต์ |

### Security Features

- ✅ PKCE (S256) สำหรับ OAuth ทั้งหมด
- ✅ Resource Binding ใน Token Request
- ✅ Secure Token Storage
- ✅ CSRF Protection ด้วย State Parameter
- ✅ Sandbox Isolation
- ✅ Command Sanitization
- ✅ Timeout Enforcement

## API Endpoints

### POST /api/chat

ส่งข้อความแชทและรับ response แบบ streaming

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "sessionId": "session_123",
  "mode": "support",
  "skills": []
}
```

**Response:** Streaming data (Vercel AI SDK format)

## License

MIT
