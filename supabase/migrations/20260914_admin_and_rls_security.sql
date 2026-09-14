-- ====================================================================
-- MEMOIREPRO / MEMOMASTERS HUB — RÈGLES RLS RENFORCÉES & ESPACE ADMIN
-- ====================================================================

-- 1. Sécurité de la table public.profiles
-- Permet aux administrateurs de lire tous les profils (nécessaire pour l'écran admin)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    auth.uid() = id 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Permet aux administrateurs de modifier les profils si nécessaire
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    auth.uid() = id 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    auth.uid() = id 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 2. Sécurité de la table public.user_roles
-- Permet aux administrateurs de lire tous les rôles utilisateurs
DROP POLICY IF EXISTS "Admins can read all user roles" ON public.user_roles;
CREATE POLICY "Admins can read all user roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Permet aux administrateurs de modifier le rôle d'un utilisateur (client <-> redacteur)
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Permet aux administrateurs d'insérer un nouveau rôle pour un utilisateur
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Permet aux administrateurs de supprimer un rôle
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
CREATE POLICY "Admins can delete user roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 3. Sécurité de la table public.orders
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view own orders" ON public.orders;
CREATE POLICY "Clients can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'redacteur'::public.app_role)
  );

DROP POLICY IF EXISTS "Clients can insert orders" ON public.orders;
CREATE POLICY "Clients can insert orders"
  ON public.orders FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins and writers can update orders" ON public.orders;
CREATE POLICY "Admins and writers can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'redacteur'::public.app_role)
  );

-- 4. Fonction utilitaire RPC pour basculer un utilisateur entre 'client' et 'redacteur' de façon atomique
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id uuid, new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérification des privilèges : l'appelant DOIT être admin
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Action non autorisée : seuls les administrateurs peuvent modifier les rôles.';
  END IF;

  -- Protection : on ne permet pas de supprimer ou dégrader un admin via cette fonction standard
  IF new_role NOT IN ('client'::public.app_role, 'redacteur'::public.app_role) THEN
    RAISE EXCEPTION 'Le rôle cible doit être client ou redacteur.';
  END IF;

  -- Mise à jour ou insertion atomique
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Supprimer l'autre rôle exclusif (client ou redacteur)
  IF new_role = 'client'::public.app_role THEN
    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'redacteur'::public.app_role;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = target_user_id AND role = 'client'::public.app_role;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;
