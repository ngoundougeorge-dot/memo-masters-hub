CREATE OR REPLACE FUNCTION public.broadcast_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'event_id', gen_random_uuid(),
    'id', NEW.id,
    'status', NEW.status,
    'writer_seen_at', NEW.writer_seen_at,
    'documents_submitted_at', NEW.documents_submitted_at,
    'op', TG_OP
  );
  PERFORM realtime.send(payload, 'order_change', 'writer_orders', false);
  RETURN NEW;
END;
$$;