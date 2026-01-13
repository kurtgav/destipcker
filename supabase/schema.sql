
-- Users Table (Enhanced)
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text,
  username text unique,
  full_name text,
  avatar_url text,
  birthday date,
  location text,
  currency text default 'USD',
  is_premium boolean default false,
  daily_usage_count integer default 0,
  last_reset_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Decisions Table (Track user decisions)
create table if not exists public.decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category text not null,
  budget numeric not null,
  currency text not null,
  radius numeric not null,
  venue_count integer not null,
  venues jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_users_username on public.users(username);
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_decisions_user_id on public.decisions(user_id);
create index if not exists idx_decisions_created_at on public.decisions(created_at desc);

-- Secure the tables
alter table public.users enable row level security;
alter table public.decisions enable row level security;

-- Users table policies
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- Decisions table policies
create policy "Users can view their own decisions."
  on public.decisions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own decisions."
  on public.decisions for insert
  with check ( auth.uid() = user_id );

-- Function to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
drop trigger if exists on_users_updated on public.users;
create trigger on_users_updated
  before update on public.users
  for each row execute procedure public.handle_updated_at();
