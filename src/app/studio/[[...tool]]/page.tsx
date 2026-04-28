'use client'

import dynamic from 'next/dynamic'

const Studio = dynamic(() => import('@/components/StudioWrapper'), {
  ssr: false,
})

export default function StudioPage() {
  return <Studio />
}
