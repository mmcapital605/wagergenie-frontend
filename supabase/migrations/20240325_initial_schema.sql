-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table
create table if not exists public.users (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    name text not null,
    phone text,
    password_hash text not null,
    subscription_type text default 'free',
    last_pick_date timestamp with time zone,
    picks_remaining integer default 3,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create picks_history table
create table if not exists public.picks_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade,
    date timestamp with time zone not null,
    pick text not null,
    result text default 'Pending',
    confidence integer,
    odds text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create subscriptions table for Stripe integration
create table if not exists public.subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) on delete cascade,
    stripe_subscription_id text unique,
    stripe_customer_id text unique,
    plan_type text not null,
    status text not null,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create RLS policies
alter table public.users enable row level security;
alter table public.picks_history enable row level security;
alter table public.subscriptions enable row level security;

-- Users policies
create policy "Users can view own profile"
    on public.users for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.users for update
    using (auth.uid() = id);

-- Picks history policies
create policy "Users can view own picks"
    on public.picks_history for select
    using (auth.uid() = user_id);

create policy "Users can create own picks"
    on public.picks_history for insert
    with check (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscriptions"
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, email, name, subscription_type, picks_remaining)
    values (new.id, new.email, new.raw_user_meta_data->>'name', 'free', 3);
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user(); 