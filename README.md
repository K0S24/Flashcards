# Flashcards

A spaced repetition flashcard app to help you learn and retain knowledge effectively.

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Backend & Auth:** Supabase (PostgreSQL)

## Features

- [x] Authentication (sign up / sign in / sign out)
- [ ] Decks (create, edit, delete)
- [ ] Cards (create, edit, delete)
- [ ] Study mode with SRS (3min / 7min / 10min / 1 day)
- [ ] Statistics & progress tracking

## SRS Intervals

| Rating  | Next review |
|---------|-------------|
| Again   | 3 minutes   |
| Hard    | 7 minutes   |
| Good    | 10 minutes  |
| Perfect | 1 day       |

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/K0S24/Flashcards.git
cd Flashcards
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root folder:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the development server
```bash
npm run dev
```

App runs at `http://localhost:5173`

## Database Setup

Run this SQL in your Supabase SQL Editor:
```sql
create table decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text default '',
  created_at timestamp with time zone default now()
);

create table cards (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid references decks on delete cascade not null,
  question text not null,
  answer text not null,
  next_review timestamp with time zone default now(),
  interval bigint default 0,
  created_at timestamp with time zone default now()
);

alter table decks enable row level security;
alter table cards enable row level security;

create policy "Users can manage their own decks"
  on decks for all
  using (auth.uid() = user_id);

create policy "Users can manage their own cards"
  on cards for all
  using (
    deck_id in (
      select id from decks where user_id = auth.uid()
    )
  );
```
