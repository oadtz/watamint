export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "VisMint.ai",
  description:
    "Unlock the power of AI to transform your creative ideas into stunning digital art, effortlessly minted as NFTs on the Hedera Hashgraph network. VisMint.ai is where artists and innovators come together to craft, share, and monetize their digital masterpieces. Explore a new era of digital art creation and ownership with our intuitive platform.",
  url: "https://vismint.ai",
  services: {
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    stabilityApiKey: process.env.STABILITY_API_KEY,
    nftStorageApiKey: process.env.NFT_STORAGE_API_KEY,
  },
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Generate NFT Art",
      href: "/generate",
    },
  ],
  links: {
    twitter: "https://twitter.com/VisMintAI",
    github: "https://github.com/VisMintAI/ui",
    whitepaper: "https://docs.vismint.ai",
  },
}
