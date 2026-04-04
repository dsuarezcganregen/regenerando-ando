'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MapInner = dynamic(() => import('./HomeMapInner'), { ssr: false })

export default function HomeMapPreview({ markers }: { markers: { lat: number; lng: number; country: string }[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <div style={{ height: '350px' }} className="bg-gray-100 animate-pulse" />
  }

  return <MapInner markers={markers} />
}
