'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { notifyAdmins } from '@/lib/notifications'
import PhotoUploader from '@/components/PhotoUploader'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

const systemOptions = [
  { value: 'prv', label: 'PRV (Pastoreo Racional Voisin)' },
  { value: 'manejo_holistico', label: 'Manejo Holístico' },
  { value: 'puad', label: 'PUAD' },
  { value: 'silvopastoril', label: 'Silvopastoril' },
  { value: 'stre', label: 'STRE' },
  { value: 'pastoreo_racional', label: 'Pastoreo Racional' },
  { value: 'otro', label: 'Otro' },
]

const businessOptions = [
  { value: 'cria', label: 'Cría' },
  { value: 'desarrollo', label: 'Desarrollo' },
  { value: 'engorda', label: 'Engorda' },
  { value: 'doble_proposito', label: 'Doble propósito' },
  { value: 'lecheria_especializada', label: 'Lechería especializada' },
  { value: 'otro', label: 'Otro' },
]

const speciesOptions = [
  { value: 'bovino', label: 'Bovino' },
  { value: 'bufalino', label: 'Bufalino' },
  { value: 'ovino', label: 'Ovino' },
  { value: 'caprino', label: 'Caprino' },
  { value: 'equino', label: 'Equino' },
  { value: 'porcino', label: 'Porcino' },
  { value: 'gallinas', label: 'Gallinas' },
  { value: 'pollos', label: 'Pollos de engorda' },
  { value: 'abejas', label: 'Abejas' },
  { value: 'otro', label: 'Otro' },
]

const TOTAL_STEPS = 5

