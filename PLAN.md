# Patchbay

A/V technical documentation and diagramming platform for signal flow, network topology, and asset management.

---

## Overview

Patchbay enables A/V teams to create detailed technical documentation and diagrams for networks, signal flow, and asset management. Future phases will include SIEM-like functionality for uptime monitoring, status tracking, and log aggregation.

**Target Users**: Small team (5-20 people) in an A/V department

**Hosting**: Self-hosted (on-premises)

**Authentication**: Local credentials (LDAP/AD deferred to future)

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | SSR, API routes built-in, TypeScript, React Server Components |
| Language | TypeScript | Type safety across frontend and backend |
| Diagrams (Structured) | React Flow | Drag-and-drop nodes, edges, ports — ideal for signal flow |
| Diagrams (Freeform) | Excalidraw | Whiteboard-style, hand-drawn aesthetic for brainstorming |
| Database | PostgreSQL | Robust, self-hosted, excellent for relational data |
| ORM | Prisma | Type-safe queries, migrations, schema management |
| Authentication | NextAuth.js v5 | Built-in LDAP/Active Directory provider |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development, accessible components |
| Deployment | Docker Compose | Single-command deploy, portable across servers |
| File Storage | Local filesystem or MinIO | Self-hosted S3-compatible storage for attachments |

### Key Dependencies

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "prisma": "^5.x",
  "@prisma/client": "^5.x",
  "next-auth": "^5.x",
  "@xyflow/react": "^12.x",
  "@excalidraw/excalidraw": "^0.17.x",
  "tailwindcss": "^3.x",
  "zod": "^3.x",
  "tRPC": "^11.x (optional)"
}
```

---

## Project Structure

```
Patchbay/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── error/
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx           # Dashboard shell, nav
│   │   ├── page.tsx             # Home / overview
│   │   ├── systems/             # System documentation
│   │   │   ├── page.tsx         # List systems
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx     # View system
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── diagrams/            # Interactive diagrams
│   │   │   ├── page.tsx         # List diagrams
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx     # View diagram
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   ├── assets/              # Asset inventory
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   └── new/
│   │   └── settings/            # User/app settings
│   ├── api/                     # API routes
│   │   ├── auth/[...nextauth]/  # NextAuth handlers
│   │   ├── systems/
│   │   ├── diagrams/
│   │   ├── assets/
│   │   └── trpc/                # tRPC router (if used)
│   ├── layout.tsx               # Root layout
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── diagrams/
│   │   ├── SignalFlowEditor.tsx # React Flow wrapper
│   │   ├── WhiteboardEditor.tsx # Excalidraw wrapper
│   │   ├── NodePalette.tsx      # Draggable component library
│   │   └── types.ts             # Custom node/edge types
│   ├── systems/
│   │   ├── SystemCard.tsx
│   │   ├── SystemForm.tsx
│   │   └── SystemList.tsx
│   ├── assets/
│   │   ├── AssetTable.tsx
│   │   └── AssetForm.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── NavItem.tsx
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── ldap.ts                  # LDAP client utilities
│   ├── prisma.ts                # Prisma client singleton
│   ├── validations/             # Zod schemas
│   └── utils.ts                 # Shared utilities
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
├── public/
│   └── icons/                   # Diagram component icons
├── types/
│   └── index.ts                 # Shared TypeScript types
├── middleware.ts                # Auth middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  username      String   @unique
  role          Role     @default(VIEWER)
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  systems       System[]
  diagrams      Diagram[]
  documents     Document[]
  assets        Asset[]
  auditLogs     AuditLog[]

  @@map("users")
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

model System {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String?  @db.Text
  location      String?
  category      String?  // e.g., "Video", "Audio", "Control", "Network"
  status        SystemStatus @default(OPERATIONAL)
  metadata      Json?    // Flexible key-value storage
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  diagrams      Diagram[]
  documents     Document[]
  assets        Asset[]
  devices       Device[]

  @@map("systems")
}

enum SystemStatus {
  OPERATIONAL
  DEGRADED
  OFFLINE
  MAINTENANCE
  UNKNOWN
}

