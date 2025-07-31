# Supabase Index Cleanup Guide

## Issue Description

Your Supabase database has duplicate indexes on the `kv_store_a605d6a2` table:

```
kv_store_a605d6a2_key_idx
kv_store_a605d6a2_key_idx1
kv_store_a605d6a2_key_idx2
...
kv_store_a605d6a2_key_idx12
```

These duplicate indexes are:
- **Wasting storage space** (each index stores the same data)
- **Slowing down write operations** (every INSERT/UPDATE/DELETE must update all 13 indexes)
- **Potentially causing deadlocks** during high-concurrency operations

## Root Cause

This typically happens when:
1. Multiple migrations are run repeatedly
2. Supabase's automatic index creation triggers multiple times
3. Manual index creation commands are executed multiple times
4. Edge Functions restart and recreate indexes unnecessarily

## How to Fix (Manual Method)

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Database > Database**

### Step 2: Open SQL Editor
1. Click on **SQL Editor** in the left sidebar
2. Create a new query

### Step 3: Check Current Indexes
```sql
-- View all indexes on the kv_store table
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'kv_store_a605d6a2' 
AND schemaname = 'public'
ORDER BY indexname;
```

### Step 4: Drop Duplicate Indexes
```sql
-- Keep only the first index, drop all duplicates
-- WARNING: Run these one at a time and verify each step

DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx1;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx2;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx3;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx4;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx5;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx6;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx7;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx8;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx9;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx10;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx11;
DROP INDEX IF EXISTS public.kv_store_a605d6a2_key_idx12;
```

### Step 5: Verify Cleanup
```sql
-- Confirm only one index remains
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'kv_store_a605d6a2' 
AND schemaname = 'public';
```

Expected result: You should see only:
- The primary key constraint (automatic)
- One `kv_store_a605d6a2_key_idx` index (if needed)

## Alternative: Automated Cleanup Script

If you have many duplicate indexes, you can use this automated script:

```sql
-- Generate DROP statements for all duplicate indexes
SELECT 
    'DROP INDEX IF EXISTS public.' || indexname || ';' as drop_statement
FROM pg_indexes 
WHERE tablename = 'kv_store_a605d6a2' 
AND schemaname = 'public'
AND indexname LIKE '%_key_idx%'
AND indexname != 'kv_store_a605d6a2_key_idx'  -- Keep the original
ORDER BY indexname;
```

Copy the generated DROP statements and execute them.

## Prevention Measures

### 1. Avoid Repeated Migrations
- Never run the same migration multiple times
- Use `IF NOT EXISTS` in index creation statements

### 2. Check Before Creating Indexes
```sql
-- Example of safe index creation
CREATE INDEX IF NOT EXISTS kv_store_a605d6a2_key_idx 
ON public.kv_store_a605d6a2 (key);
```

### 3. Monitor Index Health
Set up periodic checks for duplicate indexes:

```sql
-- Query to detect duplicate indexes
SELECT 
    tablename,
    COUNT(*) as index_count,
    array_agg(indexname) as index_names
FROM pg_indexes 
WHERE tablename = 'kv_store_a605d6a2'
GROUP BY tablename
HAVING COUNT(*) > 2;  -- More than primary key + one index
```

## Impact After Cleanup

After removing duplicate indexes, you should see:
- **Faster writes** (50-90% improvement on INSERT/UPDATE/DELETE operations)
- **Reduced storage usage** (up to 12x reduction in index storage)
- **Better concurrent performance** (fewer lock conflicts)
- **Improved backup/restore times**

## Testing After Cleanup

1. Test your Workflow Tracker app functionality
2. Verify all CRUD operations work correctly
3. Check that search/filter operations maintain performance
4. Monitor for any new duplicate index creation

## Need Help?

If you encounter issues during cleanup:
1. Take a database backup before making changes
2. Test on a development environment first
3. Contact Supabase support if indexes recreate automatically
4. Monitor the Supabase logs for any Edge Function errors

---

**⚠️ Important**: Always backup your database before making structural changes like dropping indexes!