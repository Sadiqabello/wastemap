-- Create the report-photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view photos
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'report-photos' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'report-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
