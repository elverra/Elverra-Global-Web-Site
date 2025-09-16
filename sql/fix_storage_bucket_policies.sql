-- Fix Storage bucket policies for lawyer-audio
-- The bucket needs policies to allow public uploads

-- Create policy to allow public uploads to lawyer-audio bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'lawyer-audio-upload-policy',
  'lawyer-audio',
  'Allow public uploads',
  'true',
  'true',
  'INSERT',
  '{public}'
);

-- Create policy to allow public reads from lawyer-audio bucket
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'lawyer-audio-read-policy',
  'lawyer-audio',
  'Allow public reads',
  'true',
  'true',
  'SELECT',
  '{public}'
);

-- Alternative: If the above doesn't work, try this approach
-- Allow authenticated and anonymous users to upload
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'lawyer-audio-anon-upload',
  'lawyer-audio',
  'Allow anonymous uploads',
  'true',
  'true',
  'INSERT',
  '{anon, authenticated}'
) ON CONFLICT (id) DO UPDATE SET
  definition = 'true',
  check_definition = 'true';

-- Allow public access to read files
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
  'lawyer-audio-public-read',
  'lawyer-audio',
  'Allow public read access',
  'true',
  'true',
  'SELECT',
  '{public, anon, authenticated}'
) ON CONFLICT (id) DO UPDATE SET
  definition = 'true',
  check_definition = 'true';
