import Link from "next/link"

import { siteConfig } from "@/config/site"

import Container from "./container"
import { Icons } from "./icons"
import { buttonVariants } from "./ui/button"

export function SiteFooter() {
  return (
    <footer>
      <Container>
        <div className="mx-auto px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.gitHub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                })}
              >
                <Icons.twitter className="h-5 w-5 fill-current" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center leading-5 text-sm">
              &copy; 2024 CivicMinter. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
