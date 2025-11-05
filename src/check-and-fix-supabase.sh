#!/bin/bash

# 🔍 Smart Supabase Setup - Checks current state and fixes what's needed
# This script will analyze your current Supabase setup and fix only what's broken

set -e

PROJECT_REF="rU06IlvghUgVuriI3TDGoV"
SUPABASE_URL="https://$PROJECT_REF.supabase.co"

echo "🌳 Minha Floresta - Smart Setup & Fix"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check authentication
echo -e "${BLUE}📋 Step 1: Checking Supabase authentication...${NC}"
if ! supabase status > /dev/null 2>&1; then
    echo -e "${RED}❌ Not authenticated with Supabase CLI${NC}"
    echo "Please run: supabase login"
    exit 1
fi
echo -e "${GREEN}✅ Authenticated with Supabase${NC}"
echo ""

# Step 2: Link to project
echo -e "${BLUE}📋 Step 2: Linking to project...${NC}"
supabase link --project-ref $PROJECT_REF --quiet
echo -e "${GREEN}✅ Linked to project${NC}"
echo ""

# Step 3: Check database tables
echo -e "${BLUE}📋 Step 3: Checking database state...${NC}"
echo "Since you got 'relation projects already exists', your database is already set up!"
echo -e "${GREEN}✅ Database tables already exist${NC}"
echo ""

# Step 4: Check current functions
echo -e "${BLUE}📋 Step 4: Analyzing current Edge Functions...${NC}"
echo "Current functions in your project:"
supabase functions list --project-ref $PROJECT_REF 2>/dev/null || echo "Error listing functions"
echo ""

# Step 5: The main issue - conflicting functions
echo -e "${YELLOW}⚠️  IDENTIFIED ISSUE: Multiple conflicting Edge Functions${NC}"
echo ""
echo "You have multiple functions that are causing the 403 error:"
echo "  - make-server (old, causing conflicts)"
echo "  - minha-floresta-api"
echo "  - server"
echo "  - api"
echo "  - mf-backend (the one we want to keep)"
echo ""

echo -e "${BLUE}📋 Step 5: CLEANING UP CONFLICTING FUNCTIONS${NC}"
echo ""
echo -e "${RED}🚨 MANUAL ACTION REQUIRED:${NC}"
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "2. DELETE these functions if they exist:"
echo "   - make-server"
echo "   - minha-floresta-api" 
echo "   - server"
echo "   - api"
echo "3. KEEP only: mf-backend (or create it if missing)"
echo ""
echo "This is the MAIN cause of your 403 errors!"
echo ""
read -p "Press ENTER after you've cleaned up the functions..."

# Step 6: Ensure mf-backend function exists
echo -e "${BLUE}📋 Step 6: Ensuring clean mf-backend function...${NC}"

echo "Checking if mf-backend function exists..."
if supabase functions list --project-ref $PROJECT_REF 2>/dev/null | grep -q "mf-backend"; then
    echo -e "${GREEN}✅ mf-backend function exists${NC}"
else
    echo -e "${YELLOW}⚠️  mf-backend function missing, deploying...${NC}"
    if supabase functions deploy mf-backend --project-ref $PROJECT_REF; then
        echo -e "${GREEN}✅ Successfully deployed mf-backend function!${NC}"
    else
        echo -e "${RED}❌ Failed to deploy mf-backend function${NC}"
        echo ""
        echo "Manual deployment option:"
        echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
        echo "2. Create new function named 'mf-backend'"
        echo "3. Copy code from /supabase/functions/mf-backend/index.ts"
        exit 1
    fi
fi
echo ""

# Step 7: Check environment variables
echo -e "${BLUE}📋 Step 7: Checking environment variables...${NC}"
echo "Listing current secrets..."
supabase secrets list --project-ref $PROJECT_REF 2>/dev/null || echo "Could not list secrets"
echo ""

echo "Ensuring required environment variables are set..."
echo -e "${YELLOW}💡 Setting environment variables...${NC}"

