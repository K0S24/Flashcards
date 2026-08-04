# Flashcards

A spaced repetition flashcard app to help you learn and retain knowledge effectively.

## Tech Stack

- **Frontend:** React 19 + TypeScript 5.9
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 3.4
- **Backend & Auth:** Supabase (PostgreSQL)

## Features

- [x] Authentication (sign up / sign in / sign out)
- [x] Decks (create, edit, delete)
- [x] Cards (create, edit, delete, search)
- [x] Two card modes: flip card, or type the answer
- [x] Study mode with SRS (Again / Hard / Good / Perfect)
- [x] Keyboard shortcuts while studying (Space to flip, 1–4 to rate)
- [x] CSV import & export per deck
- [x] Statistics & progress tracking

## SRS Intervals

Each card stores its current interval. A rating decides the next one:

| Rating  | New card | Card with an existing interval |
|---------|----------|--------------------------------|
| Again   | 1 minute | resets to 1 minute             |
| Hard    | 10 minutes | interval × 1.2               |
| Good    | 1 hour   | interval × 2.5                 |
| Perfect | 1 day    | interval × 3.5                 |

The new interval never falls below the "new card" value of its rating. Rating
a card `Good` three times in a row therefore takes it from 1h → 2.5h → 6.25h →
15.6h — the intervals grow as the card gets easier.

Within a study session, every rating except `Perfect` also puts the card back
at the end of the queue, so difficult cards come up again before you finish.

The logic lives in [`src/lib/srs.ts`](src/lib/srs.ts).

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
  mode text not null default 'flip',
  created_at timestamp with time zone default now()
);

create table study_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  card_id uuid references cards on delete cascade not null,
  deck_id uuid references decks on delete cascade not null,
  rating text not null,
  studied_at timestamp with time zone default now()
);

alter table decks enable row level security;
alter table cards enable row level security;
alter table study_logs enable row level security;

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

create policy "Users can manage their own study logs"
  on study_logs for all
  using (auth.uid() = user_id);
```

`interval` is stored in milliseconds. `mode` is either `flip` or `type`.
Every rating during a study session is appended to `study_logs`, which is what
the progress page reads.

## Deployment

The app is a static build, deployed on Vercel. Set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in the hosting environment as well — Vite inlines them
at build time, so changing them requires a rebuild, not just a restart.
