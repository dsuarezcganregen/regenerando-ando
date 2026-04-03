-- ============================================================
-- REGENERANDO ANDO — Base de datos completa (v2 con admin)
-- Para ejecutar en Supabase SQL Editor
-- regenerandoando.com
-- ============================================================

-- ============================================================
-- TIPOS ENUMERADOS
-- ============================================================

CREATE TYPE ecosystem_type AS ENUM (
  'bosque_tropical_humedo',
  'bosque_tropical_seco',
  'bosque_templado',
  'bosque_mesofilo',
  'pastizal',
  'sabana',
  'matorral_xerofilo',
  'semidesierto',
  'desierto',
  'paramo',
  'sistema_agroforestal',
  'humedal',
  'otro'
);

CREATE TYPE system_type AS ENUM (
  'prv',
  'manejo_holistico',
  'puad',
  'silvopastoril',
  'stre',
  'pastoreo_racional',
  'otro'
);

CREATE TYPE business_type AS ENUM (
  'cria',
  'desarrollo',
  'engorda',
  'cria_desarrollo_engorda',
  'doble_proposito',
  'lecheria_especializada',
  'otro'
);

CREATE TYPE species_enum AS ENUM (
  'bovino',
  'bufalino',
  'ovino',
  'caprino',
  'equino',
  'porcino',
  'gallinas',
  'pollos',
  'abejas',
  'otro'
);

CREATE TYPE product_enum AS ENUM (
  'becerros_destete',
  'novillos_engorda',
  'carne_empacada',
  'leche',
  'queso',
  'yogurt',
  'huevo',
  'miel',
  'lana',
  'composta',
  'pie_de_cria',
  'semen_embriones',
  'otro'
);

CREATE TYPE frequency_enum AS ENUM (
  'diario',
  'semanal',
  'quincenal',
  'mensual',
  'trimestral',
  'semestral',
  'anual'
);

CREATE TYPE profile_status AS ENUM (
  'pendiente',
  'aprobado',
  'rechazado'
);

CREATE TYPE rating_3 AS ENUM ('mejor', 'igual', 'peor');
CREATE TYPE rating_change AS ENUM ('mejorado', 'sin_cambios', 'empeorado');
CREATE TYPE biodiversity_rating AS ENUM ('mejora_notable', 'alguna_mejora', 'sin_cambios', 'empeoro');
CREATE TYPE work_dynamics AS ENUM ('simplificado', 'igual', 'complicado');
CREATE TYPE workforce_change AS ENUM ('aumento', 'igual', 'redujo');

-- ============================================================
-- TABLA DE ADMINISTRADORES
-- ============================================================

CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- TABLA PRINCIPAL: PERFILES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  ranch_name TEXT,
  slug TEXT UNIQUE,
  description TEXT CHECK (char_length(description) <= 500),
  logo_url TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  phone_country_code TEXT DEFAULT '+52',
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  youtube TEXT,
  tiktok TEXT,
  offers_courses BOOLEAN DEFAULT FALSE,
  courses_description TEXT,
  consent_publish BOOLEAN DEFAULT TRUE,
  status profile_status DEFAULT 'pendiente',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UBICACIÓN + ECOSISTEMA
-- ============================================================

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  state_province TEXT NOT NULL,
  municipality TEXT,
  locality TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  ecosystem ecosystem_type,
  ecosystem_other TEXT,
  altitude_masl INTEGER,
  annual_precipitation_mm INTEGER,
  rain_distribution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_country ON locations(country);
CREATE INDEX idx_locations_coords ON locations(latitude, longitude);
CREATE INDEX idx_locations_ecosystem ON locations(ecosystem);

-- ============================================================
-- OPERACIÓN DEL RANCHO
-- ============================================================

CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_hectares NUMERIC(10,2),
  regenerative_hectares NUMERIC(10,2),
  years_ranching INTEGER,
  years_regenerative INTEGER,
  year_started_regen INTEGER,
  head_count INTEGER,
  primary_system system_type,
  system_other_name TEXT,
  business_type business_type,
  business_type_other TEXT,
  previous_business_model TEXT,
  advisor_name TEXT,
  association_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operations_hectares ON operations(total_hectares);
CREATE INDEX idx_operations_system ON operations(primary_system);

-- ============================================================
-- ESPECIES
-- ============================================================

CREATE TABLE ranch_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  species species_enum NOT NULL,
  species_other TEXT,
  breeds TEXT,
  UNIQUE(profile_id, species)
);

CREATE INDEX idx_species_profile ON ranch_species(profile_id);
CREATE INDEX idx_species_type ON ranch_species(species);