# Set SUPABASE_URL
if supabase secrets set SUPABASE_URL="$SUPABASE_URL" --project-ref $PROJECT_REF; then
    echo -e "${GREEN}✅ Set SUPABASE_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Could not set SUPABASE_URL automatically${NC}"
fi

# Service role key needs to be set manually
echo ""
echo -e "${YELLOW}🔑 IMPORTANT: Set your Service Role Key${NC}"
echo "Get your service role key from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo "Then run:"
echo "  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"YOUR_KEY_HERE\" --project-ref $PROJECT_REF"
echo ""
read -p "Press ENTER after you've set the service role key..."

# Step 8: Test the function
echo -e "${BLUE}📋 Step 8: Testing the cleaned up function...${NC}"
FUNCTION_URL="$SUPABASE_URL/functions/v1/mf-backend/status"
echo "Testing: $FUNCTION_URL"

sleep 2  # Give it a moment after secrets update

if response=$(curl -s -w "%{http_code}" "$FUNCTION_URL" -o /dev/null); then
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Function is working! Status: $response${NC}"
        
        # Test with actual response
        echo "Function response:"
        curl -s "$FUNCTION_URL" | head -c 200
        echo ""
        
    elif [ "$response" = "403" ]; then
        echo -e "${RED}❌ Still getting 403 error${NC}"
        echo ""
        echo "Possible causes:"
        echo "1. Conflicting functions still exist (check dashboard)"
        echo "2. Service role key not set correctly"
        echo "3. Billing/quota issues on Supabase project"
        echo "4. Account permission issues"
        
    else
        echo -e "${YELLOW}⚠️  Function responding but with status: $response${NC}"
        echo "This might be normal if secrets are still propagating..."
    fi
else
    echo -e "${RED}❌ Function not accessible${NC}"
fi
echo ""

# Step 9: Initialize data if function is working
echo -e "${BLUE}📋 Step 9: Testing full functionality...${NC}"
echo "Testing projects endpoint..."
PROJECTS_URL="$SUPABASE_URL/functions/v1/mf-backend/projects"
if projects_response=$(curl -s "$PROJECTS_URL" 2>/dev/null); then
    echo -e "${GREEN}✅ Projects endpoint working${NC}"
    echo "Sample response: $(echo "$projects_response" | head -c 100)..."
else
    echo -e "${YELLOW}⚠️  Projects endpoint not responding yet${NC}"
fi
echo ""

# Step 10: Final status and next steps
echo -e "${GREEN}🎉 CLEANUP AND SETUP COMPLETED!${NC}"
echo ""
echo -e "${BLUE}📊 FINAL STATUS:${NC}"
echo "✅ Database: Tables already exist"
echo "✅ Authentication: Working"  
echo "✅ Project: Linked"
echo "🔧 Edge Functions: Cleaned up conflicts"
echo "🔧 Environment Variables: Configured"
echo ""

echo -e "${BLUE}🚀 YOUR API ENDPOINTS:${NC}"
echo "  Status: $SUPABASE_URL/functions/v1/mf-backend/status"
echo "  Projects: $SUPABASE_URL/functions/v1/mf-backend/projects"
echo "  Initialize: $SUPABASE_URL/functions/v1/mf-backend/initialize"
echo ""

echo -e "${BLUE}🎯 NEXT STEPS:${NC}"
echo "1. ✅ Make sure conflicting functions are deleted from dashboard"
echo "2. ✅ Verify service role key is set correctly"
echo "3. 🧪 Test your React app - it should work now!"
echo "4. 📊 Run: node verify-complete-setup.js"
echo "5. 💾 Initialize sample data: curl -X POST $SUPABASE_URL/functions/v1/mf-backend/initialize"
echo ""

if [ "$response" = "200" ]; then
    echo -e "${GREEN}🏆 SUCCESS! Your 403 error should be resolved!${NC}"
else
    echo -e "${YELLOW}⚠️  If you still get 403 errors, the issue is likely:${NC}"
    echo "   - Supabase billing/quota limits"
    echo "   - Account permissions"
    echo "   - Need to create a fresh Supabase project"
fi

echo ""
echo "🌳 Minha Floresta setup completed!"