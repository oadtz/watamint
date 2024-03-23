"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getAccountTokens } from "@/services/hashgraph"
import { generateImage } from "@/services/imageGeneration"
import { AccountBalanceQuery, LedgerId, TokenType } from "@hashgraph/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  HashConnect,
  HashConnectConnectionState,
  SessionData,
} from "hashconnect"
import { TriangleAlertIcon } from "lucide-react"
import { set, useForm } from "react-hook-form"
import { z } from "zod"

import { siteConfig } from "@/config/site"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import Container from "@/components/container"

const appMetadata = {
  name: siteConfig.name,
  description: siteConfig.description,
  icons: [siteConfig.url + "/favicon.ico"],
  url: siteConfig.url,
}

const formSchema = z.object({
  prompt: z.string({
    required_error: "Positive prompt is required",
  }),
  negativePrompt: z.string().optional(),
  style: z.string().optional(),
  nftTokenId: z.string().optional(),
})

const styles = [
  { label: "Enhance", value: "enhance" },
  { label: "Anime", value: "anime" },
  { label: "Photographic", value: "photographic" },
  { label: "Digital Art", value: "digital-art" },
  { label: "Comic Book", value: "comic-book" },
  { label: "Fantasy Art", value: "fantasy-art" },
  { label: "Line Art", value: "line-art" },
  { label: "Analog Film", value: "analog-film" },
  { label: "Neon Punk", value: "neon-punk" },
  { label: "Isomatric", value: "isometric" },
  { label: "Low Poly", value: "low-poly" },
  { label: "Origami", value: "origami" },
  { label: "Modeling Compound", value: "modeling-compound" },
  { label: "Cinematic", value: "cinematic" },
  { label: "3D Model", value: "3d-model" },
  { label: "Pixel Art", value: "pixel-art" },
  { label: "Tile Texture", value: "tile-texture" },
]

export default function GeneratePage() {
  const [hashConnect, setHashConnect] = useState<HashConnect>()
  const [walletData, setWalletData] = useState<SessionData>()
  const [connectionState, setConnectionState] =
    useState<HashConnectConnectionState>()
  const [nftCollections, setNftCollections] = useState<any[]>([])
  const [image, setImage] = useState<{
    url: string
    description?: string
  }>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const {
    mutateAsync: generate,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: generateImage,
    onSuccess: (data) => {
      setImage(data)
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await generate({
      prompt: values.prompt,
      negativePrompt: values.negativePrompt,
      style: values.style,
    })
  }

  async function initWalletConnect() {
    const connection = new HashConnect(
      process.env.NODE_ENV === "production"
        ? LedgerId.MAINNET
        : LedgerId.TESTNET,
      siteConfig.services.walletConnectProjectId!,
      appMetadata,
      true
    )

    connection.pairingEvent.on((newPairing) => {
      setWalletData(newPairing)

      if (newPairing.accountIds) {
        fetchNftCollections(newPairing.accountIds[0])
      }
    })

    connection.connectionStatusChangeEvent.on((state) => {
      setConnectionState(state)
    })

    connection.disconnectionEvent.on((data) => {
      setWalletData(undefined)
    })

    await connection.init()

    setHashConnect(connection)
  }

  async function fetchNftCollections(accountId: string) {
    const tokens = await getAccountTokens(accountId)

    setNftCollections(
      tokens
        .filter((token) => token.type === TokenType.NonFungibleUnique.valueOf())
        .sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  async function createNftToken() {
    form.setValue("nftTokenId", "")
  }

  useEffect(() => {
    initWalletConnect()
  }, [])

  if (!walletData) {
    return (
      <Container className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">
          Please connect your Hedera account to continue.
        </p>
        <Button onClick={() => hashConnect?.openPairingModal()}>
          Connect Hedera Account
        </Button>
      </Container>
    )
  }

  return (
    <Container className="flex px-4 py-6 sm:p-8 gap-4">
      <div className="w-1/2 min-w-sm">
        {walletData && (
          <Badge variant="outline" className="text-sm mb-4">
            Connected Hedera Account: {walletData.accountIds?.[0]}
          </Badge>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="prompt"
              disabled={!!image}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>✅ Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe elements, themes, or emotions you want your artwork to capture."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="negativePrompt"
              disabled={!!image}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>❌ Negative Prompt (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mention any elements, themes, or aspects you do not want in your artwork."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="style"
              disabled={!!image}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={(value) => {
                        if (value === "none") {
                          form.setValue("style", undefined)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {styles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {image?.url ? (
              <>
                <FormField
                  control={form.control}
                  name="nftTokenId"
                  disabled={!image}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NFT Collection</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={(value) => {
                            if (value === "new") {
                              createNftToken()
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select collection to mint to" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">
                              New collection...
                            </SelectItem>
                            {nftCollections.map((nftToken) => (
                              <SelectItem key={nftToken.id} value={nftToken.id}>
                                {nftToken.name} ({nftToken.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" className="w-full text-lg">
                  ✨ Mint NFT from this Artwork
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-lg"
                  onClick={() => setImage(undefined)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="submit"
                className="w-full text-lg"
                disabled={isPending}
              >
                🪄 Generate
              </Button>
            )}
          </form>
        </Form>
      </div>
      <Card className="w-1/2">
        <CardContent className="p-0">
          <div className="mx-auto">
            <AspectRatio
              ratio={1 / 1}
              className="flex flex-col gap-4 bg-muted justify-center items-center px-10 py-14"
            >
              {image ? (
                <Image
                  src={image.url}
                  alt={image.description!}
                  width={1024}
                  height={1024}
                  className="w-full h-full object-cover rounded-none"
                />
              ) : isPending ? (
                <Skeleton className="w-full h-full bg-gray-800 rounded-none flex flex-col justify-center items-center p-10 gap-5">
                  <p className="font-bold">Creating Magic!</p>
                  <p>
                    Your unique AI-generated artwork is on its way. This may
                    take a few moments. Thank you for your patience.
                  </p>
                </Skeleton>
              ) : isError ? (
                <Alert variant="destructive">
                  <TriangleAlertIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error?.message}</AlertDescription>
                </Alert>
              ) : (
                <p className="text-xs">
                  Your generated art will be displayed here.
                </p>
              )}
            </AspectRatio>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
