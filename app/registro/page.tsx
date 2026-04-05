'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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
const productOptions = [
  'Becerros al destete','Novillos/engorda','Carne empacada','Leche','Queso','Yogurt',
  'Huevo','Miel','Lana','Composta','Pie de cría','Semen/embriones','Otro',
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
const waterSourceOptions = [
  'Bebederos portátiles en potrero','Bebedero fijo (área social)','Arroyo/Río',
  'Represas/jagüeyes','Pozo','Otro',
]
const waterHarvestOptions = [
  'Diseño Keyline','Curvas a nivel','Subsoleo Yeomans','Represas/jagüeyes/reservorios',
  'Zanjas de infiltración','Canales-camino','Ninguna','Otro',
]

const TOTAL_STEPS = 8
const stepNames = ['Datos personales','Ubicación','Operación','Resultados','Tu experiencia','Referencias','Fotos y más','¡Gracias!']

export default function RegistroWizardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [countries, setCountries] = useState<{code:string;name_es:string}[]>([])
  const [submitted, setSubmitted] = useState(false)

  // === STEP 1 ===
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

  // === STEP 2 ===
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

  // === STEP 3 ===
  const [totalHectares, setTotalHectares] = useState('')
  const [regenHectares, setRegenHectares] = useState('')
  const [yearStartedRanching, setYearStartedRanching] = useState('')
  const [yearStartedRegen, setYearStartedRegen] = useState('')
  const [generationRanching, setGenerationRanching] = useState('')
  const [headCount, setHeadCount] = useState('')
  const [breedsBySpeciesState, setBreedsBySpeciesState] = useState<Record<string, string[]>>({})
  const [breedOtherBySpecies, setBreedOtherBySpecies] = useState<Record<string, string>>({})

  const [previousModel, setPreviousModel] = useState('')
  const [strategies, setStrategies] = useState<string[]>([])
  const [strategyOther, setStrategyOther] = useState('')
  const [businessTypes, setBusinessTypes] = useState<string[]>([])
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [productOther, setProductOther] = useState('')
  const [productFrequency, setProductFrequency] = useState('')
  // Prácticas implementadas
  const [practicesImplemented, setPracticesImplemented] = useState<string[]>([])
  // Prácticas eliminadas
  const [practicesEliminated, setPracticesEliminated] = useState<string[]>([])

  // === STEP 4 ===
  const [avgOccupationDays, setAvgOccupationDays] = useState('')
  const [grazingDensity, setGrazingDensity] = useState('')
  const [paddockChangesMax, setPaddockChangesMax] = useState('')
  const [paddockChangesRegular, setPaddockChangesRegular] = useState('')
  const [hasWaterSystem, setHasWaterSystem] = useState('')
  const [waterSources, setWaterSources] = useState<string[]>([])
  const [usesIrrigation, setUsesIrrigation] = useState('')
  const [capacityBefore, setCapacityBefore] = useState('')
  const [capacityAfter, setCapacityAfter] = useState('')
  const [hasSoilAnalysis, setHasSoilAnalysis] = useState('')
  const [organicMatterImproved, setOrganicMatterImproved] = useState('')
  const [soilCoverage, setSoilCoverage] = useState('')
  const [erosionReduced, setErosionReduced] = useState('')
  const [forageDiversity, setForageDiversity] = useState('')
  const [wildlifeIncrease, setWildlifeIncrease] = useState(false)
  const [wildlifeSpecies, setWildlifeSpecies] = useState('')
  const [biodiversityOverall, setBiodiversityOverall] = useState('')
  const [agrochemReduction, setAgrochemReduction] = useState('')
  const [otherInputsReduced, setOtherInputsReduced] = useState('')
  const [otherInputsPct, setOtherInputsPct] = useState('')
  const [waterHarvest, setWaterHarvest] = useState<string[]>([])
  const [directPlantDiversity, setDirectPlantDiversity] = useState('')
  const [plantDiversityDesc, setPlantDiversityDesc] = useState('')
  const [productionChange, setProductionChange] = useState('')
  const [productionChangePct, setProductionChangePct] = useState('')
  const [reproductionImproved, setReproductionImproved] = useState('')
  const [parasiteSituation, setParasiteSituation] = useState('')
  const [profitability, setProfitability] = useState('')
  const [profitabilityReason, setProfitabilityReason] = useState('')
  const [financialImproved, setFinancialImproved] = useState('')
  const [workDynamics, setWorkDynamics] = useState('')
  const [workLoad, setWorkLoad] = useState('')
  const [workforceChange, setWorkforceChange] = useState('')
  const [workforceReason, setWorkforceReason] = useState('')
  const [doesAgriculture, setDoesAgriculture] = useState('')
  const [crops, setCrops] = useState('')
  const [cropUse, setCropUse] = useState('')
  const [geneticImpact, setGeneticImpact] = useState('')
  const [wouldEliminate, setWouldEliminate] = useState('')
  const [whyWouldOrNot, setWhyWouldOrNot] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState('')
  const [narrative, setNarrative] = useState('')
  const [additionalComments, setAdditionalComments] = useState('')

  // === STEP 5 ===
  const [practicesDesc, setPracticesDesc] = useState('')
  const [biggestChallenge, setBiggestChallenge] = useState('')
  const [mistakeLearned, setMistakeLearned] = useState('')
  const [soilChangeObserved, setSoilChangeObserved] = useState('')
  const [whatWouldShow, setWhatWouldShow] = useState('')

  // === STEP 6 ===
  const [ref1Name, setRef1Name] = useState('')
  const [ref1Contact, setRef1Contact] = useState('')
  const [ref1Relationship, setRef1Relationship] = useState('')
  const [ref2Name, setRef2Name] = useState('')
  const [ref2Contact, setRef2Contact] = useState('')
  const [ref2Relationship, setRef2Relationship] = useState('')
  const [noReferences, setNoReferences] = useState(false)
  const [howLearned, setHowLearned] = useState('')

  // === STEP 7 ===
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [ranchPhotos, setRanchPhotos] = useState<any[]>([])
  const [offersCourses, setOffersCourses] = useState(false)
  const [coursesDesc, setCoursesDesc] = useState('')
  const [consentPublish, setConsentPublish] = useState(false)
  const [consentPrivacy, setConsentPrivacy] = useState(false)

  // === STEP 8 (invitations) ===
  const [invName, setInvName] = useState('')
  const [invContact, setInvContact] = useState('')
  const [invMessage, setInvMessage] = useState('Hola, te invito a registrar tu rancho en Regenerando Ando, el directorio mundial de ganaderos regenerativos. Es gratuito y es una forma de hacer visible nuestro trabajo. Regístrate en regenerandoando.com')
  const [invSent, setInvSent] = useState<string[]>([])

  // === AUTO-SAVE / RESTORE from localStorage ===
  const STORAGE_KEY = 'ra_registro_draft'

  const getFormData = () => ({
    step, fullName, ranchName, description, phone, phoneCode, website,
    instagram, facebook, youtube, tiktok, hasAdvisor, advisorName,
    hasAssociation, associationName,
    country, stateProvince, municipality, locality, latitude, longitude,
    ecosystem, altitudeMasl, precipitationMm, rainDistribution,
    totalHectares, regenHectares, yearStartedRanching, yearStartedRegen,
    generationRanching, headCount, breedsBySpeciesState, breedOtherBySpecies,
    previousModel, strategies, strategyOther, businessTypes, selectedSpecies,
    selectedProducts, productOther, productFrequency,
    practicesImplemented, practicesEliminated,
    avgOccupationDays, grazingDensity, paddockChangesMax, paddockChangesRegular,
    hasWaterSystem, waterSources, usesIrrigation,
    capacityBefore, capacityAfter, hasSoilAnalysis, organicMatterImproved,
    soilCoverage, erosionReduced, forageDiversity, wildlifeIncrease,
    wildlifeSpecies, biodiversityOverall, agrochemReduction,
    otherInputsReduced, otherInputsPct, waterHarvest,
    directPlantDiversity, plantDiversityDesc,
    productionChange, productionChangePct, reproductionImproved,
    parasiteSituation, profitability, profitabilityReason,
    financialImproved, workDynamics, workLoad, workforceChange, workforceReason,
    doesAgriculture, crops, cropUse, geneticImpact,
    wouldEliminate, whyWouldOrNot, wouldRecommend, narrative, additionalComments,
    practicesDesc, biggestChallenge, mistakeLearned, soilChangeObserved, whatWouldShow,
    ref1Name, ref1Contact, ref1Relationship, ref2Name, ref2Contact, ref2Relationship,
    noReferences, howLearned,
    offersCourses, coursesDesc, consentPublish, consentPrivacy,
  })

  const restoreFormData = (saved: any) => {
    if (saved.step) setStep(saved.step)
    if (saved.fullName) setFullName(saved.fullName)
    if (saved.ranchName) setRanchName(saved.ranchName)
    if (saved.description) setDescription(saved.description)
    if (saved.phone) setPhone(saved.phone)
    if (saved.phoneCode) setPhoneCode(saved.phoneCode)
    if (saved.website) setWebsite(saved.website)
    if (saved.instagram) setInstagram(saved.instagram)
    if (saved.facebook) setFacebook(saved.facebook)
    if (saved.youtube) setYoutube(saved.youtube)
    if (saved.tiktok) setTiktok(saved.tiktok)
    if (saved.hasAdvisor) setHasAdvisor(saved.hasAdvisor)
    if (saved.advisorName) setAdvisorName(saved.advisorName)
    if (saved.hasAssociation) setHasAssociation(saved.hasAssociation)
    if (saved.associationName) setAssociationName(saved.associationName)
    if (saved.country) setCountry(saved.country)
    if (saved.stateProvince) setStateProvince(saved.stateProvince)
    if (saved.municipality) setMunicipality(saved.municipality)
    if (saved.locality) setLocality(saved.locality)
    if (saved.latitude) setLatitude(saved.latitude)
    if (saved.longitude) setLongitude(saved.longitude)
    if (saved.ecosystem) setEcosystem(saved.ecosystem)
    if (saved.altitudeMasl) setAltitudeMasl(saved.altitudeMasl)
    if (saved.precipitationMm) setPrecipitationMm(saved.precipitationMm)
    if (saved.rainDistribution) setRainDistribution(saved.rainDistribution)
    if (saved.totalHectares) setTotalHectares(saved.totalHectares)
    if (saved.regenHectares) setRegenHectares(saved.regenHectares)
    if (saved.yearStartedRanching) setYearStartedRanching(saved.yearStartedRanching)
    if (saved.yearStartedRegen) setYearStartedRegen(saved.yearStartedRegen)
    if (saved.generationRanching) setGenerationRanching(saved.generationRanching)
    if (saved.headCount) setHeadCount(saved.headCount)
    if (saved.breedsBySpeciesState) setBreedsBySpeciesState(saved.breedsBySpeciesState)
    if (saved.breedOtherBySpecies) setBreedOtherBySpecies(saved.breedOtherBySpecies)
    if (saved.previousModel) setPreviousModel(saved.previousModel)
    if (saved.strategies?.length) setStrategies(saved.strategies)
    if (saved.strategyOther) setStrategyOther(saved.strategyOther)
    if (saved.businessTypes?.length) setBusinessTypes(saved.businessTypes)
    if (saved.selectedSpecies?.length) setSelectedSpecies(saved.selectedSpecies)
    if (saved.selectedProducts?.length) setSelectedProducts(saved.selectedProducts)
    if (saved.productOther) setProductOther(saved.productOther)
    if (saved.productFrequency) setProductFrequency(saved.productFrequency)
    if (saved.practicesImplemented?.length) setPracticesImplemented(saved.practicesImplemented)
    if (saved.practicesEliminated?.length) setPracticesEliminated(saved.practicesEliminated)
    if (saved.avgOccupationDays) setAvgOccupationDays(saved.avgOccupationDays)
    if (saved.grazingDensity) setGrazingDensity(saved.grazingDensity)
    if (saved.paddockChangesMax) setPaddockChangesMax(saved.paddockChangesMax)
    if (saved.paddockChangesRegular) setPaddockChangesRegular(saved.paddockChangesRegular)
    if (saved.hasWaterSystem) setHasWaterSystem(saved.hasWaterSystem)
    if (saved.waterSources?.length) setWaterSources(saved.waterSources)
    if (saved.usesIrrigation) setUsesIrrigation(saved.usesIrrigation)
    if (saved.capacityBefore) setCapacityBefore(saved.capacityBefore)
    if (saved.capacityAfter) setCapacityAfter(saved.capacityAfter)
    if (saved.hasSoilAnalysis) setHasSoilAnalysis(saved.hasSoilAnalysis)
    if (saved.organicMatterImproved) setOrganicMatterImproved(saved.organicMatterImproved)
    if (saved.soilCoverage) setSoilCoverage(saved.soilCoverage)
    if (saved.erosionReduced) setErosionReduced(saved.erosionReduced)
    if (saved.forageDiversity) setForageDiversity(saved.forageDiversity)
    if (saved.wildlifeIncrease) setWildlifeIncrease(saved.wildlifeIncrease)
    if (saved.wildlifeSpecies) setWildlifeSpecies(saved.wildlifeSpecies)
    if (saved.biodiversityOverall) setBiodiversityOverall(saved.biodiversityOverall)
    if (saved.agrochemReduction) setAgrochemReduction(saved.agrochemReduction)
    if (saved.otherInputsReduced) setOtherInputsReduced(saved.otherInputsReduced)
    if (saved.otherInputsPct) setOtherInputsPct(saved.otherInputsPct)
    if (saved.waterHarvest?.length) setWaterHarvest(saved.waterHarvest)
    if (saved.directPlantDiversity) setDirectPlantDiversity(saved.directPlantDiversity)
    if (saved.plantDiversityDesc) setPlantDiversityDesc(saved.plantDiversityDesc)
    if (saved.productionChange) setProductionChange(saved.productionChange)
    if (saved.productionChangePct) setProductionChangePct(saved.productionChangePct)
    if (saved.reproductionImproved) setReproductionImproved(saved.reproductionImproved)
    if (saved.parasiteSituation) setParasiteSituation(saved.parasiteSituation)
    if (saved.profitability) setProfitability(saved.profitability)
    if (saved.profitabilityReason) setProfitabilityReason(saved.profitabilityReason)
    if (saved.financialImproved) setFinancialImproved(saved.financialImproved)
    if (saved.workDynamics) setWorkDynamics(saved.workDynamics)
    if (saved.workLoad) setWorkLoad(saved.workLoad)
    if (saved.workforceChange) setWorkforceChange(saved.workforceChange)
    if (saved.workforceReason) setWorkforceReason(saved.workforceReason)
    if (saved.doesAgriculture) setDoesAgriculture(saved.doesAgriculture)
    if (saved.crops) setCrops(saved.crops)
    if (saved.cropUse) setCropUse(saved.cropUse)
    if (saved.geneticImpact) setGeneticImpact(saved.geneticImpact)
    if (saved.wouldEliminate) setWouldEliminate(saved.wouldEliminate)
    if (saved.whyWouldOrNot) setWhyWouldOrNot(saved.whyWouldOrNot)
    if (saved.wouldRecommend) setWouldRecommend(saved.wouldRecommend)
    if (saved.narrative) setNarrative(saved.narrative)
    if (saved.additionalComments) setAdditionalComments(saved.additionalComments)
    if (saved.practicesDesc) setPracticesDesc(saved.practicesDesc)
    if (saved.biggestChallenge) setBiggestChallenge(saved.biggestChallenge)
    if (saved.mistakeLearned) setMistakeLearned(saved.mistakeLearned)
    if (saved.soilChangeObserved) setSoilChangeObserved(saved.soilChangeObserved)
    if (saved.whatWouldShow) setWhatWouldShow(saved.whatWouldShow)
    if (saved.ref1Name) setRef1Name(saved.ref1Name)
    if (saved.ref1Contact) setRef1Contact(saved.ref1Contact)
    if (saved.ref1Relationship) setRef1Relationship(saved.ref1Relationship)
    if (saved.ref2Name) setRef2Name(saved.ref2Name)
    if (saved.ref2Contact) setRef2Contact(saved.ref2Contact)
    if (saved.ref2Relationship) setRef2Relationship(saved.ref2Relationship)
    if (saved.noReferences) setNoReferences(saved.noReferences)
    if (saved.howLearned) setHowLearned(saved.howLearned)
    if (saved.offersCourses) setOffersCourses(saved.offersCourses)
    if (saved.coursesDesc) setCoursesDesc(saved.coursesDesc)
    if (saved.consentPublish) setConsentPublish(saved.consentPublish)
    if (saved.consentPrivacy) setConsentPrivacy(saved.consentPrivacy)
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      setEmail(user.email || '')
      setFullName(user.user_metadata?.full_name || '')

      const { data: countriesData } = await supabase.from('countries').select('code, name_es').order('name_es')
      if (countriesData) setCountries(countriesData)

      // Check if already complete
      const { data: profile } = await supabase.from('profiles').select('*, locations(*), operations(*)').eq('id', user.id).single()
      if (profile?.ranch_name) {
        const loc = Array.isArray(profile.locations) ? profile.locations[0] : profile.locations
        const op = Array.isArray(profile.operations) ? profile.operations[0] : profile.operations
        if (loc?.country && (op?.primary_system || op?.systems?.length > 0)) {
          router.push('/mi-perfil')
          return
        }
      }

      if (profile) {
        setFullName(profile.full_name || '')
        setRanchName(profile.ranch_name || '')
        setEmail(profile.email || '')
      }

      // Restore saved draft from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          restoreFormData(parsed)
        }
      } catch {}

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save to localStorage on every field change (debounced)
  useEffect(() => {
    if (loading || submitted) return
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()))
      } catch {}
    }, 500)
    return () => clearTimeout(timeout)
  }) // eslint-disable-line react-hooks/exhaustive-deps

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

  const validate = () => {
    setError('')
    switch (step) {
      case 1:
        if (!fullName.trim()) return fail('Nombre completo es requerido')
        if (!ranchName.trim()) return fail('Nombre del rancho es requerido')
        if (!email.trim()) return fail('Email es requerido')
        if (!description.trim()) return fail('Escribe una descripción de tu rancho')
        return true
      case 2:
        if (!country) return fail('Selecciona un país')
        if (!stateProvince.trim()) return fail('Estado/provincia es requerido')
        if (!municipality.trim()) return fail('Municipio es requerido')
        if (!ecosystem) return fail('Selecciona un ecosistema')
        if (!latitude || !longitude) return fail('Marca la ubicación de tu rancho en el mapa')
        return true
      case 3:
        if (!totalHectares.trim()) return fail('Hectáreas totales es requerido')
        if (!yearStartedRegen.trim()) return fail('Año de inicio en regenerativo es requerido')
        if (!headCount.trim()) return fail('Número de cabezas es requerido')
        if (strategies.length === 0) return fail('Selecciona al menos una estrategia de manejo')
        if (selectedSpecies.length === 0) return fail('Selecciona al menos una especie')
        if (businessTypes.length === 0) return fail('Selecciona al menos un tipo de ganadería')
        return true
      case 4:
        if (capacityBefore && parseFloat(capacityBefore) > 10) return fail('La capacidad de carga ANTES no puede ser mayor a 10 UA/ha. Revisa el dato.')
        if (capacityAfter && parseFloat(capacityAfter) > 10) return fail('La capacidad de carga DESPUÉS no puede ser mayor a 10 UA/ha. Revisa el dato.')
        return true
      case 5:
        if (!practicesDesc.trim()) return fail('Describe tus prácticas regenerativas')
        if (!biggestChallenge.trim()) return fail('Describe tu mayor desafío')
        if (!mistakeLearned.trim()) return fail('Describe un error y aprendizaje')
        if (!soilChangeObserved.trim()) return fail('Describe los cambios en tu suelo')
        if (!whatWouldShow.trim()) return fail('Responde qué le mostrarías a tu vecino')
        return true
      case 6:
        if (!noReferences) {
          if (!ref1Name.trim() || !ref1Contact.trim() || !ref1Relationship.trim()) return fail('Completa la referencia 1')
          if (!ref2Name.trim() || !ref2Contact.trim() || !ref2Relationship.trim()) return fail('Completa la referencia 2')
        } else if (!howLearned.trim()) {
          return fail('Explica cómo aprendiste sobre ganadería regenerativa')
        }
        return true
      case 7:
        if (!consentPublish) return fail('Debes aceptar el consentimiento de publicación')
        if (!consentPrivacy) return fail('Debes aceptar el aviso de privacidad')
        return true
      default: return true
    }
  }
  const fail = (msg: string) => { setError(msg); window.scrollTo({ top: 0, behavior: 'smooth' }); return false }

  const nextStep = () => { if (validate()) { setStep(s => Math.min(s + 1, TOTAL_STEPS)); window.scrollTo({ top: 0, behavior: 'smooth' }) } }
  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleSubmit = async () => {
    if (!validate() || !userId) return
    setSaving(true); setError('')

    // Profile
    await supabase.from('profiles').update({
      full_name: fullName, ranch_name: ranchName || null, description: description || null, email,
      phone: phone || null, phone_country_code: phoneCode, website: website || null,
      instagram: instagram || null, facebook: facebook || null, youtube: youtube || null, tiktok: tiktok || null,
      offers_courses: offersCourses, courses_description: coursesDesc || null,
      products_description: selectedProducts.join(', ') + (productOther ? `, ${productOther}` : '') || null,
      logo_url: logoUrl || null, consent_publish: consentPublish, consent_privacy: consentPrivacy,
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
      profile_id: userId,
      total_hectares: totalHectares ? parseFloat(totalHectares) : null,
      regenerative_hectares: regenHectares ? parseFloat(regenHectares) : null,
      year_started_ranching: yearStartedRanching ? parseInt(yearStartedRanching) : null,
      year_started_regen: yearStartedRegen ? parseInt(yearStartedRegen) : null,
      generation_ranching: generationRanching || null,
      head_count: headCount ? parseInt(headCount) : null,
      primary_system: strategies[0] || null, systems: strategies, business_type: businessTypes[0] || null, business_types: businessTypes,
      strategy_other: strategies.includes('otro') ? strategyOther : null,
      advisor_name: hasAdvisor === 'si' ? advisorName : null,
      association_name: hasAssociation === 'si' ? associationName : null,
      previous_business_model: previousModel || null,
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

    // Management practices
    const practData: any = {
      profile_id: userId,
      // Prácticas implementadas
      pastoreo_no_selectivo: practicesImplemented.includes('pastoreo_no_selectivo'),
      puad: practicesImplemented.includes('puad'),
      seleccion_genetica: practicesImplemented.includes('seleccion_genetica'),
      programacion_partos: practicesImplemented.includes('programacion_partos'),
      pastoreo_multiespecie: practicesImplemented.includes('pastoreo_multiespecie'),
      silvopastoril: practicesImplemented.includes('silvopastoril'),
      // Prácticas eliminadas
      mecanizacion_suelo: practicesEliminated.includes('mecanizacion_suelo'),
      agrotoxicos: practicesEliminated.includes('agrotoxicos'),
      ivermectina: practicesEliminated.includes('ivermectina'),
      uso_fuego: practicesEliminated.includes('uso_fuego'),
      monocultivo: practicesEliminated.includes('monocultivo'),
      tala_desmonte: practicesEliminated.includes('tala_desmonte'),
      // Pastoreo
      avg_occupation_days: avgOccupationDays ? parseFloat(avgOccupationDays) : null,
      grazing_density_ua_ha: grazingDensity ? parseFloat(grazingDensity) : null,
      paddock_changes_max: paddockChangesMax ? parseInt(paddockChangesMax) : null,
      paddock_changes_regular: paddockChangesRegular ? parseInt(paddockChangesRegular) : null,
      has_water_system: hasWaterSystem === 'si', water_sources: waterSources,
      uses_irrigation: usesIrrigation === 'si',
      keyline_design: waterHarvest.includes('Diseño Keyline'),
      contour_lines: waterHarvest.includes('Curvas a nivel'),
      yeomans_subsoil: waterHarvest.includes('Subsoleo Yeomans'),
      reservoirs: waterHarvest.includes('Represas/jagüeyes/reservorios'),
      infiltration_trenches: waterHarvest.includes('Zanjas de infiltración'),
      canales_camino: waterHarvest.includes('Canales-camino'),
      direct_plant_diversity_practices: directPlantDiversity === 'si',
      plant_diversity_description: plantDiversityDesc || null,
      does_agriculture: doesAgriculture === 'si', crops: crops || null, crop_use: cropUse || null,
    }
    const { data: ePr } = await supabase.from('management_practices').select('id').eq('profile_id', userId).single()
    if (ePr) await supabase.from('management_practices').update(practData).eq('profile_id', userId)
    else await supabase.from('management_practices').insert(practData)

    // Environmental results
    const year = new Date().getFullYear()
    if (capacityBefore || capacityAfter || soilCoverage || wildlifeIncrease) {
      await supabase.from('results_environmental').upsert({
        profile_id: userId, year_reported: year,
        carrying_capacity_before: capacityBefore ? parseFloat(capacityBefore) : null,
        carrying_capacity_after: capacityAfter ? parseFloat(capacityAfter) : null,
        has_soil_analysis: hasSoilAnalysis === 'si', organic_matter_improved: organicMatterImproved === 'si',
        erosion_reduced: erosionReduced === 'si', soil_coverage: soilCoverage || null,
        forage_diversity: forageDiversity || null, wildlife_increase: wildlifeIncrease,
        wildlife_indicator_species: wildlifeSpecies || null, biodiversity_overall: biodiversityOverall || null,
        agrochemical_reduction_pct: agrochemReduction ? parseFloat(agrochemReduction) / 100 : null,
        other_inputs_reduced: otherInputsReduced === 'si',
        other_inputs_reduction_pct: otherInputsPct ? parseFloat(otherInputsPct) : null,
      }, { onConflict: 'profile_id,year_reported' })
    }

    // Economic results
    if (productionChange || profitability || narrative) {
      await supabase.from('results_economic').upsert({
        profile_id: userId, year_reported: year,
        production_change: productionChange || null,
        production_change_pct: productionChangePct ? parseFloat(productionChangePct) : null,
        reproduction_improved: reproductionImproved || null,
        parasite_situation: parasiteSituation || null, profitability: profitability || null,
        profitability_reason: profitabilityReason || null,
        financial_position_improved: financialImproved === 'si',
        work_dynamics: workDynamics || null, work_load: workLoad || null,
        workforce_change: workforceChange || null, workforce_change_reason: workforceReason || null,
        genetic_changes_impact: geneticImpact || null,
        would_eliminate_regen: wouldEliminate === 'si', why_would_or_not: whyWouldOrNot || null,
        would_recommend: wouldRecommend !== 'no', before_after_narrative: narrative || null,
        additional_comments: additionalComments || null,
      }, { onConflict: 'profile_id,year_reported' })
    }

    // Experience
    await supabase.from('rancher_experience').upsert({
      profile_id: userId, practices_description: practicesDesc,
      biggest_challenge: biggestChallenge, mistake_learned: mistakeLearned,
      soil_change_observed: soilChangeObserved, what_would_show_neighbor: whatWouldShow,
    }, { onConflict: 'profile_id' })

    // References
    await supabase.from('rancher_references').delete().eq('profile_id', userId)
    if (!noReferences) {
      await supabase.from('rancher_references').insert([
        { profile_id: userId, reference_name: ref1Name, reference_contact: ref1Contact, relationship: ref1Relationship, reference_number: 1 },
        { profile_id: userId, reference_name: ref2Name, reference_contact: ref2Contact, relationship: ref2Relationship, reference_number: 2 },
      ])
    } else {
      await supabase.from('no_references_explanation').upsert({ profile_id: userId, how_learned: howLearned }, { onConflict: 'profile_id' })
    }

    // Link invitation ref if present
    try {
      const refCode = typeof window !== 'undefined' ? localStorage.getItem('ra_ref') : null
      if (refCode) {
        const res = await fetch(`/api/invitations/${refCode}`)
        const refData = await res.json()
        if (refData.valid) {
          // Update profile with invited_by (via API since we need to look up inviter)
          await fetch('/api/invitations/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refCode, profileId: userId }),
          })
        }
        localStorage.removeItem('ra_ref')
      }
    } catch {
      // non-blocking
    }

    await notifyAdmins(supabase, 'profile_edited', `${ranchName || fullName} completó su registro`, `Nuevo ganadero: ${fullName} (${ranchName}). Revisar para aprobar.`, userId)

    // Send welcome + admin notification emails (only after completing registration)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'welcome', profileId: userId, token: session.access_token }),
        })
        await fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'new_registration', profileId: userId, token: session.access_token }),
        })
      }
    } catch {
      // non-blocking
    }

    setSaving(false)
    setSubmitted(true)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setStep(8)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sendInvitation = async () => {
    if (!invName.trim() || !invContact.trim() || !userId) return
    await supabase.from('invitations').insert({ invited_by: userId, invited_name: invName, invited_email: invContact.includes('@') ? invContact : null, invited_phone: !invContact.includes('@') ? invContact : null, message: invMessage })
    setInvSent(prev => [...prev, invName])
    setInvName(''); setInvContact('')
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Cargando...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{step === 8 ? '¡Gracias por registrarte!' : 'Registra tu rancho'}</h1>
          {step < 8 && <p className="text-gray-500 mt-1">Paso {step} de 7: {stepNames[step - 1]}</p>}
        </div>

        {step < 8 && (
          <div className="mb-8 flex gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
        )}

        {error && <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <Section>
            <Grid>
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
              <Input label="YouTube" value={youtube} onChange={setYoutube} placeholder="URL del canal" />
              <Input label="TikTok" value={tiktok} onChange={setTiktok} placeholder="sin @" />
            </Grid>
            <Textarea label="Descripción de tu rancho * (max 500)" value={description} onChange={setDescription} maxLength={500}
              placeholder="Cuéntanos sobre tu rancho, tu historia, tu motivación..." />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Sel label="¿Tuviste o tienes un asesor?" value={hasAdvisor} onChange={setHasAdvisor} options={[['si','Sí'],['no','No']]} />
                {hasAdvisor === 'si' && <Input label="¿Quién?" value={advisorName} onChange={setAdvisorName} />}
              </div>
              <div>
                <Sel label="¿Perteneces a alguna agrupación?" value={hasAssociation} onChange={setHasAssociation} options={[['si','Sí'],['no','No']]} />
                {hasAssociation === 'si' && <Input label="¿Cuál?" value={associationName} onChange={setAssociationName} />}
              </div>
            </div>
          </Section>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Section>
            <Grid>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="">Seleccionar</option>
                  {countries.map(c => <option key={c.code} value={c.code}>{c.name_es}</option>)}
                </select>
              </div>
              <Input label="Estado / Provincia *" value={stateProvince} onChange={setStateProvince} />
              <Input label="Municipio *" value={municipality} onChange={setMunicipality} />
              <Input label="Localidad / Poblado" value={locality} onChange={setLocality} />
              <Sel label="Ecosistema *" value={ecosystem} onChange={setEcosystem} options={[
                ['bosque_tropical_humedo','Bosque tropical húmedo'],['bosque_tropical_seco','Bosque tropical seco'],
                ['bosque_templado','Bosque templado'],['pastizal','Pastizal'],['sabana','Sabana'],
                ['matorral_xerofilo','Matorral xerófilo'],['semidesierto','Semidesierto'],
                ['sistema_agroforestal','Sistema agroforestal'],['humedal','Humedal'],['otro','Otro'],
              ]} />
              <Input label="Altitud (msnm)" type="number" value={altitudeMasl} onChange={setAltitudeMasl} />
              <Input label="Precipitación anual (mm)" type="number" value={precipitationMm} onChange={setPrecipitationMm} />
              <Input label="Distribución de lluvias" value={rainDistribution} onChange={setRainDistribution} placeholder="Ej: mayo a octubre, bimodal" />
            </Grid>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación de tu finca en el mapa *</label>
              <LocationPicker latitude={latitude} longitude={longitude} onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng) }} />
            </div>
          </Section>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Section>
            <Grid>
              <Input label="Hectáreas totales *" type="number" value={totalHectares} onChange={setTotalHectares} />
              <Input label="Hectáreas regenerativas" type="number" value={regenHectares} onChange={setRegenHectares} />
              <Input label="Año de inicio en ganadería" type="number" value={yearStartedRanching} onChange={setYearStartedRanching} placeholder="Ej: 1995" />
              <Input label="Año de inicio con ganadería regenerativa *" type="number" value={yearStartedRegen} onChange={setYearStartedRegen} placeholder="Ej: 2018" />
              <Sel label="Generación en ganadería" value={generationRanching} onChange={setGenerationRanching}
                options={[['primera','Primera generación'],['segunda','Segunda generación'],['tercera','Tercera generación'],['cuarta_o_mas','Cuarta generación o más']]} />
              <Input label="Número de cabezas aproximado *" type="number" value={headCount} onChange={setHeadCount} />
            </Grid>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
              🔒 Los datos de hectáreas y número de cabezas no se publican en tu perfil. Solo se usan para estadísticas agregadas del dashboard.
            </p>

            <MultiCheck label="Estrategia(s) de manejo *" options={strategyOptions} selected={strategies} onToggle={(v) => toggle(strategies, v, setStrategies)} />
            {strategies.includes('otro') && <Input label="Especifica la estrategia" value={strategyOther} onChange={setStrategyOther} />}

            <MultiCheck label="Prácticas implementadas" options={practicesImplementedOptions} selected={practicesImplemented} onToggle={(v) => toggle(practicesImplemented, v, setPracticesImplemented)} />
            <MultiCheck label="Prácticas eliminadas" options={practicesEliminatedOptions} selected={practicesEliminated} onToggle={(v) => toggle(practicesEliminated, v, setPracticesEliminated)} />

            <MultiCheck label="Tipo(s) de ganadería *" options={businessOptions} selected={businessTypes} onToggle={(v) => toggle(businessTypes, v, setBusinessTypes)} />
            <MultiCheck label="Especies *" options={speciesOptions} selected={selectedSpecies} onToggle={(v) => toggle(selectedSpecies, v, setSelectedSpecies)} />

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
                  <Input label="Otra(s) raza(s)" value={breedOtherBySpecies[sp] || ''} onChange={(v) => setBreedOtherBySpecies(prev => ({ ...prev, [sp]: v }))} placeholder="Razas no listadas arriba" />
                </div>
              )
            })}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Productos que vendes</label>
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
            <Sel label="Frecuencia de disponibilidad de productos" value={productFrequency} onChange={setProductFrequency}
              options={[['diario','Diario'],['semanal','Semanal'],['quincenal','Quincenal'],['mensual','Mensual'],['trimestral','Trimestral'],['semestral','Semestral'],['anual','Anual']]} />
          </Section>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">Todo en este paso es opcional. Llena lo que puedas.</p>

            <Section title="Manejo de pastoreo">
              <Grid>
                <Input label="Tiempo máximo de ocupación de un potrero (días)" type="number" value={avgOccupationDays} onChange={setAvgOccupationDays} />
                <Input label="Densidad de pastoreo promedio (UA/ha)" type="number" value={grazingDensity} onChange={setGrazingDensity} />
                <Input label="Cambios de potrero por día (en los días más intensivos)" type="number" value={paddockChangesMax} onChange={setPaddockChangesMax} />
                <Input label="Cambios de potrero regulares por día" type="number" value={paddockChangesRegular} onChange={setPaddockChangesRegular} />
              </Grid>
            </Section>

            <Section title="Agua">
              <Sel label="¿Sistema de distribución de agua?" value={hasWaterSystem} onChange={setHasWaterSystem} options={[['si','Sí'],['parcial','Parcial'],['no','No']]} />
              <MultiCheck label="¿Cómo se abastece de agua tu ganado?" options={waterSourceOptions.map(v=>({value:v,label:v}))} selected={waterSources} onToggle={(v) => toggle(waterSources, v, setWaterSources)} />
              <Sel label="¿Utilizas riego en pastoreo?" value={usesIrrigation} onChange={setUsesIrrigation} options={[['si','Sí'],['no','No']]} />
            </Section>

            <Section title="Suelo y biodiversidad">
              <Grid>
                <Input label="Capacidad de carga ANTES (UA/ha)" type="number" value={capacityBefore} onChange={setCapacityBefore} placeholder="Ej: 0.5 (máx 10)" />
                <Input label="Capacidad de carga DESPUÉS (UA/ha)" type="number" value={capacityAfter} onChange={setCapacityAfter} placeholder="Ej: 2.5 (máx 10)" />
              </Grid>
              <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                💡 Si mides en ha/UA (hectáreas por unidad animal), divide 1 entre tu valor para convertir a UA/ha. Ejemplo: 10 ha/UA = 1÷10 = 0.1 UA/ha · 5 ha/UA = 1÷5 = 0.2 UA/ha · 2 ha/UA = 1÷2 = 0.5 UA/ha
              </p>
              <Grid>
                <Sel label="¿Tienes análisis de suelos?" value={hasSoilAnalysis} onChange={setHasSoilAnalysis} options={[['si','Sí'],['no','No']]} />
                {hasSoilAnalysis === 'si' && <Sel label="¿Ha mejorado la materia orgánica?" value={organicMatterImproved} onChange={setOrganicMatterImproved} options={[['si','Sí'],['no','No'],['no_se','No sé']]} />}
                <Sel label="Cobertura de suelo" value={soilCoverage} onChange={setSoilCoverage} options={[['mejorado','Mejorado'],['sin_cambios','Sin cambios'],['empeorado','Empeorado']]} />
                <Sel label="¿Reducción en erosión?" value={erosionReduced} onChange={setErosionReduced} options={[['si','Sí'],['no','No']]} />
                <Sel label="Diversidad forrajera" value={forageDiversity} onChange={setForageDiversity} options={[['mejorado','Mejorado'],['sin_cambios','Sin cambios'],['empeorado','Empeorado']]} />
                <Sel label="Biodiversidad general" value={biodiversityOverall} onChange={setBiodiversityOverall} options={[['mejora_notable','Mejora notable'],['alguna_mejora','Alguna mejora'],['sin_cambios','Sin cambios'],['empeoro','Empeoró']]} />
                <Sel label="Reducción de agrotóxicos (%)" value={agrochemReduction} onChange={setAgrochemReduction} options={[['0','0%'],['10','10%'],['20','20%'],['30','30%'],['40','40%'],['50','50%'],['60','60%'],['70','70%'],['80','80%'],['90','90%'],['100','100%']]} />
                <Sel label="¿Reducción en otros insumos?" value={otherInputsReduced} onChange={setOtherInputsReduced} options={[['si','Sí'],['no','No']]} />
                {otherInputsReduced === 'si' && <Input label="¿En qué porcentaje?" value={otherInputsPct} onChange={setOtherInputsPct} type="number" />}
              </Grid>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" checked={wildlifeIncrease} onChange={(e) => setWildlifeIncrease(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm">Aumento de fauna silvestre</span>
              </label>
              {wildlifeIncrease && <Input label="Especies indicadoras" value={wildlifeSpecies} onChange={setWildlifeSpecies} />}
            </Section>

            <Section title="Cosecha de agua y suelo">
              <MultiCheck label="Prácticas implementadas" options={waterHarvestOptions.map(v=>({value:v,label:v}))} selected={waterHarvest} onToggle={(v) => toggle(waterHarvest, v, setWaterHarvest)} />
            </Section>

            <Section title="Diversidad vegetal">
              <Sel label="¿Has hecho prácticas para aumentar diversidad de plantas?" value={directPlantDiversity} onChange={setDirectPlantDiversity} options={[['si','Sí'],['no','No']]} />
              {directPlantDiversity === 'si' && <Textarea label="¿Cuáles?" value={plantDiversityDesc} onChange={setPlantDiversityDesc} />}
            </Section>

            <Section title="Producción y economía">
              <Grid>
                <Sel label="Cambio en producción" value={productionChange} onChange={setProductionChange} options={[['mejorado','Mejorado'],['sin_cambios','Sin cambios'],['empeorado','Empeorado']]} />
                <Input label="¿Cuánto cambió? (%)" type="number" value={productionChangePct} onChange={setProductionChangePct} />
                <Input label="Reproducción mejorada" value={reproductionImproved} onChange={setReproductionImproved} placeholder="Ej: de 60% a 85%" />
                <Sel label="Parásitos" value={parasiteSituation} onChange={setParasiteSituation} options={[['mejor','Mejor'],['igual','Igual'],['peor','Peor']]} />
                <Sel label="Rentabilidad" value={profitability} onChange={setProfitability} options={[['mejor','Mejor'],['igual','Igual'],['peor','Peor']]} />
                <Input label="¿A qué se debe?" value={profitabilityReason} onChange={setProfitabilityReason} />
                <Sel label="¿Mejoró posición financiera?" value={financialImproved} onChange={setFinancialImproved} options={[['si','Sí'],['no','No']]} />
                <Sel label="Dinámica de trabajo" value={workDynamics} onChange={setWorkDynamics} options={[['simplificado','Simplificado'],['igual','Igual'],['complicado','Complicado']]} />
                <Sel label="Carga laboral" value={workLoad} onChange={setWorkLoad} options={[['mejorado','Mejorado'],['sin_cambios','No ha cambiado'],['empeorado','Empeorado']]} />
                <Sel label="Personal laborando" value={workforceChange} onChange={setWorkforceChange} options={[['aumento','Aumentó'],['igual','Igual'],['redujo','Redujo']]} />
              </Grid>
              {workforceChange && workforceChange !== 'igual' && <Input label="¿Por qué el cambio?" value={workforceReason} onChange={setWorkforceReason} />}
            </Section>

            <Section title="Agricultura integrada">
              <Sel label="¿Haces agricultura?" value={doesAgriculture} onChange={setDoesAgriculture} options={[['si','Sí'],['no','No']]} />
              {doesAgriculture === 'si' && <Grid><Input label="¿Qué cultivos?" value={crops} onChange={setCrops} /><Input label="¿Qué uso les das?" value={cropUse} onChange={setCropUse} /></Grid>}
            </Section>

            <Section title="Genética">
              <Input label="Impacto de cambios en genética" value={geneticImpact} onChange={setGeneticImpact} placeholder="Si has hecho cambios, ¿qué impacto han tenido?" />
            </Section>

            <Section title="Valoración final">
              <Grid>
                <Sel label="¿Eliminarías las prácticas regenerativas de tu operación?" value={wouldEliminate} onChange={setWouldEliminate} options={[['si','Sí'],['no','No']]} />
                <Sel label="¿Lo recomendarías?" value={wouldRecommend} onChange={setWouldRecommend} options={[['si_total','Sí, a ojo cerrado'],['si_reservas','Sí, con reservas'],['no','No']]} />
              </Grid>
              {wouldEliminate && <Input label="¿Por qué?" value={whyWouldOrNot} onChange={setWhyWouldOrNot} />}
              <Textarea label="Tu historia: antes y después" value={narrative} onChange={setNarrative} placeholder="¿Cómo describirías tu rancho hoy comparado con antes de la ganadería regenerativa?" />
              <Textarea label="Comentarios adicionales" value={additionalComments} onChange={setAdditionalComments} />
            </Section>
          </div>
        )}

        {/* STEP 5 - Experiencia */}
        {step === 5 && (
          <Section>
            <p className="text-sm text-gray-500 mb-4">Estas preguntas nos ayudan a conocer tu experiencia y a mantener la calidad del directorio. Responde con confianza, no hay respuestas correctas o incorrectas.</p>
            <div className="space-y-4">
              <Textarea label="¿Qué prácticas usas y por qué crees que son regenerativas? *" value={practicesDesc} onChange={setPracticesDesc} placeholder="Describe las prácticas que implementas y por qué son regenerativas" />
              <Textarea label="¿Qué fue lo más difícil de los primeros meses o años? *" value={biggestChallenge} onChange={setBiggestChallenge} />
              <Textarea label="Describe un error que hayas cometido y qué aprendiste *" value={mistakeLearned} onChange={setMistakeLearned} placeholder="Todos cometemos errores, son parte del aprendizaje" />
              <Textarea label="¿Qué cambio concreto has observado en tu suelo? *" value={soilChangeObserved} onChange={setSoilChangeObserved} placeholder="Describe lo que ves, hueles o tocas" />
              <Textarea label="Si tuvieras que convencer a tu vecino, ¿qué le mostrarías primero? *" value={whatWouldShow} onChange={setWhatWouldShow} />
            </div>
          </Section>
        )}

        {/* STEP 6 - Referencias */}
        {step === 6 && (
          <Section>
            <p className="text-sm text-gray-500 mb-4">Para mantener la calidad del directorio, comparte el contacto de 2 ganaderos regenerativos que conozcan tu trabajo. Esta información es confidencial.</p>

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={noReferences} onChange={(e) => setNoReferences(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-700">No conozco a otros ganaderos regenerativos</span>
            </label>

            {!noReferences ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Referencia 1</h3>
                  <Grid>
                    <Input label="Nombre completo *" value={ref1Name} onChange={setRef1Name} />
                    <Input label="Email o teléfono *" value={ref1Contact} onChange={setRef1Contact} />
                  </Grid>
                  <Input label="¿Qué relación tienen? *" value={ref1Relationship} onChange={setRef1Relationship} placeholder="Ej: es mi asesor, tomamos el mismo curso..." />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Referencia 2</h3>
                  <Grid>
                    <Input label="Nombre completo *" value={ref2Name} onChange={setRef2Name} />
                    <Input label="Email o teléfono *" value={ref2Contact} onChange={setRef2Contact} />
                  </Grid>
                  <Input label="¿Qué relación tienen? *" value={ref2Relationship} onChange={setRef2Relationship} />
                </div>
              </div>
            ) : (
              <Textarea label="Cuéntanos cómo aprendiste sobre ganadería regenerativa *" value={howLearned} onChange={setHowLearned} placeholder="¿Quién te ha influido? ¿Cómo llegaste a esto?" />
            )}
          </Section>
        )}

        {/* STEP 7 - Fotos */}
        {step === 7 && (
          <div className="space-y-6">
            <Section title="Foto de perfil">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-hero-bg flex items-center justify-center shrink-0">
                  {logoUrl ? <img src={logoUrl} alt="Perfil" className="w-full h-full object-cover" /> : <span className="text-3xl text-primary font-bold">{fullName?.[0]?.toUpperCase() || 'R'}</span>}
                </div>
                <label className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-primary-dark">
                  {uploadingAvatar ? 'Subiendo...' : 'Subir foto'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                </label>
              </div>
            </Section>

            {userId && (
              <Section title="Fotos de tu rancho">
                <p className="text-sm text-gray-500 mb-4">Sube fotos de tu rancho, animales, pasturas.</p>
                <PhotoUploader profileId={userId} photos={ranchPhotos} onPhotosChange={setRanchPhotos} />
              </Section>
            )}

            <Section title="Cursos">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={offersCourses} onChange={(e) => setOffersCourses(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm">Ofrezco cursos o capacitación</span>
              </label>
              {offersCourses && <Textarea label="Descripción" value={coursesDesc} onChange={setCoursesDesc} placeholder="Describe los cursos que ofreces..." />}
            </Section>

            <Section title="Consentimiento">
              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={consentPublish} onChange={(e) => setConsentPublish(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary mt-0.5" />
                  <span className="text-sm text-gray-700">Estoy de acuerdo en que se publiquen los datos de mi proyecto (nombre, hectáreas, productos y datos de contacto) en el directorio de Regenerando Ando *</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={consentPrivacy} onChange={(e) => setConsentPrivacy(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary mt-0.5" />
                  <span className="text-sm text-gray-700">Acepto el aviso de privacidad *</span>
                </label>
              </div>
            </Section>
          </div>
        )}

        {/* STEP 8 - Gracias */}
        {step === 8 && submitted && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-xl font-semibold text-green-800">¡Tu rancho fue enviado a revisión!</h2>
              <p className="text-sm text-green-700 mt-2">Te avisaremos cuando sea aprobado. Mientras tanto, ¿conoces a otros ganaderos regenerativos? Invítalos.</p>
            </div>

            <Section title="Invita a otros ganaderos">
              <p className="text-sm text-gray-500 mb-4">Entre más seamos, más fuerte es la evidencia. Comparte este enlace con ganaderos que conozcas:</p>
              <div className="space-y-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('¡Registra tu rancho en Regenerando Ando, el directorio mundial de ganaderos regenerativos! Es gratis. https://www.regenerandoando.com/auth/registro')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#1DA851] flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Invitar por WhatsApp
                </a>
                <p className="text-xs text-gray-400 text-center">Cuando tu perfil sea aprobado, tendrás acceso a más herramientas de invitación desde tu panel.</p>
              </div>
            </Section>

            <div className="text-center">
              <button onClick={() => router.push('/mi-perfil')} className="text-primary font-medium hover:underline">
                Ir a mi perfil &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 8 && (
          <div className="mt-6 flex justify-between">
            {step > 1 ? <button onClick={prevStep} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">&larr; Anterior</button> : <div />}
            {step < 7 ? (
              <button onClick={nextStep} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-dark">Siguiente &rarr;</button>
            ) : step === 7 ? (
              <button onClick={handleSubmit} disabled={saving} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Guardando...' : 'Enviar a revisión'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {title && <h3 className="font-medium text-gray-900 mb-4">{title}</h3>}
      {children}
    </div>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
}
function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} step={type === 'number' ? 'any' : undefined}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    </div>
  )
}
function Textarea({ label, value, onChange, placeholder, maxLength }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={3}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      {maxLength && <p className="text-xs text-gray-400 mt-1">{value.length}/{maxLength}</p>}
    </div>
  )
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
        <option value="">Seleccionar</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  )
}
function MultiCheck({ label, options, selected, onToggle }: { label: string; options: { value: string; label: string }[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(opt => (
          <label key={opt.value} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${selected.includes(opt.value) ? 'border-primary bg-hero-bg text-primary' : 'border-gray-200 hover:border-gray-300'}`}>
            <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => onToggle(opt.value)} className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
