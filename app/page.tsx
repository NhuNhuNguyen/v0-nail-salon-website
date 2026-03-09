import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Gallery } from "@/components/gallery"
import { Reviews } from "@/components/reviews"
import { WhyUs } from "@/components/why-us"
import { Services } from "@/components/services"
import { About } from "@/components/about"
import { FAQ } from "@/components/faq"
import { Visit } from "@/components/visit"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import type { Review, Staff } from "@/lib/types"

// NOTE: Using ISR with 60s revalidation. When an admin publishes a review it will
// appear within ~60 seconds. Full SSR would guarantee instant updates but adds
// latency to every home page load — the 60s tradeoff is acceptable for reviews.
export const revalidate = 60

export default async function Page() {
  const supabase = await createClient()

  const [{ data: reviews }, { data: staff }] = await Promise.all([
    supabase
      .from("reviews")
      .select("*, staff:staff_id(id, name)")
      .eq("status", "published")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("staff").select("*").eq("active", true).order("name"),
  ])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Gallery />
        <Reviews
          initialReviews={(reviews as Review[]) ?? []}
          staff={(staff as Staff[]) ?? []}
        />
        <WhyUs />
        <Services />
        <About />
        <FAQ />
        <Visit />
      </main>
      <Footer />
    </>
  )
}
