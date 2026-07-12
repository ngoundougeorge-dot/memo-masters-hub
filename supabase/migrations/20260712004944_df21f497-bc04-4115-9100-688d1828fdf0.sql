DROP TRIGGER IF EXISTS orders_broadcast_change ON public.orders;

CREATE TRIGGER orders_broadcast_change
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_order_change();