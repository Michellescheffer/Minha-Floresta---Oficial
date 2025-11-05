#!/bin/bash

# 🔥 Clean Deployment Script for Minha Floresta
# This script will deploy a single, clean Edge Function

set -e

PROJECT_REF="rU06IlvghUgVuriI3TDGoV"

echo "🌳 Minha Floresta - Clean Deployment"
echo "===================================="
echo ""

# Step 1: Check authentication
echo "📋 Step 1: Checking Supabase authentication..."
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Not authenticated with Supabase CLI"
    echo "Please run: supabase login"
    exit 1
fi
echo "✅ Authenticated with Supabase"
echo ""

# Step 2: Link to project
echo "📋 Step 2: Linking to project..."
supabase link --project-ref $PROJECT_REF
echo ""

# Step 3: List existing functions
echo "📋 Step 3: Checking existing functions..."
echo "Current functions:"
supabase functions list --project-ref $PROJECT_REF || echo "No functions or error listing"
echo ""

# Step 4: Delete conflicting functions
echo "📋 Step 4: Cleaning up conflicting functions..."
echo "⚠️  MANUAL STEP REQUIRED:"
echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "   2. DELETE ALL existing functions (especially 'make-server')"
echo "   3. Make sure the functions list is completely empty"
echo ""
read -p "Press ENTER after you've deleted all functions in the dashboard..."

# Step 5: Deploy the clean function
echo "📋 Step 5: Deploying clean mf-backend function..."
if supabase functions deploy mf-backend --project-ref $PROJECT_REF; then
    echo "✅ Successfully deployed mf-backend function!"
else
    echo "❌ Failed to deploy mf-backend function"
    echo ""
    echo "💡 Try manual deployment:"
    echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
    echo "   2. Create new function named 'mf-backend'"
    echo "   3. Copy code from /supabase/functions/mf-backend/index.ts"
    echo "   4. Deploy from dashboard"
    exit 1
fi
echo ""

# Step 6: Check environment variables
echo "📋 Step 6: Environment variables..."
echo "💡 Make sure to set these environment variables:"
echo "   supabase secrets set SUPABASE_URL=\"https://$PROJECT_REF.supabase.co\" --project-ref $PROJECT_REF"
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"YOUR_KEY_HERE\" --project-ref $PROJECT_REF"
echo ""

# Step 7: Test the deployment
echo "📋 Step 7: Testing deployment..."
FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/mf-backend/status"
echo "Testing: $FUNCTION_URL"

if curl -s "$FUNCTION_URL" > /dev/null; then
    echo "✅ Function is responding!"
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "📡 Your new API endpoints:"
    echo "   Root: https://$PROJECT_REF.supabase.co/functions/v1/mf-backend/"
    echo "   Status: https://$PROJECT_REF.supabase.co/functions/v1/mf-backend/status"
    echo "   Projects: https://$PROJECT_REF.supabase.co/functions/v1/mf-backend/projects"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Set environment variables (see above)"
    echo "   2. Run: node test-edge-function.js"
    echo "   3. Initialize data: curl -X POST https://$PROJECT_REF.supabase.co/functions/v1/mf-backend/initialize"
    echo "   4. Your React app should now work!"
else
    echo "⚠️  Function deployed but not responding yet"
    echo "💡 This might be normal - try setting environment variables first"
fi

echo ""
echo "🏁 Clean deployment completed!"
echo ""
echo "If you still get 403 errors, the issue might be:"
echo "   - Billing/quota limits on your Supabase project"
echo "   - Account permissions"
echo "   - Need to create a new Supabase project"