'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const countries = [
  { code: 'MX', name: 'México' }, { code: 'CO', name: 'Colombia' },
  { code: 'AR', name: 'Argentina' }, { code: 'EC', name: 'Ecuador' },
  { code: 'CR', name: 'Costa Rica' }, { code: 'UY', name: 'Uruguay' },
  { code: 'ES', name: 'España' }, { code: 'BO', name: 'Bolivia' },
  { code: 'GT', name: 'Guatemala' }, { code: 'VE', name: 'Venezuela' },
  { code: 'PY', name: 'Paraguay' }, { code: 'CL', name: 'Chile' },
  { code: 'PA', name: 'Panamá' }, { code: 'HN', name: 'Honduras' },
  { code: 'PE', name: 'Perú' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'BR', name: 'Brasil' }, { code: 'US', name: 'Estados Unidos' },
  { code: 'SV', name: 'El Salvador' }, { code: 'PT', name: 'Portugal' },
  { code: 'ZA', name: 'Sudáfrica' }, { code: 'DO', name: 'Rep. Dominicana' },
  { code: 'CU', name: 'Cuba' }, { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'Nueva Zelanda' }, { code: 'KE', name: 'Kenia' }, { code: 'FR', name: 'Francia' },
]

export default function EditarPerfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [userId, setUserId] = useState<string | null>(null)

  // Profile fields
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
  const [offersCourses, setOffersCourses] = useState(false)
  const [coursesDesc, setCoursesDesc] = useState('')

  // Location
  const [country, setCountry] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [ecosystem, setEcosystem] = useState('')

  // Operation
  const [totalHectares, setTotalHectares] = useState('')
  const [regenHectares, setRegenHectares] = useState('')
  const [yearsRanching, setYearsRanching] = useState('')
  const [yearsRegen, setYearsRegen] = useState('')
  const [headCount, setHeadCount] = useState('')
  const [primarySystem, setPrimarySystem] = useState('')
  const [businessType, setBusinessType] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

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
        setYoutube(profile.youtube || '')
        setTiktok(profile.tiktok || '')
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
          setYearsRanching(op.years_ranching?.toString() || '')
          setYearsRegen(op.years_regenerative?.toString() || '')
          setHeadCount(op.head_count?.toString() || '')
          setPrimarySystem(op.primary_system || '')
          setBusinessType(op.business_type || '')
        }
      }

      setLoading(false)
    }
    loadProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6))
        setLongitude(pos.coords.longitude.toFixed(6))
      },
      () => setMessage({ type: 'error', text: 'No se pudo obtener la ubicación' })
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setMessage({ type: '', text: '' })

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        ranch_name: ranchName || null,
        description: description || null,
        email,
        phone: phone || null,
        phone_country_code: phoneCode,
        website: website || null,
        instagram: instagram || null,
        facebook: facebook || null,
        youtube: youtube || null,
        tiktok: tiktok || null,
        offers_courses: offersCourses,
        courses_description: coursesDesc || null,
      })
      .eq('id', userId)

    if (profileError) {
      setMessage({ type: 'error', text: 'Error al guardar perfil: ' + profileError.message })
      setSaving(false)
      return
    }

    // Upsert location
    if (country && stateProvince) {
      const locationData = {
        profile_id: userId,
        country,
        state_province: stateProvince,
        municipality: municipality || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ecosystem: ecosystem || null,
      }

      const { data: existingLoc } = await supabase
        .from('locations')
        .select('id')
        .eq('profile_id', userId)
        .single()

      if (existingLoc) {
        await supabase.from('locations').update(locationData).eq('profile_id', userId)
      } else {
        await supabase.from('locations').insert(locationData)
      }
    }

    // Upsert operation
    if (totalHectares || headCount || primarySystem) {
      const opData = {
        profile_id: userId,
        total_hectares: totalHectares ? parseFloat(totalHectares) : null,
        regenerative_hectares: regenHectares ? parseFloat(regenHectares) : null,
        years_ranching: yearsRanching ? parseInt(yearsRanching) : null,
        years_regenerative: yearsRegen ? parseInt(yearsRegen) : null,
        head_count: headCount ? parseInt(headCount) : null,
        primary_system: primarySystem || null,
        business_type: businessType || null,
      }

      const { data: existingOp } = await supabase
        .from('operations')
        .select('id')
        .eq('profile_id', userId)
        .single()

      if (existingOp) {
        await supabase.from('operations').update(opData).eq('profile_id', userId)
      } else {
        await supabase.from('operations').insert(opData)
      }
    }

    setMessage({ type: 'success', text: 'Perfil guardado correctamente' })
    setSaving(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar perfil</h1>
          <Link href="/mi-perfil" className="text-sm text-gray-500 hover:text-primary">
            &larr; Volver
          </Link>
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Info personal */}
          <FormSection title="Información personal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre completo *" value={fullName} onChange={setFullName} required />
              <Field label="Nombre del rancho" value={ranchName} onChange={setRanchName} />
              <Field label="Email *" type="email" value={email} onChange={setEmail} required />
              <div className="flex gap-2">
                <div className="w-24">
                  <Field label="Código" value={phoneCode} onChange={setPhoneCode} />
                </div>
                <div className="flex-1">
                  <Field label="Teléfono" value={phone} onChange={setPhone} />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (max 500 caracteres)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
            </div>
          </FormSection>

          {/* Ubicación */}
          <FormSection title="Ubicación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Seleccionar</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Field label="Estado / Provincia *" value={stateProvince} onChange={setStateProvince} />
              <Field label="Municipio" value={municipality} onChange={setMunicipality} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ecosistema</label>
                <select
                  value={ecosystem}
                  onChange={(e) => setEcosystem(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Seleccionar</option>
                  <option value="bosque_tropical_humedo">Bosque tropical húmedo</option>
                  <option value="bosque_tropical_seco">Bosque tropical seco</option>
                  <option value="bosque_templado">Bosque templado</option>
                  <option value="bosque_mesofilo">Bosque mesófilo</option>
                  <option value="pastizal">Pastizal</option>
                  <option value="sabana">Sabana</option>
                  <option value="matorral_xerofilo">Matorral xerófilo</option>
                  <option value="semidesierto">Semidesierto</option>
                  <option value="desierto">Desierto</option>
                  <option value="paramo">Páramo</option>
                  <option value="sistema_agroforestal">Sistema agroforestal</option>
                  <option value="humedal">Humedal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <Field label="Latitud" value={latitude} onChange={setLatitude} placeholder="-99.1234" />
              <Field label="Longitud" value={longitude} onChange={setLongitude} placeholder="19.4321" />
              <button
                type="button"
                onClick={getLocation}
                className="px-4 py-2.5 border border-primary text-primary rounded-lg text-sm hover:bg-hero-bg transition-colors"
              >
                📍 Obtener GPS
              </button>
            </div>
          </FormSection>

          {/* Operación */}
          <FormSection title="Operación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Hectáreas totales" type="number" value={totalHectares} onChange={setTotalHectares} />
              <Field label="Hectáreas regenerativas" type="number" value={regenHectares} onChange={setRegenHectares} />
              <Field label="Años en ganadería" type="number" value={yearsRanching} onChange={setYearsRanching} />
              <Field label="Años en regenerativo" type="number" value={yearsRegen} onChange={setYearsRegen} />
              <Field label="Cabezas de ganado" type="number" value={headCount} onChange={setHeadCount} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sistema principal</label>
                <select
                  value={primarySystem}
                  onChange={(e) => setPrimarySystem(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Seleccionar</option>
                  <option value="prv">PRV</option>
                  <option value="manejo_holistico">Manejo Holístico</option>
                  <option value="puad">PUAD</option>
                  <option value="silvopastoril">Silvopastoril</option>
                  <option value="stre">STRE</option>
                  <option value="pastoreo_racional">Pastoreo Racional</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de negocio</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Seleccionar</option>
                  <option value="cria">Cría</option>
                  <option value="desarrollo">Desarrollo</option>
                  <option value="engorda">Engorda</option>
                  <option value="cria_desarrollo_engorda">Cría + Desarrollo + Engorda</option>
                  <option value="doble_proposito">Doble propósito</option>
                  <option value="lecheria_especializada">Lechería especializada</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </FormSection>

          {/* Redes sociales */}
          <FormSection title="Redes sociales y web">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sitio web" value={website} onChange={setWebsite} placeholder="https://..." />
              <Field label="Instagram (usuario)" value={instagram} onChange={setInstagram} placeholder="sin @" />
              <Field label="Facebook (usuario o página)" value={facebook} onChange={setFacebook} />
              <Field label="YouTube (URL del canal)" value={youtube} onChange={setYoutube} />
              <Field label="TikTok (usuario)" value={tiktok} onChange={setTiktok} placeholder="sin @" />
            </div>
          </FormSection>

          {/* Cursos */}
          <FormSection title="Cursos y capacitación">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={offersCourses}
                onChange={(e) => setOffersCourses(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Ofrezco cursos o capacitación</span>
            </label>
            {offersCourses && (
              <textarea
                value={coursesDesc}
                onChange={(e) => setCoursesDesc(e.target.value)}
                rows={3}
                placeholder="Describe los cursos que ofreces..."
                className="mt-3 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            )}
          </FormSection>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required = false, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  )
}
