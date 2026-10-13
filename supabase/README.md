# Supabase Database Setup & Migration Guide

This directory contains the database schema and seed data for **Home Spoken Centre**.

## Contents

- `migrations/001_initial_schema.sql`: Contains table definitions, indexes, automated timestamp triggers, and Row Level Security (RLS) policies.
- `seed.sql`: Initial seed data containing all course categories, lessons, and topic structure matching the visual reference.

## Setup Instructions

1. Log into your Supabase Dashboard at [supabase.com](https://supabase.com).
2. Create a new Supabase project (e.g. `home-spoken-centre`).
3. Open the **SQL Editor** in your Supabase dashboard.
4. Copy and execute `migrations/001_initial_schema.sql`.
5. Copy and execute `seed.sql`.
6. Retrieve your Project URL, Anon Key, and Service Role Key from **Project Settings -> API**.
7. Add these keys to your `.env` file or Vercel environment variables.
