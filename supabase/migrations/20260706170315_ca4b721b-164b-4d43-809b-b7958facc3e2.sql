
CREATE POLICY "Anyone can upload order files" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'order-uploads');
