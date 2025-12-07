#!/bin/bash
set -e

echo "Generating production seed data from data/sitters.json..."
if [ ! -f "scripts/generate_prod_seed.ts" ]; then
    echo "Error: scripts/generate_prod_seed.ts not found."
    exit 1
fi

# Ensure dependencies for the script
# We need tsx installed or use npx
npx tsx scripts/generate_prod_seed.ts

echo "Production seed script generated at supabase/seed_prod.sql"
echo ""
echo "----------------------------------------------------------------"
echo "READY TO DEPLOY TO PRODUCTION (vzbvjshrhtrdunlkfadf)"
echo "----------------------------------------------------------------"
echo "This script will:"
echo "1. Push database migrations to the production database."
echo "2. Wipe and re-seed the production database with Admin and Sitter data."
echo ""
echo "WARNING: This will TRUNCATE existing data in production tables."
echo "Ensure you have your Production Connection String ready."
echo "(It looks like: postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres)"
echo ""
read -p "Enter Production Database Connection URL: " DB_URL

if [ -z "$DB_URL" ]; then
    echo "No URL provided. Aborting."
    exit 1
fi

echo ""
echo "Pushing migrations..."
npx supabase db push --db-url "$DB_URL"

echo ""

echo "Applying seed data..."
# Use psql to execute the file. 
if command -v psql &> /dev/null; then
    psql "$DB_URL" -f supabase/seed_prod.sql
else
    echo "Error: 'psql' command not found. Cannot apply seed data."
    echo "Please install PostgreSQL client tools or run the SQL in 'supabase/seed_prod.sql' manually via the Supabase Dashboard SQL Editor."
    exit 1
fi

echo ""
echo "----------------------------------------------------------------"
echo "MIGRATING SITTER IMAGES TO PRODUCTION STORAGE"
echo "----------------------------------------------------------------"
echo "This will check public/sitters/ and upload missing images to your production bucket."
read -p "Enter Production Project URL (e.g. https://xyz.supabase.co): " PROD_PROJECT_URL
read -p "Enter Production Service Role Key: " PROD_SERVICE_KEY

if [ -n "$PROD_PROJECT_URL" ] && [ -n "$PROD_SERVICE_KEY" ]; then
    echo "Starting image migration..."
    # Run the node script with explicit environment variables
    PROD_SUPABASE_URL="$PROD_PROJECT_URL" PROD_SUPABASE_SERVICE_KEY="$PROD_SERVICE_KEY" node scripts/migrate_sitter_images.js
else
    echo "Skipping image migration (missing URL or Key)."
fi

echo ""
echo "Deployment Complete!"
