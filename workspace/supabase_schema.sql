-- Create leads table
create table if not exists public.leads (
    id uuid default gen_random_uuid() primary key,
    business_name text not null,
    industry text,
    website text,
    contact_name text,
    contact_email text,
    contact_phone text,
    source text,
    status text default 'new',
    score integer,
    notes text,
    scraped_issues text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create deals table
create table if not exists public.deals (
    id uuid default gen_random_uuid() primary key,
    lead_id uuid references public.leads(id) on delete cascade,
    service text,
    price_usd numeric,
    status text default 'proposal',
    payment_method text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    delivered_at timestamp with time zone,
    paid_at timestamp with time zone,
    live_url text,
    notes text
);

-- Enable Row Level Security (RLS)
alter table public.leads enable row level security;
alter table public.deals enable row level security;

-- Create policies for public access (since we are using the public anon key for automated scripts)
create policy "Allow public read/write access to leads" on public.leads
    for all using (true) with check (true);

create policy "Allow public read/write access to deals" on public.deals
    for all using (true) with check (true);
