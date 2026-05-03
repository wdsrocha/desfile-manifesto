import dynamic from 'next/dynamic'

export const dynamic = 'force-static'
export { metadata, viewport } from 'next-sanity/studio'

const Studio = dynamic(() => import('./StudioComponent'), { ssr: false })

export default function StudioPage() {
  return <Studio />
}
