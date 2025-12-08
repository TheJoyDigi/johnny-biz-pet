#!/bin/bash

# Script to link to a Supabase project and push database changes
# Usage: ./scripts/link_and_push.sh [dev|prod]

ENV=$1

# Project References retrieved from Supabase MCP
DEV_REF="rkxekzzsirzujyuezvru"
PROD_REF="gqrbrrticbnibvnglwvs"

if [ -z "$ENV" ]; then
  echo "Error: No environment specified."
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

if [ "$ENV" == "dev" ]; then
  PROJECT_REF=$DEV_REF
  echo "🔗 Linking to rrr-dev ($PROJECT_REF)..."
elif [ "$ENV" == "prod" ]; then
  PROJECT_REF=$PROD_REF
  echo "🔗 Linking to rrr-prod ($PROJECT_REF)..."
  echo "⚠️  WARNING: YOU ARE ABOUT TO PUSH TO PRODUCTION."
  echo "THIS WILL MODIFY THE LIVE DATABASE."
  echo ""
  echo "To confirm, please type 'PRODUCTION' (all caps) and press Enter:"
  read -r CONFIRMATION
  if [ "$CONFIRMATION" != "PRODUCTION" ]; then
    echo "❌ Deployment aborted. Confirmation mismatch."
    exit 1
  fi
else
  echo "Error: Invalid environment '$ENV'. Use 'dev' or 'prod'."
  exit 1
fi

# Link the project
npx supabase link --project-ref "$PROJECT_REF"

if [ $? -ne 0 ]; then
  echo "❌ Failed to link project."
  exit 1
fi

echo "✅ Linked successfully."
echo "🚀 Pushing database changes..."

# Push migrations
npx supabase db push

if [ $? -eq 0 ]; then
  echo "✅ Database push complete!"
  
  # Logic to link back to dev if we just pushed to prod
  if [ "$ENV" == "prod" ]; then
    echo ""
    echo "🔄 RETURNING TO SAFE STATE..."
    echo "🔗 Linking back to rrr-dev ($DEV_REF)..."
    npx supabase link --project-ref "$DEV_REF"
    
    echo ""
    echo "***************************************************************"
    echo "* ATTENTION: ENVIRONMENT HAS BEEN RESET TO DEVELOPMENT (DEV)  *"
    echo "* PLEASE VERIFY YOUR LOCAL ENVIRONMENT BEFORE MAKING CHANGES  *"
    echo "***************************************************************"
  fi
else
  echo "❌ Database push failed."
  exit 1
fi
