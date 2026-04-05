'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notifyAdmins } from '@/lib/notifications'
import PhotoUploader from '@/components/PhotoUploader'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false })

const strategyOptions = [
  { value: 'prv', label: 'PRV (Pastoreo Racional Voisin)' },
  { value: 'manejo_holistico', label: 'Manejo Holístico' },
  { value: 'puad', label: 'PUAD' },
  { value: 'silvopastoril', label: 'Silvopastoril' },
  { value: 'pastoreo_racional', label: 'Pastoreo Racional' },
  { value: 'otro', label: 'Otro' },
]
const practicesImplementedOptions = [
  { value: 'pastoreo_no_selectivo', label: 'Pastoreo no selectivo' },
  { value: 'puad', label: 'PUAD (Pastoreo Ultra Alta Densidad)' },
  { value: 'seleccion_genetica', label: 'Selección genética' },
  { value: 'programacion_partos', label: 'Programación de partos' },
  { value: 'pastoreo_multiespecie', label: 'Pastoreo multiespecie' },
  { value: 'silvopastoril', label: 'Silvopastoril' },
]
const practicesEliminatedOptions = [
  { value: 'mecanizacion_suelo', label: 'Mecanización del suelo' },
  { value: 'agrotoxicos', label: 'Agrotóxicos' },
  { value: 'ivermectina', label: 'Ivermectina' },
  { value: 'uso_fuego', label: 'Uso de fuego' },
  { value: 'monocultivo', label: 'Monocultivo de pastos' },
  { value: 'tala_desmonte', label: 'Tala / desmonte' },
]
const businessOptions = [
  { value: 'cria', label: 'Cría' },{ value: 'desarrollo', label: 'Desarrollo' },
  { value: 'engorda', label: 'Engorda' },{ value: 'doble_proposito', label: 'Doble propósito' },
  { value: 'lecheria_especializada', label: 'Lechería especializada' },{ value: 'otro', label: 'Otro' },
]
const speciesOptions = [
  { value: 'bovino', label: 'Bovino' },{ value: 'bufalino', label: 'Bufalino' },
  { value: 'ovino', label: 'Ovino' },{ value: 'caprino', label: 'Caprino' },
  { value: 'equino', label: 'Equino' },{ value: 'porcino', label: 'Porcino' },
  { value: 'gallinas', label: 'Gallinas' },{ value: 'pollos', label: 'Pollos de engorda' },
  { value: 'abejas', label: 'Abejas' },{ value: 'otro', label: 'Otro' },
]
const breedsBySpecies: Record<string, string[]> = {
  bovino: [
    'Brahman','Nelore','Gyr','Guzerat','Indubrasil','Sardo Negro',
    'Angus','Hereford','Charolais','Simmental','Limousin','Pardo Suizo',
    'Holstein','Jersey','Normando','Montbéliarde',
    'Brangus','Bradford','Braford','Santa Gertrudis','Girolando','F1',
    'Criollo','Romosinuano','Blanco Orejinegro','Costeño con Cuernos','Hartón del Valle',
    'Senepol','Bonsmara','Tuli',
  ],
  bufalino: ['Murrah','Mediterráneo','Jafarabadi','Carabao','Búfalo de río'],
  ovino: ['Dorper','Katahdin','Pelibuey','Blackbelly','Suffolk','Hampshire','Santa Inés','Texel','Merino','Criollo'],
  caprino: ['Boer','Nubia','Saanen','Alpina','Toggenburg','Murciana','LaMancha','Anglo-Nubian','Criollo'],
  equino: ['Cuarto de Milla','Criollo','Paso Fino','Pura Sangre','Appaloosa','Árabe','Percherón'],
  porcino: ['Duroc','Hampshire','Yorkshire','Landrace','Pietrain','Berkshire','Criollo','Pelón Mexicano'],
}
const allBreedOptions = [...new Set(Object.values(breedsBySpecies).flat())]
const productOptions = [
  'Becerros al destete','Novillos/engorda','Carne empacada','Leche','Queso','Yogurt',
  'Huevo','Miel','Lana','Composta','Pie de cría','Semen/embriones','Otro',
]

