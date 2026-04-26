create extension if not exists "uuid-ossp";

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  email text not null,
  total_amount numeric not null,
  payment_id text not null,
  status text default 'paid',
  items jsonb,
  created_at timestamp default now()
);

alter table orders disable row level security;
