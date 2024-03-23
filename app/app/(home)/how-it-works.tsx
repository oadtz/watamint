import Container from "@/components/container"

const steps = [
  {
    title: "Enter Your Art Prompt",
    description:
      "Kickstart your creativity by inputting a prompt. Our AI will bring your vision to life with astonishing art",
  },
  {
    title: "Preview Your Art",
    description:
      "Behold the artwork your imagination conjured, crafted by AI. Refine it until it perfectly captures your initial vision",
  },
  {
    title: "Mint as NFT on Hedera Hashgraph",
    description:
      "Mint your artwork as an NFT effortlessly on the Hedera Hashgraph network, ensuring speed, efficiency, and a lighter ecological footprint",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <Container className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your Artistic Journey in Three Simple Steps:
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-2xl sm:mt-10 lg:mt-12 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-indigo-500 dark:text-indigo-400">
                  {/* <feature.icon
                    className="h-5 w-5 flex-none text-indigo-600"
                    aria-hidden="true"
                  /> */}
                  {step.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                  <p className="flex-auto">{step.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
