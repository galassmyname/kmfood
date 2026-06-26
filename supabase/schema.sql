-- ============================================
-- KM FOOD - Schéma PostgreSQL (Supabase)
-- ============================================

-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: restaurants
-- ============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  adresse TEXT,
  specialite VARCHAR(100),
  contact VARCHAR(50),
  horaires TEXT,
  actif BOOLEAN DEFAULT true,
  fiabilite INTEGER DEFAULT 3 CHECK (fiabilite BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: plats
-- ============================================
CREATE TABLE plats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  nom VARCHAR(150) NOT NULL,
  description TEXT,
  prix INTEGER NOT NULL, -- en FCFA
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: livreurs
-- ============================================
CREATE TABLE livreurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  moto VARCHAR(100),
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: commandes
-- ============================================
CREATE TYPE statut_commande AS ENUM (
  'nouveau',
  'confirme',
  'en_preparation',
  'en_livraison',
  'livre',
  'annule'
);

CREATE TYPE mode_paiement AS ENUM (
  'wave',
  'orange_money',
  'cash'
);

CREATE TYPE statut_paiement AS ENUM (
  'en_attente',
  'recu',
  'echoue'
);

CREATE TABLE commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(20) UNIQUE NOT NULL, -- ex: KMF-20260401-001
  
  -- Client
  client_nom VARCHAR(100),
  client_telephone VARCHAR(20),
  client_adresse TEXT,
  client_geoloc TEXT, -- lien Google Maps ou coordonnées
  
  -- Commande
  restaurant_id UUID REFERENCES restaurants(id),
  plat_id UUID REFERENCES plats(id),
  plat_nom VARCHAR(150) NOT NULL, -- dénormalisé pour l'historique
  plat_prix INTEGER NOT NULL,
  details_plat TEXT, -- ex: "avec piment, sans oignon, ketchup en plus"
  
  -- Livraison
  livreur_id UUID REFERENCES livreurs(id),
  frais_livraison INTEGER DEFAULT 1000, -- 1000 FCFA
  
  -- Statut
  statut statut_commande DEFAULT 'nouveau',
  
  -- Paiement
  mode_paiement mode_paiement DEFAULT 'cash',
  statut_paiement statut_paiement DEFAULT 'en_attente',
  
  -- Montant total
  montant_total INTEGER GENERATED ALWAYS AS (plat_prix + frais_livraison) STORED,
  
  -- Notes internes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  livre_at TIMESTAMPTZ
);

-- ============================================
-- INDEX pour les performances
-- ============================================
CREATE INDEX idx_commandes_statut ON commandes(statut);
CREATE INDEX idx_commandes_created_at ON commandes(created_at DESC);
CREATE INDEX idx_commandes_livreur ON commandes(livreur_id);
CREATE INDEX idx_commandes_restaurant ON commandes(restaurant_id);
CREATE INDEX idx_plats_restaurant ON plats(restaurant_id);

-- ============================================
-- FONCTION: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_livreurs_updated_at
  BEFORE UPDATE ON livreurs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_commandes_updated_at
  BEFORE UPDATE ON commandes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FONCTION: générer numéro de commande
-- ============================================
CREATE OR REPLACE FUNCTION generate_numero_commande()
RETURNS TRIGGER AS $$
DECLARE
  date_str VARCHAR(8);
  count_today INTEGER;
BEGIN
  date_str := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO count_today
  FROM commandes
  WHERE DATE(created_at) = CURRENT_DATE;
  NEW.numero := 'KMF-' || date_str || '-' || LPAD(count_today::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_commandes_numero
  BEFORE INSERT ON commandes
  FOR EACH ROW EXECUTE FUNCTION generate_numero_commande();

-- ============================================
-- DONNÉES INITIALES
-- ============================================
INSERT INTO restaurants (nom, specialite, contact, actif) VALUES
  ('Claire de Lune', 'Tout type', '33 845 78 13 / 77 134 54 78 / 76 632 26 27', true),
  ('Rajab', 'Tout type', '70 324 31 31 / 77 694 76 78', true);

-- Activer Realtime pour les commandes (depuis Supabase Dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE commandes;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Activer RLS sur les tables sensibles
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE livreurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plats ENABLE ROW LEVEL SECURITY;

-- Politique: accès complet pour les utilisateurs authentifiés (admins KM FOOD)
CREATE POLICY "admins_all" ON commandes FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admins_all" ON livreurs FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admins_all" ON restaurants FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admins_all" ON plats FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Lecture publique des restaurants et plats (pour le site vitrine)
CREATE POLICY "public_read_restaurants" ON restaurants FOR SELECT
  TO anon USING (actif = true);

CREATE POLICY "public_read_plats" ON plats FOR SELECT
  TO anon USING (disponible = true);
