import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="w-full flex flex-col justify-center items-center min-h-[500px] gap-6">
      <p className="text-4xl font-semibold">404</p>
      <h1 className="mt-2 text-2xl font-medium tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 leading-7">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Go back home
      </Link>
    </div>
  )
}
