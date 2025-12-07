#!/bin/bash
set -e

echo "----------------------------------------------------------------"
echo "DEPLOY TO PRODUCTION (CLI + API MODE)"
echo "----------------------------------------------------------------"
echo "This script works without a direct database connection string."
echo "It uses the Supabase CLI to push migrations and the API to seed data."
echo ""

# 1. Credentials
read -p "Enter Production Project Reference ID (default: qwbudrbxqyztytftzbfv): " PROD_REF
PROD_REF=${PROD_REF:-qwbudrbxqyztytftzbfv}

read -p "Enter Production Project URL (default: https://qwbudrbxqyztytftzbfv.supabase.co): " PROD_URL
PROD_URL=${PROD_URL:-https://qwbudrbxqyztytftzbfv.supabase.co}

read -p "Enter Production Service Role Key: " PROD_KEY

if [ -z "$PROD_REF" ] || [ -z "$PROD_URL" ] || [ -z "$PROD_KEY" ]; then
    echo "Missing required credentials. Aborting."
    exit 1
fi

echo ""
echo "----------------------------------------------------------------"
echo "STEP 1: LINKING PROJECT & PUSHING MIGRATIONS"
echo "----------------------------------------------------------------"
# Link project (might prompt for db password if not cached, user handles this)
npx supabase link --project-ref "$PROD_REF"

# Push Migrations (includes the admin_nuke_data function)
npx supabase db push

echo "Waiting for schema cache to refresh..."
sleep 10

echo ""
echo "----------------------------------------------------------------"
echo "STEP 2: SEEDING DATA (WIPE & RECREATE)"
echo "----------------------------------------------------------------"
echo "Wiping production database and re-creating users/sitters from data/sitters.json..."

# Run remote seeder with env vars
PROD_SUPABASE_URL="$PROD_URL" PROD_SUPABASE_SERVICE_KEY="$PROD_KEY" node scripts/seed_prod_remote.js

echo ""
echo "----------------------------------------------------------------"
echo "STEP 3: MIGRATING IMAGES"
echo "----------------------------------------------------------------"
echo "Syncing public/sitters/ images to Production Storage..."

# Run image migration
PROD_SUPABASE_URL="$PROD_URL" PROD_SUPABASE_SERVICE_KEY="$PROD_KEY" node scripts/migrate_sitter_images.js

echo ""
echo "----------------------------------------------------------------"
echo "DEPLOYMENT COMPLETE!"
echo "----------------------------------------------------------------"
echo "Don't forget to link back to your DEV project if you continue developing locally:"
echo "npx supabase link --project-ref dsnjzdtfezcsctdjlsje"
