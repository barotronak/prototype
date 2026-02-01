# Database Setup Guide

## Issue
The current Neon database URL in `.env` is not accessible, causing a 500 error on login.

## Quick Fix Options

### Option 1: Use Docker (Recommended for Local Development)

```bash
# Start PostgreSQL in Docker
docker run --name healthcare-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=healthcare_db \
  -p 5432:5432 \
  -d postgres:16

# Update .env with:
DATABASE_URL="postgresql://postgres:password@localhost:5432/healthcare_db"

# Run migrations and seed
npx prisma db push
npx prisma db seed
```

### Option 2: Install PostgreSQL Locally

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb healthcare_db

# Update .env with:
DATABASE_URL="postgresql://$(whoami)@localhost:5432/healthcare_db"

# Run migrations and seed
npx prisma db push
npx prisma db seed
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb healthcare_db
sudo -u postgres createuser $(whoami)

# Update .env with:
DATABASE_URL="postgresql://$(whoami)@localhost:5432/healthcare_db"

# Run migrations and seed
npx prisma db push
npx prisma db seed
```

### Option 3: Use a Free Cloud Database

**Neon (Free Tier):**
1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project
4. Copy the connection string
5. Update `.env` with your new connection string
6. Run migrations and seed:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

**Supabase (Free Tier):**
1. Go to https://supabase.com
2. Create a new project
3. Get the database URL from Settings → Database
4. Update `.env` with the connection string
5. Run migrations and seed:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

**Railway (Free Trial):**
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string
4. Update `.env`
5. Run migrations and seed

## After Setting Up Database

Once you have a working database connection:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# Seed database with sample data
npx prisma db seed

# Start the application
npm run dev
```

## Test Login Credentials

After seeding, you can login with these accounts:

**Admin:**
- Email: `admin@healthcare.com`
- Password: `admin123`

**Doctor:**
- Email: `dr.smith@healthcare.com`
- Password: `doctor123`

**Laboratory:**
- Email: `contact@citylab.com`
- Password: `lab123`

**Pharmacy:**
- Email: `contact@citypharmacy.com`
- Password: `pharmacy123`

**Patient:**
- Email: `john.doe@email.com`
- Password: `patient123`

## Troubleshooting

**Error: P1001 - Can't reach database server**
- Database is not running or URL is incorrect
- Check if PostgreSQL is running: `pg_isready` (if installed locally)
- Verify connection string in `.env`

**Error: P1003 - Database does not exist**
- Create the database: `createdb healthcare_db`
- Or let Prisma create it: `npx prisma db push`

**Error: Authentication failed**
- Check username/password in connection string
- For local PostgreSQL, you might need to configure `pg_hba.conf`

**Seed errors:**
- Make sure tables are created first: `npx prisma db push`
- Check that `lib/auth.ts` exports are correct
- Verify all validators match the schema
