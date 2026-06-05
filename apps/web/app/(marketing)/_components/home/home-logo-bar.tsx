import Image from "next/image"
import { HOME_COPY } from "../../_lib/home-copy"

export function HomeLogoBar() {
  const { logoBar } = HOME_COPY

  return (
    <section className="border-b border-border/60 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {logoBar.label}
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logoBar.platforms.map((platform) => (
            <li
              key={platform.name}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <Image
                src={platform.icon}
                alt=""
                width={24}
                height={24}
                className="size-6 opacity-80"
              />
              <span>{platform.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
