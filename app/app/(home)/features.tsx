import { CheckIcon } from "lucide-react"

import Container from "@/components/container"

const features = [
  {
    name: "Diverse Art Styles",
    description:
      "Our AI can interpret your prompts into a variety of art styles, making each creation uniquely yours.",
  },
  {
    name: "Quick and Efficient",
    description:
      "Experience rapid art generation and NFT minting, powered by the advanced capabilities of the Hedera Hashgraph network.",
  },
  {
    name: "Eco-Conscious Minting",
    description:
      "Enjoy the added benefit of a reduced ecological footprint, thanks to the carbon-efficient nature of the Hedera network.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-gray-100 dark:bg-gray-800">
      <Container className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Why CivicMinter.ai?
            </h1>
            <p className="mt-6 text-base leading-7">
              Dive into the Advantages:
            </p>
          </div>
          <dl className="col-span-2 grid grid-cols-1 gap-x-8 gap-y-10 text-base leading-7 sm:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="font-semibold">
                  <CheckIcon
                    className="absolute left-0 top-1 h-5 w-5 text-indigo-500"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-2">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
