import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Regenerando Ando — Directorio mundial de ganaderos regenerativos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 50%, #0F6E56 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '64px', fontWeight: 700, color: 'white' }}>
            regenerando
          </span>
          <span style={{ fontSize: '64px', fontWeight: 700, color: '#A7F3D0' }}>
            ando
          </span>
        </div>
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          El directorio mundial de ganaderos regenerativos
        </div>
        <div
          style={{
            display: 'flex',
            gap: '48px',
            marginTop: '48px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '48px', fontWeight: 700, color: 'white' }}>822+</span>
            <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)' }}>Ganaderos</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '48px', fontWeight: 700, color: 'white' }}>27</span>
            <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)' }}>Paises</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '48px', fontWeight: 700, color: 'white' }}>369K</span>
            <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.8)' }}>Hectareas</span>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          regenerandoando.com
        </div>
      </div>
    ),
    { ...size }
  )
}
