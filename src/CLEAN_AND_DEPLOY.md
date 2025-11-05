# 🧹 Clean Deployment of Minha Floresta API

This guide will completely clean up the conflicting Edge Functions and deploy a single, working API.

## 🔧 Problem Identified

You had **multiple conflicting Edge Functions**:
- ❌ `/supabase/functions/make-server/` 
- ❌ `/supabase/functions/minha-floresta-api/`
- ❌ `/supabase/functions/server/`

This was causing the 403 error because the deployment system was confused about which function to deploy.

## ✅ Solution Applied

I've created a **single, clean function**:
- ✅ `/supabase/functions/api/index.ts` - Simple, clean name that won't conflict

## 🚀 Step-by-Step Clean Deployment

### Step 1: Clean Up Old Functions (CLI)

```bash
# Delete any existing conflicting functions
supabase functions delete make-server --project-ref rU06IlvghUgVuriI3TDGoV 2>/dev/null || true
supabase functions delete minha-floresta-api --project-ref rU06IlvghUgVuriI3TDGoV 2>/dev/null || true
supabase functions delete server --project-ref rU06IlvghUgVuriI3TDGoV 2>/dev/null || true

# Verify cleanup
supabase functions list --project-ref rU06IlvghUgVuriI3TDGoV
```

### Step 2: Authenticate with Supabase

```bash
# Make sure you're authenticated
supabase status

# If not authenticated, login
supabase login

# Link to your project
supabase link --project-ref rU06IlvghUgVuriI3TDGoV
```

### Step 3: Set Up Database Table

Go to your Supabase SQL Editor and run:

```sql
-- Create the KV store table
CREATE TABLE IF NOT EXISTS kv_store_minha_floresta (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kv_store_minha_floresta ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
DROP POLICY IF EXISTS "Service role can manage all data" ON kv_store_minha_floresta;
CREATE POLICY "Service role can manage all data" ON kv_store_minha_floresta
FOR ALL USING (auth.role() = 'service_role');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_minha_floresta USING btree (key text_pattern_ops);
```

### Step 4: Set Environment Variables

```bash
# Set required environment variables
supabase secrets set SUPABASE_URL="https://rU06IlvghUgVuriI3TDGoV.supabase.co" --project-ref rU06IlvghUgVuriI3TDGoV

# Get your service role key from: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/settings/api
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE" --project-ref rU06IlvghUgVuriI3TDGoV
```

### Step 5: Deploy the Clean Function

```bash
# Deploy the new clean function
supabase functions deploy api --project-ref rU06IlvghUgVuriI3TDGoV

# Verify deployment
supabase functions list --project-ref rU06IlvghUgVuriI3TDGoV
```

### Step 6: Test the Deployment

```bash
# Run the test script
node test-edge-function.js
```

Or test manually:

```bash
# Test health endpoint
curl "https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/api/health"

# Test status endpoint
curl "https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/api/status"

# Test projects endpoint
curl "https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/api/projects"
```

## 🎯 Alternative: Dashboard Deployment

If CLI deployment still fails, use the Supabase Dashboard:

1. **Go to Functions**: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/functions

2. **Delete Old Functions**: Remove any existing functions named `make-server`, `minha-floresta-api`, or `server`

3. **Create New Function**:
   - Click "Create a new function"
   - Name: `api`
   - Copy code from `/supabase/functions/api/index.ts`
   - Deploy

4. **Set Environment Variables** in the dashboard:
   - `SUPABASE_URL`: `https://rU06IlvghUgVuriI3TDGoV.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

## ✅ What Should Work Now

After successful deployment:

1. **✅ Function URL**: `https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/api`
2. **✅ Your React App**: Will connect to the database successfully
3. **✅ All Endpoints**: Status, health, projects, social-projects, etc.
4. **✅ Database Operations**: Create, read, update, delete projects

## 🔍 Troubleshooting

If you still get 403 errors:

### Check Project Access
```bash
# Verify you have access to the project
supabase projects list
```

### Check Billing Status
- Go to: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/settings/billing
- Ensure billing is up to date (free tier has limits)

### Check Function Limits
Free tier limits:
- **500,000 function invocations per month**
- **400,000 GB-seconds compute per month**

### Manual Verification
1. Check that only one function exists: `supabase functions list`
2. Verify environment variables: `supabase secrets list`
3. Check function logs: `supabase functions logs api`

## 🎉 Success Indicators

You'll know it's working when:

1. **✅ No 403 errors** during deployment
2. **✅ Function appears** in `supabase functions list`
3. **✅ Health endpoint** returns `{"status": "ok"}`
4. **✅ Projects endpoint** returns `{"success": true, "data": []}`
5. **✅ Your React app** connects successfully

## 📞 Final Notes

- **Function name**: Changed to simple `api` to avoid conflicts
- **Clean structure**: Only one function directory exists
- **Updated configuration**: All configs point to the new function
- **React app ready**: Your app will automatically use the new API

The 403 error was caused by conflicting function names and directories. This clean setup should deploy successfully!

---

**Next Steps**:
1. Follow the deployment steps above
2. Run the test script to verify
3. Your Minha Floresta app should work perfectly!