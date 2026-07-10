-- Undo raw table publication (would expose PII to anon via realtime)
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;

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

DROP TRIGGER IF EXISTS orders_broadcast_change ON public.orders;
CREATE TRIGGER orders_broadcast_change
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.broadcast_order_change();