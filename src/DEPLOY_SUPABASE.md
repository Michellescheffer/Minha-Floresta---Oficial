# 🚀 Deploy Minha Floresta to Supabase

This guide will help you deploy the Minha Floresta Edge Function to Supabase and fix the 403 error.

## 🔧 Prerequisites

1. **Supabase CLI** installed and authenticated
2. **Project access** to `rU06IlvghUgVuriI3TDGoV` 
3. **Service role key** available

## 📋 Step-by-Step Deployment

### Step 1: Authenticate with Supabase

```bash
# Check if you're logged in
supabase status

# If not authenticated, login
supabase login

# Link to your project (replace with your actual project ref)
supabase link --project-ref rU06IlvghUgVuriI3TDGoV
```

### Step 2: Set Up Database

1. Go to your Supabase project SQL Editor: 
   https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/sql

2. Copy and run the contents of `setup-supabase.sql`:

```sql
-- Create the KV store table for the Edge Function
CREATE TABLE IF NOT EXISTS kv_store_minha_floresta (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE kv_store_minha_floresta ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows the service role to manage all data
DROP POLICY IF EXISTS "Service role can manage all data" ON kv_store_minha_floresta;
CREATE POLICY "Service role can manage all data" ON kv_store_minha_floresta
FOR ALL USING (auth.role() = 'service_role');

-- Create an index for faster prefix searches
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_minha_floresta USING btree (key text_pattern_ops);
```

### Step 3: Deploy the Edge Function

```bash
# Deploy the function
supabase functions deploy minha-floresta-api --project-ref rU06IlvghUgVuriI3TDGoV

# Or deploy all functions
supabase functions deploy --project-ref rU06IlvghUgVuriI3TDGoV
```

### Step 4: Set Environment Variables

Find your service role key in Supabase Dashboard > Settings > API

```bash
# Set the required environment variables
supabase secrets set SUPABASE_URL="https://rU06IlvghUgVuriI3TDGoV.supabase.co" --project-ref rU06IlvghUgVuriI3TDGoV

supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE" --project-ref rU06IlvghUgVuriI3TDGoV
```

### Step 5: Test the Deployment

Run the test script to verify everything is working:

```bash
node test-edge-function.js
```

Or test manually in browser console:

```javascript
// Test the API
fetch('https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/minha-floresta-api/status')
  .then(r => r.json())
  .then(console.log);
```

## 🔍 Troubleshooting 403 Errors

### Common Causes and Solutions:

#### 1. **Authentication Issues**
```bash
# Re-authenticate
supabase logout
supabase login
supabase link --project-ref rU06IlvghUgVuriI3TDGoV
```

#### 2. **Function Name Conflicts**
- ✅ We changed from `make-server` to `minha-floresta-api`
- ✅ Removed conflicting function directories

#### 3. **Project Permissions**
- Check if you have owner/admin access to the Supabase project
- Verify billing is up to date (free tier has limits)

#### 4. **Service Role Key Missing**
```bash
# Check if secrets are set
supabase secrets list --project-ref rU06IlvghUgVuriI3TDGoV

# Set missing secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_key_here" --project-ref rU06IlvghUgVuriI3TDGoV
```

#### 5. **Alternative Deployment Method**

If CLI deployment fails, use Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/rU06IlvghUgVuriI3TDGoV/functions
2. Click "Create a new function"
3. Name: `minha-floresta-api`
4. Copy code from `/supabase/functions/minha-floresta-api/index.ts`
5. Deploy directly from dashboard

## ✅ Verification

After successful deployment, you should see:

1. **Function URL**: `https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/minha-floresta-api`
2. **Status endpoint**: Returns `{"status": "operational"}`
3. **Projects endpoint**: Returns empty array initially
4. **Your React app**: Connects successfully to the API

## 🌳 Next Steps

1. **Initialize Sample Data**: 
   ```bash
   curl -X POST https://rU06IlvghUgVuriI3TDGoV.supabase.co/functions/v1/minha-floresta-api/initialize
   ```

2. **Test Your App**: Your React app should now connect to the database

3. **Monitor Logs**: Check Supabase Function logs for any issues

## 📞 Need Help?

If you continue to get 403 errors:

1. Check your Supabase project billing status
2. Verify you have the correct permissions
3. Try the dashboard deployment method
4. Contact Supabase support if project access issues persist

---

**The main changes made to fix the 403 error:**
- ✅ Changed function name from `make-server` to `minha-floresta-api`
- ✅ Simplified dependencies (removed problematic npm packages)
- ✅ Created clean, conflict-free function structure
- ✅ Updated database configuration
- ✅ Added proper error handling and logging