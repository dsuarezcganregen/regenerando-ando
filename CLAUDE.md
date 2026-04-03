# CLAUDE.md — Regenerando Ando

## Qué es este proyecto

Regenerando Ando es el directorio mundial de ganaderos regenerativos. Una web app donde ganaderos registran su rancho, publican un perfil público (mini landing page), y los visitantes pueden buscar, filtrar y contactar ganaderos, ver un mapa interactivo y consultar un dashboard de estadísticas en tiempo real.

**URL de producción:** regenerandoando.com
**Creador:** Daniel Suárez — GanaderiaRegenerativa.com

## Stack tecnológico

- **Frontend:** Next.js 14+ (App Router) con TypeScript y Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Mapa:** Leaflet + OpenStreetMap (react-leaflet)
- **Hosting:** Vercel
- **DNS:** Cloudflare
- **Geocoding:** Nominatim (OpenStreetMap) — gratuito

## Estructura de la app

```
regenerando-ando/
├── app/
│   ├── page.tsx                    # Homepage: hero, stats, mapa preview, ranchos destacados, resultados
│   ├── layout.tsx                  # Layout global con navbar y footer
│   ├── directorio/
│   │   └── page.tsx                # Directorio con búsqueda, filtros y grid de cards
│   ├── mapa/
│   │   └── page.tsx                # Mapa interactivo fullscreen con filtros
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard público de estadísticas
│   ├── rancho/
│   │   └── [slug]/
│   │       └── page.tsx            # Perfil público de cada ganadero (SSR para SEO)
│   ├── auth/
│   │   ├── login/page.tsx          # Login
│   │   ├── registro/page.tsx       # Registro de nuevo ganadero
│   │   └── callback/route.ts       # Callback de Supabase Auth
│   ├── mi-perfil/
│   │   ├── page.tsx                # Dashboard privado del ganadero
│   │   ├── editar/page.tsx         # Formulario de edición de perfil
│   │   └── resultados/page.tsx     # Formulario de resultados
│   └── admin/
│       ├── page.tsx                # Panel de administración principal
│       ├── pendientes/page.tsx     # Lista de perfiles pendientes de aprobación
│       └── revisar/[id]/page.tsx   # Vista detallada para aprobar/rechazar un perfil
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MapView.tsx                 # Componente de mapa con Leaflet
│   ├── RanchoCard.tsx              # Card para el directorio
│   ├── StatsCounter.tsx            # Contadores animados
│   ├── FilterBar.tsx               # Barra de filtros
│   ├── ResultsGrid.tsx             # Grid de resultados globales
│   └── AdminReviewCard.tsx         # Card para revisión de admin
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Cliente de Supabase (browser)
│   │   ├── server.ts               # Cliente de Supabase (server)
│   │   └── types.ts                # Tipos TypeScript generados
│   └── utils.ts
├── public/
│   └── logo.svg
└── supabase/
    └── schema.sql                  # Esquema completo de la base de datos
```

## Sistema de aprobación de ganaderos

### Flujo de registro
1. El ganadero se registra y llena su perfil
2. Su perfil queda con status = 'pendiente' (NO es visible públicamente)
3. El admin (Daniel) recibe notificación / ve el perfil en el panel de admin
4. El admin revisa la información y decide:
   - **Aprobar** → status = 'aprobado', el perfil se hace público
   - **Rechazar** → status = 'rechazado' + motivo, el ganadero puede corregir y reenviar
5. Solo los perfiles con status = 'aprobado' aparecen en el directorio, mapa y dashboard

### Tabla admins
La tabla `admins` contiene los user_id de los usuarios con permisos de administrador. La función `is_admin()` verifica si el usuario actual está en esa tabla. Después de que Daniel cree su cuenta en la app, su user_id se inserta manualmente en la tabla admins desde Supabase.

### Panel de administración (/admin)
- **Acceso:** solo usuarios en la tabla `admins`. Si no es admin, redirigir a /
- **Página principal:** resumen de cuántos perfiles hay pendientes, aprobados, rechazados
- **Lista de pendientes:** cards con los datos del ganadero (nombre, rancho, país, hectáreas, sistema, descripción). Cada card tiene botones "Aprobar" y "Rechazar"
- **Vista de revisión:** página completa con todos los datos del perfil para revisar antes de decidir
- **Al rechazar:** se abre un campo para escribir el motivo. Este motivo le aparece al ganadero en su panel /mi-perfil
- **Al aprobar:** el perfil se hace visible inmediatamente en el directorio, mapa y dashboard

