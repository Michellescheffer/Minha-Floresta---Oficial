#!/bin/bash

# 🧹 Cleanup Supabase Edge Functions Script
# This script will clean up conflicting functions and deploy a working API

set -e  # Exit on any error

PROJECT_REF="rU06IlvghUgVuriI3TDGoV"

echo "🌳 Minha Floresta - Supabase Cleanup Script"
echo "==========================================="

# Step 1: Check authentication
echo "📋 Step 1: Checking Supabase authentication..."
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Not authenticated with Supabase CLI"
    echo "Please run: supabase login"
    exit 1
fi

echo "✅ Authenticated with Supabase"

# Step 2: Link to project
echo "📋 Step 2: Linking to project..."
supabase link --project-ref $PROJECT_REF

# Step 3: List existing functions
echo "📋 Step 3: Listing existing functions..."
echo "Current functions:"
supabase functions list --project-ref $PROJECT_REF || echo "No functions or error listing"

# Step 4: Clean up conflicting functions
echo "📋 Step 4: Cleaning up conflicting functions..."

# Try to delete potential conflicting functions (ignore errors)
echo "Attempting to delete conflicting functions..."
supabase functions delete make-server --project-ref $PROJECT_REF 2>/dev/null && echo "✅ Deleted make-server" || echo "ℹ️  make-server not found (OK)"
supabase functions delete server --project-ref $PROJECT_REF 2>/dev/null && echo "✅ Deleted server" || echo "ℹ️  server not found (OK)"
supabase functions delete minha-floresta-api --project-ref $PROJECT_REF 2>/dev/null && echo "✅ Deleted minha-floresta-api" || echo "ℹ️  minha-floresta-api not found (OK)"

# Step 5: Deploy the clean API function
echo "📋 Step 5: Deploying clean API function..."
if supabase functions deploy api --project-ref $PROJECT_REF; then
    echo "✅ Successfully deployed API function!"
else
    echo "❌ Failed to deploy API function"
    echo "💡 Try manual deployment via Supabase Dashboard:"
    echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
    echo "   2. Delete any existing functions"
    echo "   3. Create new function named 'api'"
    echo "   4. Copy code from /supabase/functions/api/index.ts"
    exit 1
fi

# Step 6: Check if environment variables are set
echo "📋 Step 6: Checking environment variables..."
echo "💡 Make sure to set these environment variables:"
echo "   supabase secrets set SUPABASE_URL=\"https://$PROJECT_REF.supabase.co\" --project-ref $PROJECT_REF"
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"YOUR_KEY_HERE\" --project-ref $PROJECT_REF"

# Step 7: Test the deployment
echo "📋 Step 7: Testing deployment..."
FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/api/status"
echo "Testing: $FUNCTION_URL"

if curl -s "$FUNCTION_URL" > /dev/null; then
    echo "✅ Function is responding!"
    echo "🎉 Deployment successful!"
    echo ""
    echo "📡 Your API endpoints:"
    echo "   Status: https://$PROJECT_REF.supabase.co/functions/v1/api/status"
    echo "   Projects: https://$PROJECT_REF.supabase.co/functions/v1/api/projects"
    echo "   Health: https://$PROJECT_REF.supabase.co/functions/v1/api/health"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Set environment variables (see above)"
    echo "   2. Run: node test-edge-function.js"
    echo "   3. Initialize data: curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/api/initialize"
else
    echo "⚠️  Function deployed but not responding yet"
    echo "💡 This might be normal - try again in a few seconds"
    echo "💡 Or set environment variables first"
fi

echo ""
echo "🏁 Cleanup script completed!"
echo "If you still get 403 errors, try manual deployment via dashboard."