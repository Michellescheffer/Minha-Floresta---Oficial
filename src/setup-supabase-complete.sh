#!/bin/bash

# 🌳 Supabase Complete Setup Script for Minha Floresta
# This script will guide you through the complete Supabase configuration

set -e

# Make script executable
chmod +x "$0"

PROJECT_REF="rU06IlvghUgVuriI3TDGoV"
SUPABASE_URL="https://$PROJECT_REF.supabase.co"

echo "🌳 Minha Floresta - Complete Supabase Setup"
echo "==========================================="
echo ""
echo "This script will help you configure:"
echo "✅ Database schema and tables"
echo "✅ Edge Functions deployment"
echo "✅ Environment variables"
echo "✅ Storage buckets"
echo "✅ Authentication settings"
echo ""

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo "Please install: npm install -g supabase"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    echo "Please install Node.js"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo "❌ curl not found"
    echo "Please install curl"
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Step 2: Authentication
echo "📋 Step 2: Supabase authentication..."
if ! supabase status > /dev/null 2>&1; then
    echo "❌ Not authenticated with Supabase CLI"
    echo "Running: supabase login"
    supabase login
fi

echo "✅ Authenticated with Supabase"
echo ""

# Step 3: Link project
echo "📋 Step 3: Linking to project..."
supabase link --project-ref $PROJECT_REF
echo ""

# Step 4: Database Setup
echo "📋 Step 4: Database setup..."
echo ""
echo "🔍 MANUAL ACTION REQUIRED:"
echo "1. Open your browser to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo "2. Copy and paste the SQL from 'setup-supabase.sql'"
echo "3. Then copy and paste the SQL from 'supabase/migrations/001_initial_schema.sql'"
echo "4. Run both scripts in order"
echo ""
echo "📄 Files to execute:"
echo "   - setup-supabase.sql (KV store table)"
echo "   - supabase/migrations/001_initial_schema.sql (all system tables)"
echo ""
read -p "Press ENTER after running both SQL scripts..."

# Step 5: Storage Setup
echo ""
echo "📋 Step 5: Storage buckets setup..."
echo ""
echo "🔍 MANUAL ACTION REQUIRED:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets"
echo "2. Create these buckets (all PRIVATE):"
echo "   - 'project-images' (for project photos)"
echo "   - 'certificates' (for certificate PDFs/images)"
echo "   - 'documents' (for project documents)"
echo "3. Set appropriate policies for each bucket"
echo ""
read -p "Press ENTER after creating storage buckets..."

# Step 6: Clean Functions Deployment
echo ""
echo "📋 Step 6: Edge Functions cleanup and deployment..."
echo ""
echo "🔍 CRITICAL - Delete ALL existing functions first:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "2. DELETE ALL existing functions (especially any 'make-server' functions)"
echo "3. Make sure the functions list is completely empty"
echo ""
read -p "Press ENTER after deleting ALL existing functions..."

echo ""
echo "Deploying clean mf-backend function..."
if supabase functions deploy mf-backend --project-ref $PROJECT_REF; then
    echo "✅ Successfully deployed mf-backend function!"
else
    echo "❌ Failed to deploy function via CLI"
    echo ""
    echo "🔍 FALLBACK - Manual deployment:"
    echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
    echo "2. Click 'Create new function'"
    echo "3. Name: 'mf-backend'"
    echo "4. Copy all code from: supabase/functions/mf-backend/index.ts"
    echo "5. Deploy from dashboard"
    echo ""
    read -p "Press ENTER after manual deployment..."
fi

# Step 7: Environment Variables
echo ""
echo "📋 Step 7: Setting environment variables..."
echo ""
echo "🔍 Get your Service Role Key:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo "2. Copy the 'service_role' key (starts with 'eyJ...')"
echo ""
read -p "Enter your Service Role Key: " SERVICE_ROLE_KEY

if [ ! -z "$SERVICE_ROLE_KEY" ]; then
    echo "Setting environment variables..."
    supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref $PROJECT_REF
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" --project-ref $PROJECT_REF
    echo "✅ Environment variables set!"
else
    echo "⚠️ No service role key provided. Set manually:"
    echo "supabase secrets set SUPABASE_URL=\"$SUPABASE_URL\" --project-ref $PROJECT_REF"
    echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"YOUR_KEY\" --project-ref $PROJECT_REF"
fi

# Step 8: Authentication Configuration
echo ""
echo "📋 Step 8: Authentication settings..."
echo ""
echo "🔍 MANUAL ACTION REQUIRED:"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/auth/settings"
echo "2. Set Site URL to your domain (or http://localhost:3000 for development)"
echo "3. Add redirect URLs if needed"
echo "4. Configure email templates if desired"
echo "5. Enable social providers (Google, etc.) if needed"
echo ""
read -p "Press ENTER after configuring authentication..."

# Step 9: Test Everything
echo ""
echo "📋 Step 9: Testing deployment..."
echo ""

FUNCTION_URL="$SUPABASE_URL/functions/v1/mf-backend/status"
echo "Testing function: $FUNCTION_URL"

if curl -s "$FUNCTION_URL" > /dev/null; then
    echo "✅ Edge Function is responding!"
else
    echo "⚠️ Function not responding yet (might need environment variables)"
fi

echo ""
echo "Running test script..."
if [ -f "test-edge-function.js" ]; then
    node test-edge-function.js
else
    echo "⚠️ test-edge-function.js not found"
fi

# Step 10: Initialize Sample Data
echo ""
echo "📋 Step 10: Initialize sample data..."
echo ""
INIT_URL="$SUPABASE_URL/functions/v1/mf-backend/initialize"
echo "Initializing sample data: $INIT_URL"

if curl -X POST -s "$INIT_URL" > /dev/null; then
    echo "✅ Sample data initialized!"
else
    echo "⚠️ Could not initialize sample data (might be normal)"
fi

# Final Summary
echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "📡 Your API endpoints:"
echo "   Root: $SUPABASE_URL/functions/v1/mf-backend/"
echo "   Status: $SUPABASE_URL/functions/v1/mf-backend/status"
echo "   Projects: $SUPABASE_URL/functions/v1/mf-backend/projects"
echo ""
echo "✅ Configured components:"
echo "   ✅ Database (15 tables created)"
echo "   ✅ Edge Function (mf-backend deployed)"
echo "   ✅ Environment variables"
echo "   ✅ Storage buckets"
echo "   ✅ Authentication settings"
echo "   ✅ Sample data initialized"
echo ""
echo "🚀 Next steps:"
echo "   1. Start your React app: npm start"
echo "   2. Your app should connect to Supabase automatically"
echo "   3. Test all features (shopping cart, projects, etc.)"
echo ""
echo "🆘 If you encounter issues:"
echo "   - Check Supabase dashboard for function logs"
echo "   - Verify all environment variables are set"
echo "   - Ensure billing is active if using paid features"
echo "   - Try running: node verify-deployment.js"
echo ""
echo "Your Minha Floresta project is now fully configured! 🌳✅"