-- ============================================================
-- PRODUCTOS
-- ============================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_type product_enum NOT NULL,
  product_other TEXT,
  frequency frequency_enum,
  description TEXT,
  UNIQUE(profile_id, product_type)
);

CREATE INDEX idx_products_profile ON products(profile_id);
CREATE INDEX idx_products_type ON products(product_type);

-- ============================================================
-- PRÁCTICAS Y MANEJO
-- ============================================================

CREATE TABLE management_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pastoreo_no_selectivo BOOLEAN DEFAULT FALSE,
  puad BOOLEAN DEFAULT FALSE,
  seleccion_genetica BOOLEAN DEFAULT FALSE,
  programacion_partos BOOLEAN DEFAULT FALSE,
  pastoreo_multiespecie BOOLEAN DEFAULT FALSE,
  silvopastoril BOOLEAN DEFAULT FALSE,
  suplementacion_ruminal BOOLEAN DEFAULT FALSE,
  otras_practicas_implementadas TEXT,
  mecanizacion_suelo BOOLEAN DEFAULT FALSE,
  agrotoxicos BOOLEAN DEFAULT FALSE,
  ivermectina BOOLEAN DEFAULT FALSE,
  uso_fuego BOOLEAN DEFAULT FALSE,
  monocultivo BOOLEAN DEFAULT FALSE,
  tala_desmonte BOOLEAN DEFAULT FALSE,
  otras_practicas_eliminadas TEXT,
  avg_occupation_days NUMERIC(5,1),
  grazing_density_ua_ha NUMERIC(6,2),
  paddock_changes_max INTEGER,
  paddock_changes_regular INTEGER,
  has_water_system BOOLEAN DEFAULT FALSE,
  water_source TEXT,
  uses_irrigation BOOLEAN DEFAULT FALSE,
  does_agriculture BOOLEAN DEFAULT FALSE,
  crops TEXT,
  crop_use TEXT,
  keyline_design BOOLEAN DEFAULT FALSE,
  contour_lines BOOLEAN DEFAULT FALSE,
  yeomans_subsoil BOOLEAN DEFAULT FALSE,
  reservoirs BOOLEAN DEFAULT FALSE,
  infiltration_trenches BOOLEAN DEFAULT FALSE,
  canales_camino BOOLEAN DEFAULT FALSE,
  other_water_harvest TEXT,
  direct_plant_diversity_practices BOOLEAN DEFAULT FALSE,
  plant_diversity_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practices_profile ON management_practices(profile_id);

-- ============================================================
-- RESULTADOS AMBIENTALES
-- ============================================================

CREATE TABLE results_environmental (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year_reported INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  carrying_capacity_before NUMERIC(6,2),
  carrying_capacity_after NUMERIC(6,2),
  has_soil_analysis BOOLEAN DEFAULT FALSE,
  organic_matter_improved BOOLEAN,
  organic_matter_change_pct NUMERIC(5,2),
  erosion_reduced BOOLEAN,
  soil_coverage rating_change,
  soil_general_improvement BOOLEAN,
  forage_diversity rating_change,
  wildlife_increase BOOLEAN,
  wildlife_indicator_species TEXT,
  biodiversity_overall biodiversity_rating,
  agrochemical_reduction_pct NUMERIC(5,2),
  other_inputs_reduced BOOLEAN,
  other_inputs_reduction_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, year_reported)
);

CREATE INDEX idx_results_env_profile ON results_environmental(profile_id);

-- ============================================================
-- RESULTADOS ECONÓMICOS Y SOCIALES
-- ============================================================

CREATE TABLE results_economic (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year_reported INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  production_change rating_change,
  production_change_pct NUMERIC(5,1),
  reproduction_improved TEXT,
  parasite_situation rating_3,
  genetic_changes_impact TEXT,
  workforce_change workforce_change,
  workforce_change_reason TEXT,
  work_dynamics work_dynamics,
  work_load rating_change,
  financial_position_improved BOOLEAN,
  profitability rating_3,
  profitability_reason TEXT,
  would_eliminate_regen BOOLEAN DEFAULT FALSE,
  why_would_or_not TEXT,
  before_after_narrative TEXT,
  would_recommend BOOLEAN DEFAULT TRUE,
  additional_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, year_reported)
);

CREATE INDEX idx_results_econ_profile ON results_economic(profile_id);

-- ============================================================
-- FOTOS / GALERÍA
-- ============================================================

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_profile ON photos(profile_id);

