"use server"

import { NFTStorage } from "nft.storage"

import { siteConfig } from "@/config/site"

import { api } from "./api"

export async function generateImage(params: {
  prompt: string
  negativePrompt?: string
  style?: string
}) {
  const { prompt, negativePrompt, style } = params
  const prompts = [
    {
      text: prompt,
      weight: 1,
    },
    {
      text: "nsfw",
      weight: -2,
    },
  ]

  if (negativePrompt) {
    prompts.push({
      text: negativePrompt,
      weight: -1,
    })
  }

  try {
    const data = await api(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        bearerHeader: `Bearer ${siteConfig.services.stabilityApiKey}`,
        body: JSON.stringify({
          steps: 40,
          width: 1024,
          height: 1024,
          seed: 0,
          cfg_scale: 5,
          samples: 1,
          style_preset: style,
          text_prompts: prompts,
        }),
      }
    )
    const { base64, seed } = data.artifacts.pop()

    const nftstorage = new NFTStorage({
      token: process.env.NFT_STORAGE_API_KEY!,
    })

    const file = new File(
      [Buffer.from(base64, "base64")],
      `image_${seed}.png`,
      {
        type: "image/png",
      }
    )

    const nft = await nftstorage.store({
      image: file,
      name: `image_${seed}.png`,
      description: prompt,
      properties: {
        prompt,
        negativePrompt,
        style,
      },
    })

    return {
      cid: nft.ipnft,
      url: `https://nftstorage.link/ipfs/${nft.ipnft}/image_${seed}.png`,
      base64,
      name: `image_${seed}.png`,
      description: `Prompt: ${prompt}\n\nNegative Prompt: ${negativePrompt}\n\nStyle: ${style}`,
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}
