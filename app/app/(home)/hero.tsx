import Link from "next/link"
import { clsx } from "clsx"

import { buttonVariants } from "@/components/ui/button"
import Container from "@/components/container"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-700 dark:to-blue-700">
      <Container className="grid items-center gap-6 pb-8 pt-6 md:py-10 ">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Bring Your Imagination to Life with AI-Generated NFT Art
          </h1>
          <p className="max-w-[700px] text-lg text-muted-background">
            Turn your creative prompts into extraordinary digital masterpieces,
            effortlessly minted as NFTs on the eco-friendly Hedera Hashgraph
            network.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href={"/generate"}
            className={clsx(
              buttonVariants(),
              "text-base bg-yellow-400 text-gray-900 hover:bg-yellow-500 dark:bg-yellow-600 dark:text-gray-900 dark:hover:bg-yellow-700"
            )}
          >
            Start Creating Now
          </Link>
        </div>
      </Container>
    </section>
  )
}
