# Database Migrations

This project uses [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for managing database migrations.

## Prerequisites

Ensure your database is running:
```bash
docker-compose up -d
```

## Commands

### Generate Migrations
When you make changes to `lib/db/schema.ts`, run this command to generate a new migration file:
```bash
npm run db:generate
```
This will create a new SQL file in the `drizzle` directory.

### Apply Migrations
To apply the generated migrations to your local database:
```bash
npm run db:migrate
```

### Push Schema (Prototyping)
For quick prototyping without creating migration files (not recommended for production):
```bash
npm run db:push
```

### Drizzle Studio
To view and manage your data in a GUI:
```bash
npm run db:studio
```

## Troubleshooting

- **Connection Refused**: Ensure Docker container is running and port 5432 is exposed.
- **Authentication Failed**: Check `.env` file credentials match `docker-compose.yml`.