-- ============================================================
-- CATÁLOGO DE PAÍSES
-- ============================================================

CREATE TABLE countries (
  code TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT
);

INSERT INTO countries (code, name_es, name_en) VALUES
  ('MX', 'México', 'Mexico'),
  ('CO', 'Colombia', 'Colombia'),
  ('AR', 'Argentina', 'Argentina'),
  ('EC', 'Ecuador', 'Ecuador'),
  ('CR', 'Costa Rica', 'Costa Rica'),
  ('UY', 'Uruguay', 'Uruguay'),
  ('ES', 'España', 'Spain'),
  ('BO', 'Bolivia', 'Bolivia'),
  ('GT', 'Guatemala', 'Guatemala'),
  ('VE', 'Venezuela', 'Venezuela'),
  ('PY', 'Paraguay', 'Paraguay'),
  ('CL', 'Chile', 'Chile'),
  ('PA', 'Panamá', 'Panama'),
  ('HN', 'Honduras', 'Honduras'),
  ('PE', 'Perú', 'Peru'),
  ('NI', 'Nicaragua', 'Nicaragua'),
  ('SV', 'El Salvador', 'El Salvador'),
  ('PT', 'Portugal', 'Portugal'),
  ('BR', 'Brasil', 'Brazil'),
  ('US', 'Estados Unidos', 'United States'),
  ('ZA', 'Sudáfrica', 'South Africa'),
  ('DO', 'República Dominicana', 'Dominican Republic'),
  ('CU', 'Cuba', 'Cuba'),
  ('AU', 'Australia', 'Australia'),
  ('NZ', 'Nueva Zelanda', 'New Zealand'),
  ('KE', 'Kenia', 'Kenya'),
  ('FR', 'Francia', 'France');

-- ============================================================
-- VISTAS (solo perfiles APROBADOS son públicos)
-- ============================================================

CREATE VIEW dashboard_stats AS
SELECT
  l.country,
  COUNT(DISTINCT p.id) AS total_ranchers,
  COALESCE(SUM(o.total_hectares), 0) AS total_hectares,
  COALESCE(SUM(o.regenerative_hectares), 0) AS regen_hectares,
  COALESCE(SUM(o.head_count), 0) AS total_head_count,
  COUNT(DISTINCT rs.species) AS species_count,
  COALESCE(AVG(o.years_regenerative), 0) AS avg_years_regen,
  COUNT(DISTINCT CASE WHEN p.offers_courses THEN p.id END) AS ranchers_with_courses
FROM profiles p
LEFT JOIN locations l ON l.profile_id = p.id
LEFT JOIN operations o ON o.profile_id = p.id
LEFT JOIN ranch_species rs ON rs.profile_id = p.id
WHERE p.consent_publish = TRUE AND p.status = 'aprobado'
GROUP BY l.country;

CREATE VIEW map_markers AS
SELECT
  p.id, p.ranch_name, p.slug, p.description, p.logo_url, p.offers_courses,
  l.country, l.state_province, l.latitude, l.longitude, l.ecosystem,
  o.total_hectares, o.regenerative_hectares, o.head_count, o.primary_system, o.business_type
FROM profiles p
JOIN locations l ON l.profile_id = p.id
JOIN operations o ON o.profile_id = p.id
WHERE p.consent_publish = TRUE AND p.status = 'aprobado'
  AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL;

CREATE VIEW results_summary AS
SELECT
  COUNT(*) AS total_with_results,
  ROUND(AVG(re.carrying_capacity_before)::numeric, 2) AS avg_capacity_before,
  ROUND(AVG(re.carrying_capacity_after)::numeric, 2) AS avg_capacity_after,
  ROUND(((AVG(re.carrying_capacity_after) - AVG(re.carrying_capacity_before))
    / NULLIF(AVG(re.carrying_capacity_before), 0)) * 100, 1) AS capacity_increase_pct,
  COUNT(*) FILTER (WHERE re.soil_coverage = 'mejorado') AS soil_improved_count,
  COUNT(*) FILTER (WHERE re.erosion_reduced = TRUE) AS erosion_reduced_count,
  COUNT(*) FILTER (WHERE re.wildlife_increase = TRUE) AS wildlife_increase_count,
  ROUND(AVG(re.agrochemical_reduction_pct) * 100, 1) AS avg_agrochem_reduction_pct,
  COUNT(*) FILTER (WHERE rec.financial_position_improved = TRUE) AS financial_improved_count,
  COUNT(*) FILTER (WHERE rec.profitability = 'mejor') AS profitability_better_count,
  COUNT(*) FILTER (WHERE rec.work_dynamics = 'simplificado') AS work_simplified_count,
  COUNT(*) FILTER (WHERE rec.would_eliminate_regen = FALSE) AS would_not_eliminate_count
