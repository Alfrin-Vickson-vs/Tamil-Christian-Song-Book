# Supabase Setup Guide

Since you are hosting your database on Supabase, follow these instructions to get your app running correctly.

## 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Click on "New project".
3. Choose your organization, assign a project name, generate a strong database password, and select a region close to your users.

## 2. Environment Variables
1. Go to **Project Settings** -> **API**.
2. Copy the **Project URL** and the **`anon` `public` key**.
3. Duplicate the `.env.example` in this directory to `.env.local` or `.env`.
4. Paste the keys as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Database Schema setup
1. In your Supabase Dashboard, go to the **SQL Editor** tab.
2. Click **New query**.
3. Open `supabase/schema.sql` from your code editor, copy its contents, and paste it into the SQL Editor.
4. Click **Run** to execute the query. You should see "Success. No rows returned".
5. This creates tables for Users, Songs, Favorites, Playlists, Verses, and Announcements, along with basic RLS policies.

## 4. Setup Authentication Providers
1. In your Supabase Dashboard, go to **Authentication** -> **Providers**.
2. Ensure **Email** is enabled.
3. If you want Google Sign-In, enable **Google** and add your Google Cloud credentials (Client ID and Secret).

If any errors occur, review your connection string and ensure your database is awake!
