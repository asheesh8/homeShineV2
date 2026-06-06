-- Business expenses for HomeSHINE tax tracking
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  category    text not null,
  description text not null,
  amount      numeric(10, 2) not null,
  receipt_url text,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_date_idx on expenses (date);
create index if not exists expenses_category_idx on expenses (category);
