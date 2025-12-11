#!/bin/bash

# Deploy Stripe Checkout Function
# Use this script to update the backend with the CORS fix.

echo "🚀 Starting deployment of 'stripe-checkout' function..."
echo "Project Ref: mcohgaxlxxhrbvajjsvh"

if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js."
    exit 1
fi

echo "📦 Running supabase functions deploy (forcing no-verify-jwt)..."
# Force deployment without verifying JWT (relying on no-verify-jwt flag)
npx -y supabase functions deploy stripe-checkout --project-ref mcohgaxlxxhrbvajjsvh --no-verify-jwt



if [ $? -eq 0 ]; then
    echo "✅ Deployment successful! The CORS error should be resolved."
else
    echo "❌ Deployment failed. Please check the error message above."
    echo "💡 Note: You may need to provide your Supabase Access Token if prompted."
fi