export default function EditarPerfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [userId, setUserId] = useState<string | null>(null)
  const [profileStatus, setProfileStatus] = useState('')
  const [countries, setCountries] = useState<{code:string;name_es:string}[]>([])

  // Personal
  const [fullName, setFullName] = useState('')
  const [ranchName, setRanchName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('+52')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [hasAdvisor, setHasAdvisor] = useState('')
  const [advisorName, setAdvisorName] = useState('')
  const [hasAssociation, setHasAssociation] = useState('')
  const [associationName, setAssociationName] = useState('')
  const [showEmail, setShowEmail] = useState(true)
  const [showPhone, setShowPhone] = useState(true)
  const [showWebsite, setShowWebsite] = useState(true)
  const [showSocial, setShowSocial] = useState(true)

  // Location
  const [country, setCountry] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [locality, setLocality] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [ecosystem, setEcosystem] = useState('')
  const [altitudeMasl, setAltitudeMasl] = useState('')
  const [precipitationMm, setPrecipitationMm] = useState('')
  const [rainDistribution, setRainDistribution] = useState('')

  // Operation
  const [totalHectares, setTotalHectares] = useState('')
  const [regenHectares, setRegenHectares] = useState('')
  const [yearStartedRanching, setYearStartedRanching] = useState('')
  const [yearStartedRegen, setYearStartedRegen] = useState('')
  const [generationRanching, setGenerationRanching] = useState('')
  const [headCount, setHeadCount] = useState('')
  const [breedsBySpeciesState, setBreedsBySpeciesState] = useState<Record<string, string[]>>({})
  const [breedOtherBySpecies, setBreedOtherBySpecies] = useState<Record<string, string>>({})

  const [strategies, setStrategies] = useState<string[]>([])
  const [strategyOther, setStrategyOther] = useState('')
  const [businessTypes, setBusinessTypes] = useState<string[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [productOther, setProductOther] = useState('')
  const [productFrequency, setProductFrequency] = useState('')
  const [practicesImplemented, setPracticesImplemented] = useState<string[]>([])
  const [practicesEliminated, setPracticesEliminated] = useState<string[]>([])

  // Photos
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [ranchPhotos, setRanchPhotos] = useState<any[]>([])
  const [offersCourses, setOffersCourses] = useState(false)
  const [coursesDesc, setCoursesDesc] = useState('')

  // Experience
  const [practicesDesc, setPracticesDesc] = useState('')
  const [biggestChallenge, setBiggestChallenge] = useState('')
  const [mistakeLearned, setMistakeLearned] = useState('')
  const [soilChangeObserved, setSoilChangeObserved] = useState('')
  const [whatWouldShow, setWhatWouldShow] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: countriesData } = await supabase.from('countries').select('code, name_es').order('name_es')
      if (countriesData) setCountries(countriesData)

      const { data: profile } = await supabase.from('profiles').select('*, locations(*), operations(*)').eq('id', user.id).single()
      if (profile) {
        setFullName(profile.full_name || ''); setRanchName(profile.ranch_name || '')
        setDescription(profile.description || ''); setEmail(profile.email || '')
        setPhone(profile.phone || ''); setPhoneCode(profile.phone_country_code || '+52')
        setWebsite(profile.website || ''); setInstagram(profile.instagram || '')
        setFacebook(profile.facebook || ''); setYoutube(profile.youtube || '')
        setTiktok(profile.tiktok || ''); setOffersCourses(profile.offers_courses || false)
        setCoursesDesc(profile.courses_description || ''); setLogoUrl(profile.logo_url || '')
        setProfileStatus(profile.status || '')
        setShowEmail(profile.show_email ?? true); setShowPhone(profile.show_phone ?? true)
        setShowWebsite(profile.show_website ?? true); setShowSocial(profile.show_social ?? true)

        const loc = Array.isArray(profile.locations) ? profile.locations[0] : profile.locations
        if (loc) {
          setCountry(loc.country || ''); setStateProvince(loc.state_province || '')
          setMunicipality(loc.municipality || ''); setLocality(loc.locality || '')
          setLatitude(loc.latitude?.toString() || ''); setLongitude(loc.longitude?.toString() || '')
          setEcosystem(loc.ecosystem || '')
          setAltitudeMasl(loc.altitude_masl?.toString() || '')
          setPrecipitationMm(loc.annual_precipitation_mm?.toString() || '')
          setRainDistribution(loc.rain_distribution || '')
        }

        const op = Array.isArray(profile.operations) ? profile.operations[0] : profile.operations
        if (op) {
          setTotalHectares(op.total_hectares?.toString() || '')
          setRegenHectares(op.regenerative_hectares?.toString() || '')
          setYearStartedRanching(op.year_started_ranching?.toString() || '')
          setYearStartedRegen(op.year_started_regen?.toString() || '')
          setGenerationRanching(op.generation_ranching || '')
          setHeadCount(op.head_count?.toString() || '')
          setStrategies(op.systems || (op.primary_system ? [op.primary_system] : []))
          setStrategyOther(op.strategy_other || '')
          setBusinessTypes(op.business_types || (op.business_type ? [op.business_type] : []))
          setHasAdvisor(op.advisor_name ? 'si' : ''); setAdvisorName(op.advisor_name || '')
          setHasAssociation(op.association_name ? 'si' : ''); setAssociationName(op.association_name || '')
        }
      }

      // Species (breeds per species)
      const { data: speciesData } = await supabase.from('ranch_species').select('species, breeds').eq('profile_id', user.id)
      if (speciesData) {
        setSelectedSpecies(speciesData.map(s => s.species))
        const breedsMap: Record<string, string[]> = {}
        const otherMap: Record<string, string> = {}
        speciesData.forEach(s => {
          if (s.breeds) {
            const parts = s.breeds.split(',').map((b: string) => b.trim()).filter(Boolean)
            const speciesBreedList = breedsBySpecies[s.species] || []
            breedsMap[s.species] = parts.filter((b: string) => speciesBreedList.includes(b))
            const others = parts.filter((b: string) => !speciesBreedList.includes(b) && !allBreedOptions.includes(b))
            if (others.length > 0) otherMap[s.species] = others.join(', ')
          }
        })
        setBreedsBySpeciesState(breedsMap)
        setBreedOtherBySpecies(otherMap)
      }

      // Products
      const { data: productsData } = await supabase.from('products').select('product_type').eq('profile_id', user.id)
      if (productsData) setSelectedProducts(productsData.map(p => p.product_type?.replace(/_/g, ' ') || ''))

      // Photos
      const { data: photosData } = await supabase.from('photos').select('*').eq('profile_id', user.id).order('uploaded_at')
      if (photosData) setRanchPhotos(photosData)

      // Management practices
      const { data: mp } = await supabase.from('management_practices').select('*').eq('profile_id', user.id).single()
      if (mp) {
        const impl: string[] = []
        if (mp.pastoreo_no_selectivo) impl.push('pastoreo_no_selectivo')
        if (mp.puad) impl.push('puad')
        if (mp.seleccion_genetica) impl.push('seleccion_genetica')
        if (mp.programacion_partos) impl.push('programacion_partos')
        if (mp.pastoreo_multiespecie) impl.push('pastoreo_multiespecie')
        if (mp.silvopastoril) impl.push('silvopastoril')
        setPracticesImplemented(impl)
        const elim: string[] = []
        if (mp.mecanizacion_suelo) elim.push('mecanizacion_suelo')
        if (mp.agrotoxicos) elim.push('agrotoxicos')
        if (mp.ivermectina) elim.push('ivermectina')
        if (mp.uso_fuego) elim.push('uso_fuego')
        if (mp.monocultivo) elim.push('monocultivo')
        if (mp.tala_desmonte) elim.push('tala_desmonte')
        setPracticesEliminated(elim)
      }

      // Experience
      const { data: exp } = await supabase.from('rancher_experience').select('*').eq('profile_id', user.id).single()
      if (exp) {
        setPracticesDesc(exp.practices_description || ''); setBiggestChallenge(exp.biggest_challenge || '')
        setMistakeLearned(exp.mistake_learned || ''); setSoilChangeObserved(exp.soil_change_observed || '')
        setWhatWouldShow(exp.what_would_show_neighbor || '')
      }

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    const missing: string[] = []
    if (!fullName.trim()) missing.push('Nombre completo')
    if (!ranchName.trim()) missing.push('Nombre del rancho')
    if (!country) missing.push('País')
    if (!stateProvince.trim()) missing.push('Estado/Provincia')
    if (strategies.length === 0) missing.push('Al menos una estrategia de manejo')
    if (missing.length > 0) {
      setMessage({ type: 'error', text: `Campos requeridos: ${missing.join(', ')}` })
      window.scrollTo({ top: 0, behavior: 'smooth' }); return
    }

    setSaving(true); setMessage({ type: '', text: '' })

    // Profile
    await supabase.from('profiles').update({
      full_name: fullName, ranch_name: ranchName || null, description: description || null, email,
      phone: phone || null, phone_country_code: phoneCode, website: website || null,
      instagram: instagram || null, facebook: facebook || null, youtube: youtube || null, tiktok: tiktok || null,
      offers_courses: offersCourses, courses_description: coursesDesc || null,
      logo_url: logoUrl || null, show_email: showEmail, show_phone: showPhone,
      show_website: showWebsite, show_social: showSocial,
    }).eq('id', userId)

    // Location
    const locData: any = {
      profile_id: userId, country, state_province: stateProvince,
      municipality: municipality || null, locality: locality || null,
      latitude: latitude ? parseFloat(latitude) : null, longitude: longitude ? parseFloat(longitude) : null,
      ecosystem: ecosystem || null, altitude_masl: altitudeMasl ? parseInt(altitudeMasl) : null,
      annual_precipitation_mm: precipitationMm ? parseInt(precipitationMm) : null,
      rain_distribution: rainDistribution || null,
    }
    const { data: eLoc } = await supabase.from('locations').select('id').eq('profile_id', userId).single()
    if (eLoc) await supabase.from('locations').update(locData).eq('profile_id', userId)
    else await supabase.from('locations').insert(locData)

    // Operation
    const opData: any = {
      profile_id: userId, total_hectares: totalHectares ? parseFloat(totalHectares) : null,
      regenerative_hectares: regenHectares ? parseFloat(regenHectares) : null,
      year_started_ranching: yearStartedRanching ? parseInt(yearStartedRanching) : null,
      year_started_regen: yearStartedRegen ? parseInt(yearStartedRegen) : null,
      generation_ranching: generationRanching || null,
      head_count: headCount ? parseInt(headCount) : null,
      primary_system: strategies[0] || null, systems: strategies,
      strategy_other: strategies.includes('otro') ? strategyOther : null,
      business_type: businessTypes[0] || null, business_types: businessTypes,
      advisor_name: hasAdvisor === 'si' ? advisorName : null,
      association_name: hasAssociation === 'si' ? associationName : null,
    }
    const { data: eOp } = await supabase.from('operations').select('id').eq('profile_id', userId).single()
    if (eOp) await supabase.from('operations').update(opData).eq('profile_id', userId)
    else await supabase.from('operations').insert(opData)

    // Species (breeds per species)
    await supabase.from('ranch_species').delete().eq('profile_id', userId)
    if (selectedSpecies.length > 0) {
      await supabase.from('ranch_species').insert(selectedSpecies.map(s => {
        const speciesBreeds = breedsBySpeciesState[s] || []
        const otherBreed = breedOtherBySpecies[s] || ''
        const breedsStr = [...speciesBreeds, ...(otherBreed ? [otherBreed] : [])].join(', ')
        return { profile_id: userId, species: s, breeds: breedsStr || null }
      }))
    }

    // Management practices (prácticas implementadas y eliminadas)
    const practData: any = {
      profile_id: userId,
      pastoreo_no_selectivo: practicesImplemented.includes('pastoreo_no_selectivo'),
      puad: practicesImplemented.includes('puad'),
      seleccion_genetica: practicesImplemented.includes('seleccion_genetica'),
      programacion_partos: practicesImplemented.includes('programacion_partos'),
      pastoreo_multiespecie: practicesImplemented.includes('pastoreo_multiespecie'),
      silvopastoril: practicesImplemented.includes('silvopastoril'),
      mecanizacion_suelo: practicesEliminated.includes('mecanizacion_suelo'),
      agrotoxicos: practicesEliminated.includes('agrotoxicos'),
      ivermectina: practicesEliminated.includes('ivermectina'),
      uso_fuego: practicesEliminated.includes('uso_fuego'),
      monocultivo: practicesEliminated.includes('monocultivo'),
      tala_desmonte: practicesEliminated.includes('tala_desmonte'),
    }
    const { data: existingPract } = await supabase.from('management_practices').select('id').eq('profile_id', userId).single()
    if (existingPract) await supabase.from('management_practices').update(practData).eq('profile_id', userId)
    else await supabase.from('management_practices').insert(practData)

    // Experience
    if (practicesDesc || soilChangeObserved) {
      await supabase.from('rancher_experience').upsert({
        profile_id: userId, practices_description: practicesDesc || null,
        biggest_challenge: biggestChallenge || null, mistake_learned: mistakeLearned || null,
        soil_change_observed: soilChangeObserved || null, what_would_show_neighbor: whatWouldShow || null,
      }, { onConflict: 'profile_id' })
    }

    // Notify admins if pending/rejected
    if (profileStatus === 'pendiente' || profileStatus === 'rechazado') {
      await notifyAdmins(supabase, 'profile_edited', `${ranchName || fullName} editó su perfil`,
        `El ganadero ${fullName} actualizó su perfil (estado: ${profileStatus}).`, userId)
    }

    setMessage({ type: 'success', text: 'Perfil guardado correctamente' })
    setSaving(false); window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Cargando...</div></div>

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar perfil</h1>
          <Link href="/mi-perfil" className="text-sm text-gray-500 hover:text-primary">&larr; Volver</Link>
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Foto de perfil */}
          <Section title="Foto de perfil">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-hero-bg flex items-center justify-center shrink-0">
                {logoUrl ? <img src={logoUrl} alt="Perfil" className="w-full h-full object-cover" /> : <span className="text-3xl text-primary font-bold">{fullName?.[0]?.toUpperCase() || 'R'}</span>}
              </div>
              <label className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-primary-dark">
                {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
              </label>
            </div>
          </Section>

          {/* Datos personales */}
          <Section title="Datos personales">
            <Grid>
              <Input label="Nombre completo *" value={fullName} onChange={setFullName} />
              <Input label="Nombre del rancho *" value={ranchName} onChange={setRanchName} />
              <div>
                <Input label="Email *" type="email" value={email} onChange={setEmail} />
                <Vis checked={showEmail} onChange={setShowEmail} />
              </div>
              <div>
                <div className="flex gap-2">
                  <div className="w-24"><Input label="Código" value={phoneCode} onChange={setPhoneCode} /></div>
                  <div className="flex-1"><Input label="Teléfono" value={phone} onChange={setPhone} /></div>
                </div>
                <Vis checked={showPhone} onChange={setShowPhone} />
              </div>
              <div>
                <Input label="Sitio web" value={website} onChange={setWebsite} placeholder="https://..." />
                <Vis checked={showWebsite} onChange={setShowWebsite} />
              </div>
              <Input label="Instagram" value={instagram} onChange={setInstagram} placeholder="sin @" />
              <Input label="Facebook" value={facebook} onChange={setFacebook} />
              <Input label="YouTube" value={youtube} onChange={setYoutube} placeholder="URL del canal" />
              <Input label="TikTok" value={tiktok} onChange={setTiktok} placeholder="sin @" />
            </Grid>
            <Vis checked={showSocial} onChange={setShowSocial} label="Mostrar redes sociales en perfil público" />
            <Textarea label="Descripción del rancho (max 500)" value={description} onChange={setDescription} maxLength={500} />
            <Grid>
              <div>
                <Sel label="¿Tienes asesor?" value={hasAdvisor} onChange={setHasAdvisor} options={[['si','Sí'],['no','No']]} />
                {hasAdvisor === 'si' && <Input label="¿Quién?" value={advisorName} onChange={setAdvisorName} />}
              </div>
              <div>
                <Sel label="¿Agrupación ganadera?" value={hasAssociation} onChange={setHasAssociation} options={[['si','Sí'],['no','No']]} />
                {hasAssociation === 'si' && <Input label="¿Cuál?" value={associationName} onChange={setAssociationName} />}
              </div>
            </Grid>
          </Section>

          {/* Ubicación */}
          <Section title="Ubicación">
            <Grid>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="">Seleccionar</option>
                  {countries.map(c => <option key={c.code} value={c.code}>{c.name_es}</option>)}
                </select>
              </div>
              <Input label="Estado / Provincia *" value={stateProvince} onChange={setStateProvince} />
              <Input label="Municipio" value={municipality} onChange={setMunicipality} />
              <Input label="Localidad / Poblado" value={locality} onChange={setLocality} />
              <Sel label="Ecosistema" value={ecosystem} onChange={setEcosystem} options={[
                ['bosque_tropical_humedo','Bosque tropical húmedo'],['bosque_tropical_seco','Bosque tropical seco'],
                ['bosque_templado','Bosque templado'],['pastizal','Pastizal'],['sabana','Sabana'],
                ['matorral_xerofilo','Matorral xerófilo'],['semidesierto','Semidesierto'],
                ['sistema_agroforestal','Sistema agroforestal'],['humedal','Humedal'],['otro','Otro'],
              ]} />
              <Input label="Altitud (msnm)" type="number" value={altitudeMasl} onChange={setAltitudeMasl} />
              <Input label="Precipitación anual (mm)" type="number" value={precipitationMm} onChange={setPrecipitationMm} />
              <Input label="Distribución de lluvias" value={rainDistribution} onChange={setRainDistribution} placeholder="Ej: mayo a octubre" />
            </Grid>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación en el mapa</label>
              <LocationPicker latitude={latitude} longitude={longitude} onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng) }} />
            </div>
          </Section>

          {/* Operación */}
          <Section title="Operación">
            <Grid>
              <Input label="Hectáreas totales" type="number" value={totalHectares} onChange={setTotalHectares} />
              <Input label="Hectáreas regenerativas" type="number" value={regenHectares} onChange={setRegenHectares} />
              <Input label="Año de inicio en ganadería" type="number" value={yearStartedRanching} onChange={setYearStartedRanching} placeholder="Ej: 1995" />
              <Input label="Año de inicio en regenerativo" type="number" value={yearStartedRegen} onChange={setYearStartedRegen} placeholder="Ej: 2018" />
              <Sel label="Generación en ganadería" value={generationRanching} onChange={setGenerationRanching}
                options={[['primera','Primera'],['segunda','Segunda'],['tercera','Tercera'],['cuarta_o_mas','Cuarta+']]} />
              <Input label="Cabezas aproximadas" type="number" value={headCount} onChange={setHeadCount} />
            </Grid>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
              🔒 Los datos de hectáreas y número de cabezas no se publican en tu perfil. Solo se usan para estadísticas agregadas del dashboard.
            </p>
            <MultiCheck label="Estrategia(s) de manejo *" options={strategyOptions} selected={strategies} onToggle={(v) => toggle(strategies, v, setStrategies)} />
            {strategies.includes('otro') && <Input label="Especifica" value={strategyOther} onChange={setStrategyOther} />}
            <MultiCheck label="Prácticas implementadas" options={practicesImplementedOptions} selected={practicesImplemented} onToggle={(v) => toggle(practicesImplemented, v, setPracticesImplemented)} />
            <MultiCheck label="Prácticas eliminadas" options={practicesEliminatedOptions} selected={practicesEliminated} onToggle={(v) => toggle(practicesEliminated, v, setPracticesEliminated)} />
            <MultiCheck label="Tipo(s) de ganadería" options={businessOptions} selected={businessTypes} onToggle={(v) => toggle(businessTypes, v, setBusinessTypes)} />
            <MultiCheck label="Especies" options={speciesOptions} selected={selectedSpecies} onToggle={(v) => toggle(selectedSpecies, v, setSelectedSpecies)} />

            {/* Razas por especie */}
            {selectedSpecies.filter(sp => breedsBySpecies[sp]).map(sp => {
              const speciesLabel = speciesOptions.find(o => o.value === sp)?.label || sp
              const breeds = breedsBySpecies[sp] || []
              const selected = breedsBySpeciesState[sp] || []
              const toggleBreed = (breed: string) => {
                setBreedsBySpeciesState(prev => {
                  const current = prev[sp] || []
                  return { ...prev, [sp]: current.includes(breed) ? current.filter(b => b !== breed) : [...current, breed] }
                })
              }
              return (
                <div key={sp} className="mt-4 border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razas de {speciesLabel}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {breeds.map(b => (
                      <label key={b} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${selected.includes(b) ? 'border-primary bg-hero-bg text-primary' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={selected.includes(b)} onChange={() => toggleBreed(b)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                        {b}
                      </label>
                    ))}
                  </div>
                  <Input label="Otra(s) raza(s)" value={breedOtherBySpecies[sp] || ''} onChange={(v) => setBreedOtherBySpecies(prev => ({ ...prev, [sp]: v }))} placeholder="Razas no listadas" />
                </div>
              )
            })}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {productOptions.map(p => (
                  <label key={p} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${selectedProducts.includes(p) ? 'border-primary bg-hero-bg text-primary' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={selectedProducts.includes(p)} onChange={() => toggle(selectedProducts, p, setSelectedProducts)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                    {p}
                  </label>
                ))}
              </div>
              {selectedProducts.includes('Otro') && <Input label="Especifica" value={productOther} onChange={setProductOther} />}
            </div>
          </Section>

          {/* Experiencia */}
          <Section title="Tu experiencia">
            <div className="space-y-4">
              <Textarea label="¿Qué prácticas usas y por qué son regenerativas?" value={practicesDesc} onChange={setPracticesDesc} />
              <Textarea label="¿Qué fue lo más difícil de empezar?" value={biggestChallenge} onChange={setBiggestChallenge} />
              <Textarea label="Describe un error y qué aprendiste" value={mistakeLearned} onChange={setMistakeLearned} />
              <Textarea label="¿Qué cambio observas en tu suelo?" value={soilChangeObserved} onChange={setSoilChangeObserved} />
              <Textarea label="¿Qué le mostrarías a tu vecino?" value={whatWouldShow} onChange={setWhatWouldShow} />
            </div>
          </Section>

          {/* Fotos del rancho */}
          {userId && (
            <Section title="Fotos de tu rancho">
              <PhotoUploader profileId={userId} photos={ranchPhotos} onPhotosChange={setRanchPhotos} />
            </Section>
          )}

          {/* Cursos */}
          <Section title="Cursos y capacitación">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={offersCourses} onChange={(e) => setOffersCourses(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm">Ofrezco cursos o capacitación</span>
            </label>
            {offersCourses && <Textarea label="Descripción" value={coursesDesc} onChange={setCoursesDesc} />}
          </Section>

          <button type="submit" disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-gray-200 p-6"><h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>{children}</div>
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}
function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} step={type === 'number' ? 'any' : undefined}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" /></div>
}
function Textarea({ label, value, onChange, maxLength }: { label: string; value: string; onChange: (v: string) => void; maxLength?: number }) {
  return <div className="mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} rows={3}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    {maxLength && <p className="text-xs text-gray-400 mt-1">{value.length}/{maxLength}</p>}</div>
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
      <option value="">Seleccionar</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select></div>
}
function Vis({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return <label className="flex items-center gap-2 mt-1 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
    <span className="text-xs text-gray-500">{label || 'Mostrar en perfil público'}</span>
  </label>
}
function MultiCheck({ label, options, selected, onToggle }: { label: string; options: { value: string; label: string }[]; selected: string[]; onToggle: (v: string) => void }) {
  return <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map(opt => (
        <label key={opt.value} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${selected.includes(opt.value) ? 'border-primary bg-hero-bg text-primary' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => onToggle(opt.value)} className="rounded border-gray-300 text-primary focus:ring-primary" />
          <span className="text-sm">{opt.label}</span>
        </label>
      ))}
    </div></div>
}
