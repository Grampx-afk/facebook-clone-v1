# Facebook Clone

A full-stack Facebook clone built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

## Features

- ✅ Sign up / Login (via Supabase Auth + NextAuth)
- ✅ Create, view, delete posts
- ✅ Like / unlike posts (optimistic UI)
- ✅ Comment on posts, delete own comments
- ✅ Profile page with bio editing
- ✅ Paginated feed (10 posts per page)
- ✅ Row Level Security (users can only edit/delete their own data)

---

## Setup Guide

### 1. Clone & install

```bash
git clone <your-repo>
cd facebook-clone
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a name, database password, and region
3. Wait for it to provision (~1 min)

### 3. Run the database schema

1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the contents of `supabase-schema.sql`
3. Click **Run**

This creates:
- `profiles` table (linked to Supabase auth)
- `posts` table
- `likes` table
- `comments` table
- Row Level Security policies
- Auto-create profile trigger on signup
- Storage bucket for post images

### 4. Get your API keys

In Supabase → **Settings** → **API**:
- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 5. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXTAUTH_SECRET=run-this: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
facebook-clone/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx          # Login page
│   │   └── register/page.jsx       # Register page
│   ├── (main)/
│   │   ├── layout.jsx              # Auth guard + Navbar
│   │   ├── page.jsx                # Home feed
│   │   └── profile/[id]/page.jsx   # User profile
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/      # NextAuth handler
│   │   │   └── register/           # Sign up endpoint
│   │   ├── posts/
│   │   │   ├── route.js            # GET feed / POST create
│   │   │   └── [id]/
│   │   │       ├── route.js        # DELETE post
│   │   │       ├── like/route.js   # POST toggle like
│   │   │       └── comments/       # GET/POST/DELETE comments
│   │   └── users/[id]/route.js     # GET/PATCH profile
│   ├── layout.jsx                  # Root layout
│   └── providers.jsx               # SessionProvider
├── components/
│   ├── Avatar.jsx                  # User avatar with initials fallback
│   ├── CommentSection.jsx          # Comment list + form
│   ├── Navbar.jsx                  # Top navigation bar
│   ├── PostCard.jsx                # Single post with actions
│   └── PostComposer.jsx            # Create post form
├── lib/
│   ├── auth.js                     # NextAuth config
│   └── supabase.js                 # Supabase clients
├── supabase-schema.sql             # Run this in Supabase SQL Editor
└── .env.local.example              # Copy to .env.local and fill in
```

---

## Next Steps (after MVP)

- [ ] Image uploads to Supabase Storage
- [ ] Friends / follow system
- [ ] Real-time notifications (Supabase Realtime)
- [ ] Infinite scroll
- [ ] Search users
- [ ] Dark mode
