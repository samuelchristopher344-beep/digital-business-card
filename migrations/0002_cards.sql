-- App cards table (multi-user product model).
-- user_id is TEXT to match Better Auth's user.id.
-- Apply when DATABASE_URL is set (Neon / Postgres). Local PGLite picks it up too.

create table if not exists cards (
  id text primary key,
  user_id text not null references "user" ("id") on delete cascade,
  username text not null,
  full_name text not null default '',
  role text not null default '',
  organization text not null default '',
  tagline text not null default '',
  email text not null default '',
  phone text not null default '',
  website text not null default '',
  location text not null default '',
  github text not null default '',
  note text not null default '',
  focus text[] not null default '{}',
  theme text not null default 'brass',
  is_public boolean not null default true,
  created_at timestamptz not null default CURRENT_TIMESTAMP,
  updated_at timestamptz not null default CURRENT_TIMESTAMP,
  constraint cards_username_unique unique (username),
  constraint cards_theme_check check (theme in ('brass', 'signal', 'tide', 'ink'))
);

create index if not exists cards_user_id_idx on cards (user_id);
create index if not exists cards_username_idx on cards (username);
create index if not exists cards_public_idx on cards (is_public) where is_public = true;
