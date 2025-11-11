-- Migration: create tables for Stripe webhook persistence
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- stripe_payment_intents
create table if not exists public.stripe_payment_intents (
  id uuid primary key default gen_random_uuid(),
  stripe_payment_intent_id text unique not null,
  stripe_client_secret text,
  purchase_id uuid,
  donation_id uuid,
  amount numeric,
  currency text,
  status text,
  email text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table public.stripe_payment_intents enable row level security;

create policy if not exists "public_read_stripe_payment_intents"
  on public.stripe_payment_intents
  for select
  using (true);

-- stripe_events for idempotency/logging
create table if not exists public.stripe_events (
  id text primary key,
  type text,
  payload jsonb,
  created_at timestamptz default now()
);

alter table public.stripe_events enable row level security;

create policy if not exists "public_read_stripe_events"
  on public.stripe_events
  for select
  using (true);