### Lo que ve el ganadero
- Si status = 'pendiente': mensaje "Tu perfil está en revisión. Te avisaremos cuando sea aprobado."
- Si status = 'rechazado': mensaje con el motivo + botón para editar y reenviar
- Si status = 'aprobado': ve su perfil público y puede editarlo

## Base de datos (Supabase PostgreSQL)

### Tablas principales

1. **admins** — Administradores del sistema
   - user_id (referencia a auth.users), name

2. **profiles** — Perfil del ganadero (id vinculado a auth.users)
   - full_name, ranch_name, slug (URL amigable), description (max 500 chars)
   - email, phone, phone_country_code, website
   - instagram, facebook, youtube, tiktok
   - offers_courses, courses_description
   - consent_publish, logo_url
   - **status** (ENUM: pendiente, aprobado, rechazado)
   - **rejection_reason** (TEXT — motivo de rechazo)
   - **reviewed_by** (UUID — admin que revisó)
   - **reviewed_at** (TIMESTAMP — cuándo fue revisado)

3. **locations** — Ubicación + datos ecosistémicos (1:1 con profiles)
   - country (código ISO: MX, CO, AR, etc.), state_province, municipality, locality
   - latitude, longitude (DOUBLE PRECISION)
   - ecosystem (ENUM: bosque_tropical_humedo, bosque_tropical_seco, pastizal, sabana, etc.)
   - altitude_masl, annual_precipitation_mm, rain_distribution

4. **operations** — Datos de la operación (1:1 con profiles)
   - total_hectares, regenerative_hectares (NUMERIC)
   - years_ranching, years_regenerative, year_started_regen (INTEGER)
   - head_count (INTEGER)
   - primary_system (ENUM: prv, manejo_holistico, puad, silvopastoril, stre, otro)
   - business_type (ENUM: cria, desarrollo, engorda, doble_proposito, etc.)

5. **ranch_species** — Especies (muchos por perfil)
   - species (ENUM: bovino, bufalino, ovino, caprino, equino, porcino, gallinas, pollos, abejas, otro)
   - breeds (TEXT)

6. **products** — Productos que vende (muchos por perfil)
   - product_type (ENUM: becerros_destete, novillos_engorda, carne_empacada, leche, queso, etc.)
   - frequency (ENUM: diario, semanal, mensual, trimestral, semestral, anual)

7. **management_practices** — Prácticas de manejo (1:1 con profiles)
   - Prácticas implementadas: pastoreo_no_selectivo, puad, seleccion_genetica, programacion_partos, pastoreo_multiespecie, silvopastoril (BOOLEAN cada una)
   - Prácticas eliminadas: mecanizacion_suelo, agrotoxicos, ivermectina, uso_fuego, monocultivo, tala_desmonte (BOOLEAN cada una)
   - Pastoreo: avg_occupation_days, grazing_density_ua_ha, paddock_changes_max, paddock_changes_regular
   - Agua: has_water_system, water_source, uses_irrigation
   - Cosecha de agua: keyline_design, contour_lines, yeomans_subsoil, reservoirs, infiltration_trenches

8. **results_environmental** — Resultados ambientales (por año)
   - carrying_capacity_before, carrying_capacity_after (UA/ha)
   - has_soil_analysis, organic_matter_improved, erosion_reduced
   - soil_coverage (ENUM: mejorado, sin_cambios, empeorado)
   - forage_diversity, biodiversity_overall, wildlife_increase, wildlife_indicator_species
   - agrochemical_reduction_pct

9. **results_economic** — Resultados económicos (por año)
   - production_change, profitability (ENUMs)
   - financial_position_improved, parasite_situation, work_dynamics
   - before_after_narrative (TEXT — testimonial del ganadero)
   - would_eliminate_regen, would_recommend

10. **photos** — Galería de fotos
    - storage_path, url, caption, is_primary

### Vistas (Views)

- **dashboard_stats** — Estadísticas por país (SOLO perfiles aprobados)
- **map_markers** — Datos para el mapa (SOLO perfiles aprobados con coordenadas)
- **results_summary** — Resultados globales agregados (SOLO de perfiles aprobados)
- **admin_pending_reviews** — Todos los perfiles con su status, ordenados pendientes primero (SOLO visible para admins)

### Seguridad (RLS)

- Lectura pública: SOLO perfiles con consent_publish = TRUE **Y** status = 'aprobado'
- El dueño siempre puede ver y editar su propio perfil (aunque esté pendiente o rechazado)
- Los admins pueden ver todos los perfiles sin importar su status
- Solo admins pueden cambiar el status de un perfil (función admin_review_profile)
- Las fotos se almacenan en Supabase Storage con políticas similares

