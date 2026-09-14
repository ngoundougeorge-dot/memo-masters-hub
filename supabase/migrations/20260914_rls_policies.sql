-- ====================================================================
-- MEMOMASTERS HUB — RÈGLES ROW LEVEL SECURITY (RLS) SUPABASE / POSTGRESQL
-- Version : 2.0.0
-- Description : Sécurisation absolue des rôles (client, rédacteur, admin)
--               et isolation stricte des données académiques et commandes.
-- ====================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Type ENUM pour les rôles stricts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'rédacteur', 'admin');
  END IF;
END$$;

-- 2. TABLE DES PROFILS UTILISATEURS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  filiere VARCHAR(120),
  universite VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. TABLE DES MÉMOIRES ET PROJETS
CREATE TABLE IF NOT EXISTS public.memoires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redacteur_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  titre VARCHAR(255) NOT NULL,
  sujet TEXT,
  domaine VARCHAR(100),
  niveau VARCHAR(50) DEFAULT 'Master',
  statut VARCHAR(50) NOT NULL DEFAULT 'cadrage' 
    CHECK (statut IN ('cadrage', 'plan_valide', 'redaction', 'revision', 'valide', 'archive')),
  progression INT DEFAULT 0 CHECK (progression BETWEEN 0 AND 100),
  date_limite DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memoires_client ON public.memoires(client_id);
CREATE INDEX IF NOT EXISTS idx_memoires_redacteur ON public.memoires(redacteur_id);

-- 4. TABLE DES COMMANDES
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  memoire_id UUID REFERENCES public.memoires(id) ON DELETE SET NULL,
  plan VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'XAF',
  status VARCHAR(30) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);

-- ====================================================================
-- 5. FONCTIONS DE SÉCURITÉ (SECURITY DEFINER - Prévention Récursion)
-- ====================================================================

-- Fonction : Vérifie si l'utilisateur appelant est Administrateur
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Fonction : Vérifie si l'utilisateur appelant est Rédacteur
CREATE OR REPLACE FUNCTION public.is_redacteur()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'rédacteur'
  );
$$;

-- Fonction : Récupère le rôle courant de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ====================================================================
-- 6. ACTIVATION ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memoires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 7. POLITIQUES RLS POUR LA TABLE `profiles`
-- ====================================================================

-- Suppression des anciennes politiques pour réapplication propre
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_paired" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- 7.1 LECTURE (SELECT) :
-- Un utilisateur peut lire son propre profil, OU un admin peut tout lire.
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR public.is_admin()
  );

-- 7.2 LECTURE PARTENAIRES (SELECT) :
-- Un client peut voir le profil public du rédacteur qui lui est assigné, et inversement.
CREATE POLICY "profiles_select_paired" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memoires m
      WHERE (m.client_id = auth.uid() AND m.redacteur_id = public.profiles.id)
         OR (m.redacteur_id = auth.uid() AND m.client_id = public.profiles.id)
    )
  );

-- 7.3 MODIFICATION PERSONNELLE (UPDATE) :
-- Un utilisateur peut modifier ses données (nom, filière, avatar),
-- MAIS la clause WITH CHECK interdit formellement de changer son propre rôle !
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

-- 7.4 ADMINISTRATION TOTALE (ADMIN) :
-- Seul l'administrateur peut modifier le rôle d'un utilisateur (client <-> rédacteur).
CREATE POLICY "profiles_admin_update_any" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ====================================================================
-- 8. POLITIQUES RLS POUR LA TABLE `memoires`
-- ====================================================================
DROP POLICY IF EXISTS "memoires_client_select" ON public.memoires;
DROP POLICY IF EXISTS "memoires_client_insert" ON public.memoires;
DROP POLICY IF EXISTS "memoires_client_update" ON public.memoires;
DROP POLICY IF EXISTS "memoires_redacteur_select" ON public.memoires;
DROP POLICY IF EXISTS "memoires_redacteur_update" ON public.memoires;
DROP POLICY IF EXISTS "memoires_admin_all" ON public.memoires;

-- 8.1 Accès Client : Voit et modifie uniquement ses propres mémoires
CREATE POLICY "memoires_client_select" ON public.memoires
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "memoires_client_insert" ON public.memoires
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "memoires_client_update" ON public.memoires
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- 8.2 Accès Rédacteur : Voit et met à jour uniquement les mémoires qui lui sont attribués
CREATE POLICY "memoires_redacteur_select" ON public.memoires
  FOR SELECT TO authenticated
  USING (redacteur_id = auth.uid());

CREATE POLICY "memoires_redacteur_update" ON public.memoires
  FOR UPDATE TO authenticated
  USING (redacteur_id = auth.uid());

-- 8.3 Accès Administrateur : Vue et modification intégrale
CREATE POLICY "memoires_admin_all" ON public.memoires
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ====================================================================
-- 9. POLITIQUES RLS POUR LA TABLE `orders`
-- ====================================================================
DROP POLICY IF EXISTS "orders_client_select" ON public.orders;
DROP POLICY IF EXISTS "orders_client_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;

-- Client : voit ses commandes personnelles
CREATE POLICY "orders_client_select" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "orders_client_insert" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin : supervise toutes les commandes
CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ====================================================================
-- 10. TRIGGER D'INITIALISATION DU PROFIL À L'INSCRIPTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Étudiant'),
    new.email,
    'client', -- Rôle par défaut impératif : client
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
