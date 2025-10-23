import Header from '@/components/Header'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import AskNigel from '@/components/AskNigel'
import NigelDemo from '@/components/NigelDemo'
import { fetchFeaturedWithFallback } from '@/lib/curators/fetchFeaturedWithFallback'
import CuratorsSectionPeek from '@/components/curators/CuratorsSectionPeek'

export default async function Home() {
  const curators = await fetchFeaturedWithFallback(12); // enough to fill two+ rows
  
  return (
    <>
      <Hero />
      <CuratorsSectionPeek
        title="Featured Curators"
        subtitle="Discover the most influential style curators in fashion."
        curators={curators}
        maxVisiblePx={780}  // tune until the second row "peeks" nicely
        ctaHref="/explore"
        ctaLabel="View all curators"
      />
      <NigelDemo />
      <HowItWorks />
      <Testimonials />
      <Footer />
      <AskNigel />
    </>
  )
} 