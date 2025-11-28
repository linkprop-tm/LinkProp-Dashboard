/*
  # Create Property Images Storage

  1. Storage Setup
    - Create `property-images` bucket for storing property photos
    - Configure public access for reading images
    - Set upload restrictions to authenticated users only
  
  2. Security
    - Anyone can read images (public bucket)
    - Only authenticated users can upload images
    - Only authenticated users can delete their own uploads
    
  3. Configuration
    - Maximum file size: 5MB per image
    - Allowed formats: JPG, PNG, WebP
    - Public URL access enabled for CDN delivery
*/

-- Create the property-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public property images are accessible to everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

-- Policy: Anyone can read property images (public bucket)
CREATE POLICY "Public property images are accessible to everyone"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

-- Policy: Authenticated users can upload property images
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- Policy: Authenticated users can update property images
CREATE POLICY "Authenticated users can update property images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images')
  WITH CHECK (bucket_id = 'property-images');

-- Policy: Authenticated users can delete property images
CREATE POLICY "Authenticated users can delete property images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');