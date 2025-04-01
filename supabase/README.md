# WagerGenie Supabase Setup

This directory contains the Supabase database schema and setup instructions for WagerGenie.

## Database Schema

The database consists of three main tables:

1. `users` - Stores user information and subscription status
2. `picks_history` - Stores betting picks and their results
3. `subscriptions` - Manages Stripe subscription data

## Setup Instructions

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. Get your project credentials:
   - Go to Project Settings > API
   - Copy the Project URL (SUPABASE_URL)
   - Copy the anon/public key (SUPABASE_KEY)

3. Run the migration:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `migrations/20240325_initial_schema.sql`
   - Execute the SQL commands

4. Set up Row Level Security (RLS):
   - The migration file includes RLS policies
   - Verify in the Auth > Policies section that all policies are active

## Environment Variables

Add these to your `.env` file:

```bash
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-anon-key
```

## Table Relationships

```
users
  ├── picks_history (one-to-many)
  └── subscriptions (one-to-one)
```

## Row Level Security (RLS) Policies

### Users Table
- Users can only view and update their own profile

### Picks History Table
- Users can only view and create their own picks

### Subscriptions Table
- Users can only view their own subscription data

## Automatic User Creation

When a new user signs up through Supabase Auth:
1. The `handle_new_user()` function is triggered
2. Creates a new record in the `users` table
3. Sets up initial free subscription with 3 picks

## Testing

To test the setup:

1. Create a test user through Supabase Auth
2. Verify the user record is created in the `users` table
3. Try creating a pick and verify RLS policies
4. Test subscription status updates 