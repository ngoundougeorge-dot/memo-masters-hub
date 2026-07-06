
DROP POLICY IF EXISTS "Anyone can submit an order" ON public.orders;

CREATE POLICY "Anyone can submit a valid order" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 2 AND 120
    AND char_length(email) BETWEEN 5 AND 200
    AND char_length(phone) BETWEEN 6 AND 40
    AND char_length(subject) BETWEEN 5 AND 2000
    AND (instructions IS NULL OR char_length(instructions) <= 5000)
    AND cardinality(file_paths) <= 20
  );
