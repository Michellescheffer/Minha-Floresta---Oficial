#!/bin/bash

# Script to fix Supabase Edge Function deployment issues
# Run this script to clean up and deploy the correct function

echo "🧹 Cleaning up Supabase Edge Functions..."

# Step 1: Delete any existing conflicting functions
echo "📝 Step 1: Removing conflicting functions..."
supabase functions delete make-server --project-ref rU06IlvghUgVuriI3TDGoV 2>/dev/null || echo "make-server function not found (OK)"
supabase functions delete minha-floresta-api --project-ref rU06IlvghUgVuriI3TDGoV 2>/dev/null || echo "minha-floresta-api function not found (OK)"
supabase functions delete server --project-ref rU06IlvghUgVuriI3TDGoV 2>/dev/null || echo "server function not found (OK)"

# Step 2: Check authentication
echo "🔐 Step 2: Checking authentication..."
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Not authenticated with Supabase. Please run:"
    echo "   supabase login"
    echo "   supabase link --project-ref rU06IlvghUgVuriI3TDGoV"
    exit 1
fi

echo "✅ Authentication OK"

# Step 3: Deploy the clean API function
echo "🚀 Step 3: Deploying the new API function..."
if supabase functions deploy api --project-ref rU06IlvghUgVuriI3TDGoV; then
    echo "✅ Function deployed successfully!"
else
    echo "❌ Function deployment failed. Trying alternative method..."
    echo "📖 Please deploy manually through Supabase Dashboard:"
    echo "   1. Go to: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/functions"
    echo "   2. Click 'Create a new function'"
    echo "   3. Name: api"
    echo "   4. Copy code from: /supabase/functions/api/index.ts"
    echo "   5. Deploy"
    exit 1
fi

# Step 4: Set environment variables
echo "🔧 Step 4: Setting environment variables..."
if supabase secrets set SUPABASE_URL="https://rU06IlvghUgVuriI3TDGoV.supabase.co" --project-ref rU06IlvghUgVuriI3TDGoV; then
    echo "✅ SUPABASE_URL set"
else
    echo "⚠️  Failed to set SUPABASE_URL"
fi

echo "📋 Please set your service role key manually:"
echo "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"YOUR_SERVICE_ROLE_KEY\" --project-ref rU06IlvghUgVuriI3TDGoV"
echo ""
echo "   You can find your service role key at:"
echo "   https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/settings/api"

# Step 5: Test the deployment
echo "🧪 Step 5: Testing deployment..."
echo "Testing API endpoint..."

if curl -s "https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/api/health" > /dev/null; then
    echo "✅ API is responding!"
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set your service role key (see command above)"
    echo "2. Run: node test-edge-function.js"
    echo "3. Initialize sample data by calling the /initialize endpoint"
    echo ""
    echo "🌐 Your API is available at:"
    echo "   https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/api"
else
    echo "⚠️  API not responding yet. This is normal and may take a few minutes."
    echo "   Try testing again in 2-3 minutes with: node test-edge-function.js"
fi

echo ""
echo "🔗 Useful links:"
echo "   - Supabase Functions: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/functions"
echo "   - Function Logs: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/logs/edge-functions"
echo "   - API Settings: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/settings/api"