### Función de aprobación
```sql
-- Llamar desde el frontend del admin
SELECT admin_review_profile(
  'uuid-del-perfil',
  'aprobado',     -- o 'rechazado'
  NULL            -- o 'Motivo de rechazo'
);
```

## Diseño visual

### Identidad
- **Nombre:** regenerandoando (todo junto, minúsculas, "ando" en color secundario)
- **Color primario:** Verde Teal #0F6E56 (transmite regeneración, naturaleza)
- **Color secundario:** #1D9E75 (verde más claro para acentos)
- **Fondo de hero:** #E1F5EE (verde muy claro)
- **Tipografía:** Inter o la que venga con Tailwind por defecto
- **Estilo:** Limpio, profesional, moderno. Sin exceso de decoración.

### Páginas clave

**Homepage (/):**
- Navbar: logo a la izquierda, links (Directorio, Mapa, Dashboard, Registrarme) a la derecha
- Hero con título "El directorio mundial de ganaderos regenerativos", subtítulo, y 2 botones
- Barra de estadísticas: 4 contadores (Ganaderos, Países, Hectáreas, Especies)
- Mapa preview con puntos de los ranchos
- Sección "Ranchos destacados" con grid de cards
- Sección "Resultados globales" con 6 metric cards
- Footer

**Directorio (/directorio):**
- Barra de filtros: País, Especie, Sistema, Tipo de ganadería, "Ofrece cursos"
- Buscador por nombre de rancho
- Grid de RanchoCards
- Paginación

**Mapa (/mapa):**
- Mapa fullscreen con Leaflet + OpenStreetMap
- Markers con popup mostrando info básica
- Filtros laterales

**Dashboard (/dashboard):**
- Metric cards grandes con totales globales
- Gráfica de barras: ganaderos por país
- Grid de resultados globales

**Perfil de rancho (/rancho/[slug]):**
- Header con avatar/logo, nombre, ubicación, ecosistema, tags
- Descripción y métricas
- Mini mapa con ubicación
- Producción y contacto
- Resultados (si tiene)
- Galería de fotos

**Panel de admin (/admin):**
- Protegido: solo accesible si is_admin() = true
- Resumen: X pendientes, Y aprobados, Z rechazados
- Tabla/lista de perfiles pendientes con datos clave
- Click en un perfil abre vista completa para revisar
- Botones de aprobar (verde) y rechazar (rojo con campo de motivo)
- Después de aprobar/rechazar, volver a la lista

**Mi perfil (/mi-perfil):**
- Si pendiente: banner amarillo "En revisión"
- Si rechazado: banner rojo con motivo + botón editar
- Si aprobado: vista normal con link a su perfil público

## Datos existentes

Tenemos 822 ganaderos ya migrados en CSVs listos para importar:
- migration_profiles.csv (822 registros)
- migration_locations.csv (822 registros)
- migration_operations.csv (822 registros)
- migration_results_environmental.csv (152 registros)
- migration_results_economic.csv (152 registros)

NOTA: Los datos migrados deben importarse con status = 'aprobado' ya que son ganaderos previamente validados por Daniel.

Los UUIDs son consistentes (generados con uuid5 desde el email), así que las relaciones entre tablas ya están correctas.

## Datos actuales del proyecto

- **822 ganaderos** de 27 países
- **369,038 hectáreas** documentadas
- **152 con resultados** detallados
- Top países: México (318), Colombia (221), Argentina (54)
- Sistemas principales: PRV (437), Manejo Holístico (107), PUAD (73)
- 792 ganaderos dieron consentimiento de publicación

## Comandos útiles

```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Deploy a Vercel
vercel --prod

# Generar tipos de Supabase
npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/types.ts
```

## Notas importantes

- Todo el contenido de la interfaz debe estar en ESPAÑOL
- La app debe ser responsive (mobile-first), muchos ganaderos acceden desde el celular
- Los perfiles deben ser indexables por Google (SSR con Next.js)
- El mapa usa Leaflet, NO Google Maps (para evitar costos)
- Las coordenadas GPS se obtienen con la API del navegador (navigator.geolocation)
- El slug se genera automáticamente del nombre del rancho (trigger en PostgreSQL)
- Los ganaderos nuevos quedan en status 'pendiente' hasta que el admin los apruebe
- Los datos migrados se importan con status 'aprobado' porque ya fueron validados
- Para hacer a Daniel admin: después de crear su cuenta, insertar su user_id en la tabla admins manualmente desde Supabase SQL Editor