model Diagram {
  id            String   @id @default(cuid())
  title         String
  description   String?  @db.Text
  type          DiagramType
  data          Json     // React Flow or Excalidraw JSON
  thumbnailUrl  String?
  systemId      String?
  system        System?  @relation(fields: [systemId], references: [id])
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("diagrams")
}

enum DiagramType {
  SIGNAL_FLOW    // React Flow - structured
  WHITEBOARD     // Excalidraw - freeform
  NETWORK
  RACK_LAYOUT
}

model Document {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text  // Markdown content
  systemId      String?
  system        System?  @relation(fields: [systemId], references: [id])
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("documents")
}

model Asset {
  id            String   @id @default(cuid())
  name          String
  serialNumber  String?
  model         String?
  manufacturer  String?
  purchaseDate  DateTime?
  warrantyEnd   DateTime?
  location      String?
  status        AssetStatus @default(ACTIVE)
  notes         String?  @db.Text
  systemId      String?
  system        System?  @relation(fields: [systemId], references: [id])
  createdById   String
  createdBy     User     @relation(fields: [createdById], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("assets")
}

enum AssetStatus {
  ACTIVE
  IN_STORAGE
  IN_REPAIR
  RETIRED
  LOST
}

// Phase 2/3: SIEM-lite features

model Device {
  id            String   @id @default(cuid())
  name          String
  ipAddress     String?
  macAddress    String?
  deviceType    String?  // e.g., "Switcher", "Projector", "DSP"
  manufacturer  String?
  model         String?
  status        DeviceStatus @default(UNKNOWN)
  lastSeenAt    DateTime?
  systemId      String
  system        System   @relation(fields: [systemId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  logs          DeviceLog[]

  @@map("devices")
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  WARNING
  ERROR
  UNKNOWN
}

model DeviceLog {
  id            String   @id @default(cuid())
  deviceId      String
  device        Device   @relation(fields: [deviceId], references: [id])
  level         LogLevel
  message       String   @db.Text
  source        String?  // syslog, snmp, manual
  rawLog        String?  @db.Text  // Original log if parsed
  timestamp     DateTime @default(now())

  @@index([deviceId, timestamp])
  @@map("device_logs")
}

enum LogLevel {
  DEBUG
  INFO
  WARNING
  ERROR
  CRITICAL
}

model AuditLog {
  id            String   @id @default(cuid())
  action        String   // CREATE, UPDATE, DELETE
  entityType    String   // System, Diagram, Asset, etc.
  entityId      String
  changes       Json?    // Before/after values
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now())

  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

---

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/patchbay?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# App
NODE_ENV="development"

# Future: LDAP / Active Directory
# LDAP_URL="ldap://dc.company.local:389"
# LDAP_BIND_DN="CN=svc_patchbay,OU=Service Accounts,DC=company,DC=local"
# LDAP_BIND_PASSWORD="secret"
# LDAP_BASE_DN="DC=company,DC=local"
# LDAP_SEARCH_FILTER="(sAMAccountName={username})"
```

---

## Docker Compose

```yaml
# docker/docker-compose.yml

version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://patchbay:patchbay@db:5432/patchbay
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=patchbay
      - POSTGRES_PASSWORD=patchbay
      - POSTGRES_DB=patchbay
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Phased Roadmap

### Phase 1: MVP (4-6 weeks) — ✅ COMPLETE

**Goal**: Core documentation and basic diagramming

- [x] Project scaffold (Next.js, TypeScript, Tailwind, Prisma)
- [x] Docker setup for local development
- [x] Database schema & migrations
- [x] Local credentials authentication via NextAuth.js (LDAP/AD deferred)
- [x] Dashboard layout with navigation
- [x] Systems CRUD (create, read, update, delete)
- [x] Documents (markdown editor for system documentation)
- [x] React Flow diagram editor
  - Custom node types (video source, display, switcher, audio mixer, etc.)
  - Save/load diagrams to database
  - Basic node palette
- [x] Assets inventory (list view, CRUD)
- [x] Rack layout management
- [x] Basic search functionality

### Phase 2: Enhanced Documentation (3-4 weeks) — 🔄 IN PROGRESS

**Goal**: Richer diagramming and better UX

- [x] Excalidraw integration for freeform whiteboard diagrams
- [x] Diagram templates (video rack, audio rack, network topology)
- [x] Improved node library with A/V-specific icons
- [x] Rich text editor for documents (multiple content types: Rich Text, Markdown, Plain Text)
- [ ] File attachments for systems/documents
- [ ] Advanced filtering and search
- [ ] User role management (admin/editor/viewer permissions)
- [ ] Audit logging for all changes

### Phase 3: SIEM-Lite Features (4-6 weeks)

**Goal**: Monitoring and log aggregation

- [ ] Device model and device list per system
- [ ] Manual status updates for devices
- [ ] Status dashboard (system health overview)
- [ ] Syslog receiver (UDP/TCP listener for device logs)
- [ ] Log viewer with filtering and search
- [ ] Basic SNMP polling (optional)
- [ ] Uptime history tracking
- [ ] Alert thresholds (email or webhook notifications)
- [ ] Retention policies for logs

---

## Diagram Node Types (React Flow)

Custom nodes to create for signal flow diagrams:

### Video
- `VideoSource` — Camera, Media Player, Computer
- `Display` — Projector, Monitor, LED Wall
- `VideoSwitcher` — Matrix, Presentation Switcher
- `Processor` — Scaler, Encoder, Decoder

### Audio
- `AudioSource` — Microphone, Media Player
- `Speaker` — Ceiling Speaker, Floor Monitor
- `AudioMixer` — DSP, Analog Mixer
- `Amplifier` — Power Amp

### Control/Network
- `Controller` — Control Processor (Crestron, Extron, etc.)
- `NetworkSwitch` — Network switch, router
- `TouchPanel` — Control touch panel

### Generic
- `Input` — Signal input port
- `Output` — Signal output port
- `Label` — Text annotation
- `Group` — Container for related nodes

---

## Key Technical Decisions

### Why Next.js?
- Single codebase for frontend and backend API
- Built-in SSR for fast initial loads
- App Router provides modern React patterns
- Easy to deploy with Docker
- Large ecosystem and community

### Why React Flow + Excalidraw?
- React Flow: Perfect for structured signal flow with ports, connections, and validation
- Excalidraw: Great for brainstorming, informal diagrams, and quick sketches
- Both store state as JSON, easy to persist in PostgreSQL
- Both are actively maintained and have good TypeScript support

### Why Prisma?
- Type-safe database access
- Schema as code (migrations are generated)
- Great DX with Prisma Studio for debugging
- Works well with PostgreSQL

### Why Local Credentials via NextAuth?
- Simple to implement and manage for small teams
- Users can be created/managed within the application
- LDAP/AD integration possible later if needed
- Group/role mapping available within app

### Why PostgreSQL over SQLite?
- Better concurrency for multi-user access
- JSON column type for diagram data
- More robust for production use
- Easy to backup and maintain

---

## Future Considerations

### Real-time Collaboration
If needed later, consider:
- Liveblocks or Yjs for CRDT-based collaboration
- WebSockets via Pusher or Socket.io
- Presence indicators (who's viewing/editing)

### Mobile App
- React Native could share components
- Focus on viewing and quick status updates

### API for Integrations
- REST or GraphQL API for external tools
- Webhooks for status changes
- Potential integration with IT service management (ITSM) tools

### Backup Strategy
- PostgreSQL dumps scheduled via cron
- Diagram JSON versioning (keep history)
- S3-compatible storage for file attachments

---

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run with Docker Compose
cd docker && docker-compose up -d
```

---

## Questions for Future Clarification

1. **LDAP Group Mapping**: Should roles (Admin/Editor/Viewer) be derived from AD groups?
2. **Public Access**: Should any documentation be viewable without login?
3. **Export Formats**: Need PDF/Image export for diagrams?
4. **Import**: Need to import existing Visio/draw.io diagrams?
5. **Mobile Priority**: Is mobile access critical for field troubleshooting?
6. **Multi-tenancy**: Single org or need to support multiple departments/locations?

---

*Last updated: February 2026*
