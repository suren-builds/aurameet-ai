-- Supabase Schema for AuraMeet AI

-- Create meetings table
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  audio_url text,
  transcript text,
  summary text,
  action_items jsonb,
  productivity_score integer,
  sentiment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.meetings enable row level security;

create policy "Users can view their own meetings"
  on meetings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meetings"
  on meetings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meetings"
  on meetings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meetings"
  on meetings for delete
  using (auth.uid() = user_id);

-- Create storage bucket for meeting audio
insert into storage.buckets (id, name, public) values ('meeting-audio', 'meeting-audio', false);

-- Set up Storage RLS
create policy "Users can upload their own meeting audio"
  on storage.objects for insert
  with check (bucket_id = 'meeting-audio' AND auth.uid() = owner);

create policy "Users can view their own meeting audio"
  on storage.objects for select
  using (bucket_id = 'meeting-audio' AND auth.uid() = owner);

-- VECTOR DB & RAG SETUP --
create extension if not exists vector;

create table public.meeting_chunks (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references public.meetings(id) on delete cascade not null,
  content text not null,
  embedding vector(384) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on chunks
alter table public.meeting_chunks enable row level security;

create policy "Users can view their own meeting chunks"
  on meeting_chunks for select
  using (
    meeting_id in (
      select id from meetings where user_id = auth.uid()
    )
  );

create policy "Users can insert their own meeting chunks"
  on meeting_chunks for insert
  with check (
    meeting_id in (
      select id from meetings where user_id = auth.uid()
    )
  );

-- Create match function for similarity search
create or replace function match_meeting_chunks (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  p_meeting_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    meeting_chunks.id,
    meeting_chunks.content,
    1 - (meeting_chunks.embedding <=> query_embedding) as similarity
  from meeting_chunks
  where meeting_id = p_meeting_id
    and 1 - (meeting_chunks.embedding <=> query_embedding) > match_threshold
  order by meeting_chunks.embedding <=> query_embedding
  limit match_count;
$$;
