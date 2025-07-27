import Header from '@/components/Header'
import Hero from '@/components/Hero'
import FeaturedCurators from '@/components/FeaturedCurators'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import AskNigel from '@/components/AskNigel'
import CartDemo from '@/components/CartDemo'
import ZoomDemo from '@/components/ZoomDemo'
import NigelDemo from '@/components/NigelDemo'

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCurators />
      <ZoomDemo />
      <NigelDemo />
      <HowItWorks />
      <Testimonials />
      <Footer />
      <AskNigel />
      <CartDemo />
    </>
  )
} 