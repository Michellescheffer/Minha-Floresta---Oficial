-- Fix RLS Policies for CMS
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. FIX STORAGE BUCKET POLICIES
-- ============================================

-- Allow authenticated users to upload to images bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated users to update images
CREATE POLICY IF NOT EXISTS "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Allow public read access
CREATE POLICY IF NOT EXISTS "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- ============================================
-- 2. FIX SITE_IMAGES TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated insert site_images" ON site_images;
DROP POLICY IF EXISTS "Allow authenticated update site_images" ON site_images;
DROP POLICY IF EXISTS "Allow authenticated delete site_images" ON site_images;
DROP POLICY IF EXISTS "Allow public read site_images" ON site_images;

-- Create new policies
CREATE POLICY "Allow authenticated insert site_images"
ON site_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update site_images"
ON site_images FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete site_images"
ON site_images FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Allow public read site_images"
ON site_images FOR SELECT
TO public
USING (true);

-- ============================================
-- 3. FIX CERTIFICATE_IMAGES TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated insert certificate_images" ON certificate_images;
DROP POLICY IF EXISTS "Allow authenticated update certificate_images" ON certificate_images;
DROP POLICY IF EXISTS "Allow authenticated delete certificate_images" ON certificate_images;
DROP POLICY IF EXISTS "Allow public read certificate_images" ON certificate_images;

-- Create new policies
CREATE POLICY "Allow authenticated insert certificate_images"
ON certificate_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update certificate_images"
ON certificate_images FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete certificate_images"
ON certificate_images FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Allow public read certificate_images"
ON certificate_images FOR SELECT
TO public
USING (true);

-- ============================================
-- 4. FIX PROJECTS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated manage projects" ON projects;
DROP POLICY IF EXISTS "Allow public read projects" ON projects;

-- Create new policies
CREATE POLICY "Allow authenticated manage projects"
ON projects FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public read projects"
ON projects FOR SELECT
TO public
USING (true);

-- ============================================
-- 5. FIX CERTIFICATES TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated manage certificates" ON certificates;
DROP POLICY IF EXISTS "Allow public read certificates" ON certificates;

-- Create new policies
CREATE POLICY "Allow authenticated manage certificates"
ON certificates FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public read certificates"
ON certificates FOR SELECT
TO public
USING (true);

-- ============================================
-- 6. FIX SALES TABLE POLICIES (if exists)
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated manage sales" ON sales;
DROP POLICY IF EXISTS "Allow public read sales" ON sales;

-- Create new policies
CREATE POLICY "Allow authenticated manage sales"
ON sales FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public read sales"
ON sales FOR SELECT
TO public
USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'certificates', 'sales', 'site_images', 'certificate_images');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