FROM results_environmental re
JOIN results_economic rec ON rec.profile_id = re.profile_id AND rec.year_reported = re.year_reported
JOIN profiles p ON p.id = re.profile_id
WHERE p.status = 'aprobado';

-- Vista de admin: todos los perfiles con su status
CREATE VIEW admin_pending_reviews AS
SELECT
  p.id, p.full_name, p.ranch_name, p.email, p.phone, p.description,
  p.status, p.rejection_reason, p.created_at, p.reviewed_at,
  l.country, l.state_province, l.municipality, l.latitude, l.longitude, l.ecosystem,
  o.total_hectares, o.years_regenerative, o.primary_system, o.head_count, o.business_type
FROM profiles p
LEFT JOIN locations l ON l.profile_id = p.id
LEFT JOIN operations o ON o.profile_id = p.id
ORDER BY
  CASE p.status WHEN 'pendiente' THEN 1 WHEN 'rechazado' THEN 2 WHEN 'aprobado' THEN 3 END,
  p.created_at DESC;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranch_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE management_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE results_environmental ENABLE ROW LEVEL SECURITY;
ALTER TABLE results_economic ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Función: ¿es admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMINS
CREATE POLICY "Admin read" ON admins FOR SELECT USING (is_admin());

-- PROFILES
CREATE POLICY "Public read approved" ON profiles FOR SELECT
  USING ((consent_publish = TRUE AND status = 'aprobado') OR id = auth.uid() OR is_admin());

CREATE POLICY "Owner insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Owner update" ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- LOCATIONS
CREATE POLICY "Public read" ON locations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = locations.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON locations FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON locations FOR UPDATE USING (profile_id = auth.uid() OR is_admin());
CREATE POLICY "Owner delete" ON locations FOR DELETE USING (profile_id = auth.uid());

-- OPERATIONS
CREATE POLICY "Public read" ON operations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = operations.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON operations FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON operations FOR UPDATE USING (profile_id = auth.uid() OR is_admin());
CREATE POLICY "Owner delete" ON operations FOR DELETE USING (profile_id = auth.uid());

-- RANCH_SPECIES
CREATE POLICY "Public read" ON ranch_species FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = ranch_species.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON ranch_species FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON ranch_species FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON ranch_species FOR DELETE USING (profile_id = auth.uid());

-- PRODUCTS
CREATE POLICY "Public read" ON products FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = products.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON products FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON products FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON products FOR DELETE USING (profile_id = auth.uid());

-- MANAGEMENT_PRACTICES
CREATE POLICY "Public read" ON management_practices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = management_practices.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON management_practices FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON management_practices FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON management_practices FOR DELETE USING (profile_id = auth.uid());

-- RESULTS_ENVIRONMENTAL
CREATE POLICY "Public read" ON results_environmental FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = results_environmental.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON results_environmental FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON results_environmental FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON results_environmental FOR DELETE USING (profile_id = auth.uid());

-- RESULTS_ECONOMIC
CREATE POLICY "Public read" ON results_economic FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = results_economic.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON results_economic FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON results_economic FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON results_economic FOR DELETE USING (profile_id = auth.uid());

-- PHOTOS
CREATE POLICY "Public read" ON photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = photos.profile_id
    AND ((consent_publish = TRUE AND status = 'aprobado') OR profiles.id = auth.uid() OR is_admin())
  ));
CREATE POLICY "Owner write" ON photos FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Owner update" ON photos FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Owner delete" ON photos FOR DELETE USING (profile_id = auth.uid());

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER operations_updated_at BEFORE UPDATE ON operations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER practices_updated_at BEFORE UPDATE ON management_practices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL AND NEW.ranch_name IS NOT NULL THEN
    NEW.slug = LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRANSLATE(NEW.ranch_name, 'áéíóúñÁÉÍÓÚÑ', 'aeiounAEIOUN'),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_generate_slug BEFORE INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION generate_slug();

-- Función para aprobar/rechazar (solo admins)
CREATE OR REPLACE FUNCTION admin_review_profile(
  target_profile_id UUID,
  new_status profile_status,
  reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No tienes permisos de administrador';
  END IF;
  UPDATE profiles
  SET status = new_status, rejection_reason = reason,
      reviewed_by = auth.uid(), reviewed_at = NOW()
  WHERE id = target_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
