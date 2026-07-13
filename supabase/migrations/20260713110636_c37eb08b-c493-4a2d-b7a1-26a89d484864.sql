CREATE OR REPLACE FUNCTION public.broadcast_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.orders%ROWTYPE;
  payload jsonb;
BEGIN
  rec := COALESCE(NEW, OLD);
  payload := jsonb_build_object(
    'event_id', gen_random_uuid(),
    'id', rec.id,
    'status', rec.status,
    'writer_seen_at', rec.writer_seen_at,
    'documents_submitted_at', rec.documents_submitted_at,
    'op', TG_OP
  );
  PERFORM realtime.send(payload, 'order_change', 'writer_orders', false);
  RETURN COALESCE(NEW, OLD);
END;
$$;