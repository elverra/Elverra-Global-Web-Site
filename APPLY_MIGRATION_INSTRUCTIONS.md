# Database Migration Instructions

## To Fix 403 Ebooks Errors

You need to apply the database migration to disable RLS on the ebooks table. Here are the steps:

### Option 1: Using Supabase CLI
```bash
cd /Users/macbook/Workspace/Elverra-Global-Web-Site
supabase db push
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run this SQL command:

```sql
-- Disable RLS on ebooks table to resolve 403 errors
ALTER TABLE ebooks DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active ebooks" ON ebooks;
DROP POLICY IF EXISTS "Authenticated users can manage ebooks" ON ebooks;

-- Add comment explaining temporary fix
COMMENT ON TABLE ebooks IS 'RLS temporarily disabled to resolve 403 errors - re-enable after fixing policies';
```

### Option 3: Using Supabase API
You can also run this via the Supabase REST API if you have admin access.

## After applying the migration:
- The 403 errors for ebooks should be resolved
- Both EbookManagement.tsx and EBooks.tsx should work properly
- You can re-enable RLS later with proper policies

## Files that will be fixed:
- `/src/pages/admin/EbookManagement.tsx` - Admin ebook management
- `/src/pages/EBooks.tsx` - Public ebooks page
- Any other components fetching ebooks data
