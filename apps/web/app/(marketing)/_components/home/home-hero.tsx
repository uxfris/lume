"use client" // Required for GSAP hooks

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { routes } from "@/lib/routes"
import { HOME_COPY } from "../../_lib/home-copy"
import { HomeProductPreview } from "./home-product-preview"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export function HomeHero() {
  const { hero } = HOME_COPY
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.from(".hero-reveal", {
        y: 30,
        opacity: 0,
        filter: "blur(12px)",
        duration: 1.5,
        stagger: 0.15,
        ease: "power3.out",
      })
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden border-b border-border/60"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.44_0.04_170/0.18),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Add hero-reveal to each animated element */}
          <p className="hero-reveal text-xs font-medium tracking-widest text-primary uppercase">
            {hero.eyebrow}
          </p>
          <h1 className="hero-reveal mt-4 text-3xl font-semibold tracking-tight text-balance md:text-5xl md:leading-[1.1]">
            {hero.headline}
          </h1>
          <p className="hero-reveal mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
            {hero.subhead}
          </p>
          <div className="hero-reveal mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={routes.authentication}>{hero.ctaPrimary}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={routes.marketing.howItWorks}>
                {hero.ctaSecondary}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="hero-reveal mt-4 text-xs text-muted-foreground">
            {hero.reassurance}
          </p>
        </div>

        {/* Added wrapper for the product preview to animate it as well */}
        <div className="hero-reveal mt-12 md:mt-16">
          <HomeProductPreview variant="hero" />
        </div>
      </div>
    </section>
  )
}
