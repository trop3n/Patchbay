# Patchbay

A/V technical documentation and diagramming platform.

## Features

- System documentation with markdown support
- Interactive signal flow diagrams (React Flow + Excalidraw)
- Asset inventory management
- LDAP/Active Directory authentication
- Self-hosted via Docker

## Quick Start

### Local Development (without Docker)

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Docker Development

```bash
cd docker
cp .env.example .env
# Edit .env with your LDAP settings
docker compose -f docker-compose.dev.yml up
```

### Docker Production

```bash
cd docker
cp .env.example .env
# Edit .env with your production settings
docker compose up -d
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Public URL of your application |
| `NEXTAUTH_SECRET` | Secret for JWT signing (generate with `openssl rand -base64 32`) |
| `LDAP_URL` | LDAP server URL (e.g., `ldap://dc.company.local:389`) |
| `LDAP_BIND_DN` | DN for LDAP bind account |
| `LDAP_BIND_PASSWORD` | Password for LDAP bind account |
| `LDAP_BASE_DN` | Base DN for user search |
| `LDAP_SEARCH_FILTER` | LDAP search filter (default: `(sAMAccountName={username})`) |

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
npm test                 # Run tests

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations (development)
npx prisma migrate deploy # Run migrations (production)
npx prisma db seed       # Seed database
npx prisma studio        # Open database GUI

# Docker
npm run docker:dev       # Start dev containers
npm run docker:dev:build # Rebuild and start dev containers
npm run docker:dev:down  # Stop dev containers
npm run docker:prod      # Start production containers
npm run docker:prod:build # Rebuild and start production containers
npm run docker:prod:down # Stop production containers
```

## Documentation

See [PLAN.md](./PLAN.md) for full architecture and development roadmap.

## License

Internal use only.
