import { HomeActionCards } from './home-action-cards'
import { HomeCommunityBanner } from './home-community-banner'
import { HomeHero } from './home-hero'
import { HomeHowItWorks } from './home-how-it-works'
import { HomeRecentItems } from './home-recent-items'

export function HomePage() {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 pb-8 sm:pb-12">
      {/* 1. Hero con buscador principal */}
      <HomeHero />

      {/* 2. Bloque de dos acciones principales */}
      <HomeActionCards />

      {/* 3. Objetos encontrados recientemente */}
      <HomeRecentItems />

      {/* 4. Cómo funciona */}
      <HomeHowItWorks />

      {/* 5. Bloque de comunidad */}
      <HomeCommunityBanner />
    </div>
  )
}