export default function RegistroWizardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [countries, setCountries] = useState<{ code: string; name_es: string }[]>([])

  // Step 1: Info personal
  const [fullName, setFullName] = useState('')
  const [ranchName, setRanchName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('+52')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')

  // Step 2: Ubicación
  const [country, setCountry] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [ecosystem, setEcosystem] = useState('')

  // Step 3: Operación
  const [totalHectares, setTotalHectares] = useState('')
  const [regenHectares, setRegenHectares] = useState('')
  const [yearStartedRanching, setYearStartedRanching] = useState('')
  const [yearStartedRegen, setYearStartedRegen] = useState('')
  const [systems, setSystems] = useState<string[]>([])
  const [businessTypes, setBusinessTypes] = useState<string[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([])
  const [productsDescription, setProductsDescription] = useState('')

  // Step 4: Resultados
  const [capacityBefore, setCapacityBefore] = useState('')
  const [capacityAfter, setCapacityAfter] = useState('')
  const [soilCoverage, setSoilCoverage] = useState('')
  const [forageDiversity, setForageDiversity] = useState('')
  const [wildlifeIncrease, setWildlifeIncrease] = useState(false)
  const [wildlifeSpecies, setWildlifeSpecies] = useState('')
  const [productionChange, setProductionChange] = useState('')
  const [profitability, setProfitability] = useState('')
  const [workDynamics, setWorkDynamics] = useState('')
  const [narrative, setNarrative] = useState('')

  // Step 5: Fotos
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [ranchPhotos, setRanchPhotos] = useState<any[]>([])
  const [offersCourses, setOffersCourses] = useState(false)
  const [coursesDesc, setCoursesDesc] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      setEmail(user.email || '')
      setFullName(user.user_metadata?.full_name || '')

      // Load countries from DB
      const { data: countriesData } = await supabase
        .from('countries')
        .select('code, name_es')
        .order('name_es')
      if (countriesData) setCountries(countriesData)

      // Check if profile already has data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, locations(*), operations(*)')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setRanchName(profile.ranch_name || '')
        setDescription(profile.description || '')
        setEmail(profile.email || '')
        setPhone(profile.phone || '')
        setPhoneCode(profile.phone_country_code || '+52')
        setWebsite(profile.website || '')
        setInstagram(profile.instagram || '')
        setFacebook(profile.facebook || '')
        setProductsDescription(profile.products_description || '')
        setOffersCourses(profile.offers_courses || false)
        setCoursesDesc(profile.courses_description || '')

        const loc = Array.isArray(profile.locations) ? profile.locations[0] : profile.locations
        if (loc) {
          setCountry(loc.country || '')
          setStateProvince(loc.state_province || '')
          setMunicipality(loc.municipality || '')
          setLatitude(loc.latitude?.toString() || '')
          setLongitude(loc.longitude?.toString() || '')
          setEcosystem(loc.ecosystem || '')
        }

        const op = Array.isArray(profile.operations) ? profile.operations[0] : profile.operations
        if (op) {
          setTotalHectares(op.total_hectares?.toString() || '')
          setRegenHectares(op.regenerative_hectares?.toString() || '')
          setYearStartedRanching(op.year_started_ranching?.toString() || '')
          setYearStartedRegen(op.year_started_regen?.toString() || '')
          setSystems(op.systems || (op.primary_system ? [op.primary_system] : []))
          setBusinessTypes(op.business_types || (op.business_type ? [op.business_type] : []))
        }

        // If profile is already complete, redirect
        if (profile.ranch_name && loc?.country && (op?.primary_system || op?.systems?.length > 0)) {
          router.push('/mi-perfil')
          return
        }
      }

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMulti = (arr: string[], val: string, setter: (v: string[]) => void) => {
    if (arr.includes(val)) setter(arr.filter(v => v !== val))
    else setter([...arr, val])
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const { error } = await supabase.storage.from('avatars').upload(`${userId}.${ext}`, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`${userId}.${ext}`)
      setLogoUrl(publicUrl)
    }
    setUploadingAvatar(false)
  }

  const validateStep = () => {
    setError('')
    if (step === 1) {
      if (!fullName.trim()) { setError('El nombre completo es requerido'); return false }
      if (!ranchName.trim()) { setError('El nombre del rancho es requerido'); return false }
    }
    if (step === 2) {
      if (!country) { setError('Selecciona un país'); return false }
      if (!stateProvince.trim()) { setError('El estado/provincia es requerido'); return false }
    }
    if (step === 3) {
      if (systems.length === 0) { setError('Selecciona al menos un sistema de manejo'); return false }
    }
    return true
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setError('')
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!userId) return
    setSaving(true)
    setError('')

    // Save profile
    await supabase.from('profiles').update({
      full_name: fullName, ranch_name: ranchName || null,
      description: description || null, email,
      phone: phone || null, phone_country_code: phoneCode,
      website: website || null, instagram: instagram || null, facebook: facebook || null,
      offers_courses: offersCourses, courses_description: coursesDesc || null,
      products_description: productsDescription || null,
      logo_url: logoUrl || null,
    }).eq('id', userId)

    // Save location
    if (country && stateProvince) {
      const locData = {
        profile_id: userId, country, state_province: stateProvince,
        municipality: municipality || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ecosystem: ecosystem || null,
      }
      const { data: existingLoc } = await supabase.from('locations').select('id').eq('profile_id', userId).single()
      if (existingLoc) await supabase.from('locations').update(locData).eq('profile_id', userId)
      else await supabase.from('locations').insert(locData)
    }

    // Save operation
    const opData = {
      profile_id: userId,
      total_hectares: totalHectares ? parseFloat(totalHectares) : null,
      regenerative_hectares: regenHectares ? parseFloat(regenHectares) : null,
      year_started_ranching: yearStartedRanching ? parseInt(yearStartedRanching) : null,
      year_started_regen: yearStartedRegen ? parseInt(yearStartedRegen) : null,
      primary_system: systems[0] || null,
      systems,
      business_type: businessTypes[0] || null,
      business_types: businessTypes,
    }
    const { data: existingOp } = await supabase.from('operations').select('id').eq('profile_id', userId).single()
    if (existingOp) await supabase.from('operations').update(opData).eq('profile_id', userId)
    else await supabase.from('operations').insert(opData)

    // Save species
    await supabase.from('ranch_species').delete().eq('profile_id', userId)
    if (selectedSpecies.length > 0) {
      await supabase.from('ranch_species').insert(
        selectedSpecies.map(s => ({ profile_id: userId, species: s }))
      )
    }

    // Save results (if any data provided)
    if (capacityBefore || capacityAfter || soilCoverage || productionChange || narrative) {
      const year = new Date().getFullYear()
      const envData = {
        profile_id: userId, year_reported: year,
        carrying_capacity_before: capacityBefore ? parseFloat(capacityBefore) : null,
        carrying_capacity_after: capacityAfter ? parseFloat(capacityAfter) : null,
        soil_coverage: soilCoverage || null, forage_diversity: forageDiversity || null,
        wildlife_increase: wildlifeIncrease, wildlife_indicator_species: wildlifeSpecies || null,
      }
      await supabase.from('results_environmental').upsert(envData, { onConflict: 'profile_id,year_reported' })

      const econData = {
        profile_id: userId, year_reported: year,
        production_change: productionChange || null, profitability: profitability || null,
        work_dynamics: workDynamics || null, before_after_narrative: narrative || null,
      }
      await supabase.from('results_economic').upsert(econData, { onConflict: 'profile_id,year_reported' })
    }

    // Notify admins
    await notifyAdmins(supabase, 'profile_edited',
      `${ranchName || fullName} completó su registro`,
      `Nuevo ganadero registrado: ${fullName} (${ranchName}). Revisar para aprobar.`,
      userId
    )

    setSaving(false)
    router.push('/mi-perfil')
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Cargando...</div></div>
  }

  const stepNames = ['Datos personales', 'Ubicación', 'Operación', 'Resultados', 'Fotos y más']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registra tu rancho</h1>
          <p className="text-gray-500 mt-1">Paso {step} de {TOTAL_STEPS}: {stepNames[step - 1]}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700">{error}</div>
        )}

        {/* Step 1: Datos personales */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre completo *" value={fullName} onChange={setFullName} />
              <Input label="Nombre del rancho *" value={ranchName} onChange={setRanchName} />
              <Input label="Email *" type="email" value={email} onChange={setEmail} />
              <div className="flex gap-2">
                <div className="w-24"><Input label="Código" value={phoneCode} onChange={setPhoneCode} /></div>
                <div className="flex-1"><Input label="Teléfono" value={phone} onChange={setPhone} /></div>
              </div>
              <Input label="Sitio web" value={website} onChange={setWebsite} placeholder="https://..." />
              <Input label="Instagram" value={instagram} onChange={setInstagram} placeholder="sin @" />
              <Input label="Facebook" value={facebook} onChange={setFacebook} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de tu rancho (max 500)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3}
                placeholder="Cuéntanos sobre tu rancho, tu historia, tu motivación..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
            </div>
          </div>
        )}

        {/* Step 2: Ubicación */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="">Seleccionar</option>
                  {countries.map(c => <option key={c.code} value={c.code}>{c.name_es}</option>)}
                </select>
              </div>
              <Input label="Estado / Provincia *" value={stateProvince} onChange={setStateProvince} />
              <Input label="Municipio" value={municipality} onChange={setMunicipality} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ecosistema</label>
                <select value={ecosystem} onChange={(e) => setEcosystem(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="">Seleccionar</option>
                  <option value="bosque_tropical_humedo">Bosque tropical húmedo</option>
                  <option value="bosque_tropical_seco">Bosque tropical seco</option>
                  <option value="bosque_templado">Bosque templado</option>
                  <option value="pastizal">Pastizal</option>
                  <option value="sabana">Sabana</option>
                  <option value="matorral_xerofilo">Matorral xerófilo</option>
                  <option value="semidesierto">Semidesierto</option>
                  <option value="sistema_agroforestal">Sistema agroforestal</option>
                  <option value="humedal">Humedal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación de tu finca en el mapa</label>
              <LocationPicker latitude={latitude} longitude={longitude}
                onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng) }} />
            </div>
          </div>
        )}

        {/* Step 3: Operación */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Hectáreas totales" type="number" value={totalHectares} onChange={setTotalHectares} />
              <Input label="Hectáreas regenerativas" type="number" value={regenHectares} onChange={setRegenHectares} />
              <Input label="Año que inició en ganadería" type="number" value={yearStartedRanching} onChange={setYearStartedRanching} placeholder="Ej: 1995" />
              <Input label="Año que inició en regenerativo" type="number" value={yearStartedRegen} onChange={setYearStartedRegen} placeholder="Ej: 2018" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sistema(s) de manejo *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {systemOptions.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    systems.includes(opt.value) ? 'border-primary bg-hero-bg text-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="checkbox" checked={systems.includes(opt.value)}
                      onChange={() => toggleMulti(systems, opt.value, setSystems)}
                      className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo(s) de ganadería</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {businessOptions.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    businessTypes.includes(opt.value) ? 'border-primary bg-hero-bg text-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="checkbox" checked={businessTypes.includes(opt.value)}
                      onChange={() => toggleMulti(businessTypes, opt.value, setBusinessTypes)}
                      className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Especies</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {speciesOptions.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedSpecies.includes(opt.value) ? 'border-primary bg-hero-bg text-primary' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="checkbox" checked={selectedSpecies.includes(opt.value)}
                      onChange={() => toggleMulti(selectedSpecies, opt.value, setSelectedSpecies)}
                      className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Productos que vendes o comercializas</label>
              <textarea value={productsDescription} onChange={(e) => setProductsDescription(e.target.value)} rows={4}
                placeholder="Describe los productos que ofreces: becerros al destete, carne empacada, leche, queso, huevo, miel, composta, pie de cría..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
        )}

        {/* Step 4: Resultados */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <p className="text-sm text-gray-500">Si aún no tienes resultados documentados, puedes saltar este paso.</p>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Resultados ambientales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Capacidad de carga ANTES (UA/ha)" type="number" value={capacityBefore} onChange={setCapacityBefore} />
                <Input label="Capacidad de carga DESPUÉS (UA/ha)" type="number" value={capacityAfter} onChange={setCapacityAfter} />
                <Select label="Cobertura de suelo" value={soilCoverage} onChange={setSoilCoverage}
                  options={[['mejorado','Mejorado'],['sin_cambios','Sin cambios'],['empeorado','Empeorado']]} />
                <Select label="Diversidad forrajera" value={forageDiversity} onChange={setForageDiversity}
                  options={[['mejorado','Mejorado'],['sin_cambios','Sin cambios'],['empeorado','Empeorado']]} />
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={wildlifeIncrease} onChange={(e) => setWildlifeIncrease(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm text-gray-700">Aumento de fauna silvestre</span>
              </label>
              {wildlifeIncrease && (
                <div className="mt-2"><Input label="Especies indicadoras" value={wildlifeSpecies} onChange={setWildlifeSpecies} /></div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Resultados económicos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Cambio en producción" value={productionChange} onChange={setProductionChange}
                  options={[['mejorado','Mejorado'],['sin_cambios','Sin cambios'],['empeorado','Empeorado']]} />
                <Select label="Rentabilidad" value={profitability} onChange={setProfitability}
                  options={[['mejor','Mejor'],['igual','Igual'],['peor','Peor']]} />
                <Select label="Dinámica de trabajo" value={workDynamics} onChange={setWorkDynamics}
                  options={[['simplificado','Simplificado'],['igual','Igual'],['complicado','Complicado']]} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu historia: antes y después</label>
              <textarea value={narrative} onChange={(e) => setNarrative(e.target.value)} rows={4}
                placeholder="Cuéntanos cómo era tu rancho antes y cómo es ahora con ganadería regenerativa..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
        )}

        {/* Step 5: Fotos y más */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Foto de perfil</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-hero-bg flex items-center justify-center shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl text-primary font-bold">{fullName?.[0]?.toUpperCase() || 'R'}</span>
                  )}
                </div>
                <label className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-primary-dark">
                  {uploadingAvatar ? 'Subiendo...' : 'Subir foto'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                </label>
              </div>
            </div>

            {userId && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-2">Fotos de tu rancho</h3>
                <p className="text-sm text-gray-500 mb-4">Sube fotos de tu rancho, animales, pasturas. Este es tu escaparate.</p>
                <PhotoUploader profileId={userId} photos={ranchPhotos} onPhotosChange={setRanchPhotos} />
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={offersCourses} onChange={(e) => setOffersCourses(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-gray-700">Ofrezco cursos o capacitación</span>
              </label>
              {offersCourses && (
                <textarea value={coursesDesc} onChange={(e) => setCoursesDesc(e.target.value)} rows={3}
                  placeholder="Describe los cursos que ofreces..."
                  className="mt-3 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <button onClick={prevStep} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              &larr; Anterior
            </button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <button onClick={nextStep} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-dark">
              Siguiente &rarr;
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50">
              {saving ? 'Guardando...' : 'Enviar a revisión'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    </div>
  )
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
        <option value="">Seleccionar</option>
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  )
}
