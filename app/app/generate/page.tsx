"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getAccountTokens } from "@/services/hashgraph"
import { generateImage } from "@/services/imageGeneration"
import {
  AccountId,
  Hbar,
  LedgerId,
  TokenMintTransaction,
  TokenType,
} from "@hashgraph/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  HashConnect,
  HashConnectConnectionState,
  SessionData,
} from "hashconnect"
import { ExternalLinkIcon, LinkIcon, TriangleAlertIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { siteConfig } from "@/config/site"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const generateFormSchema = z.object({
  prompt: z.string({
    required_error: "Positive prompt is required",
  }),
  negativePrompt: z.string().optional(),
  style: z.string().optional(),
})

const mintFormSchema = z.object({
  nftTokenId: z.string({
    required_error: "NFT Collection is required",
  }),
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
  const [transactionId, setTransactionId] = useState<string>()
  const [image, setImage] = useState<{
    cid: string
    base64: string
    url: string
    description?: string
  }>()
  const generateForm = useForm<z.infer<typeof generateFormSchema>>({
    resolver: zodResolver(generateFormSchema),
  })
  const mintForm = useForm<z.infer<typeof mintFormSchema>>({
    resolver: zodResolver(mintFormSchema),
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

  const { mutateAsync: mint } = useMutation({
    mutationFn: async (tokenId: string) => {
      const signer = hashConnect?.getSigner(
        AccountId.fromString(walletData?.accountIds?.[0]!)
      )

      if (signer) {
        const transaction = await new TokenMintTransaction()
          .setTokenId(tokenId)
          .setMetadata([Buffer.from(`ipfs://${image?.cid}/metadata.json`)])
          .setMaxTransactionFee(new Hbar(20))
          .freezeWithSigner(signer)

        const transactionResponse = await transaction.executeWithSigner(signer)

        return { transactionId: transactionResponse.transactionId.toString() }
      }
    },
  })

  const { data: nftCollections = [] } = useQuery({
    queryKey: ["nftCollections", walletData?.accountIds?.[0]],
    queryFn: () => getAccountTokens(walletData?.accountIds?.[0]!),
    enabled: !!walletData?.accountIds?.[0],
    select: (data) => {
      const nftTokens = data
        .filter((token) => token.type === TokenType.NonFungibleUnique.valueOf())
        .sort((a, b) => a.name.localeCompare(b.name))

      mintForm.setValue("nftTokenId", nftTokens[0]?.id)

      return nftTokens
    },
  })

  async function onGenerate(values: z.infer<typeof generateFormSchema>) {
    await generate({
      prompt: values.prompt,
      negativePrompt: values.negativePrompt,
      style: values.style,
    })
  }

  async function onMint(values: z.infer<typeof mintFormSchema>) {
    const result = await mint(values.nftTokenId)

    if (result) setTransactionId(result?.transactionId)
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
          <>
            <h2 className="flex justify-between items-baseline border-b mb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              Connected Account: {walletData.accountIds?.[0]}
              <Badge variant="outline" className="text-sm mb-4">
                💰 1,000
              </Badge>
            </h2>
          </>
        )}
        <Form {...generateForm}>
          <form
            onSubmit={generateForm.handleSubmit(onGenerate)}
            className="space-y-8"
          >
            <FormField
              control={generateForm.control}
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
              control={generateForm.control}
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
              control={generateForm.control}
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
                          generateForm.setValue("style", undefined)
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
            {!image?.url && (
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
        {image?.url && (
          <Form {...mintForm}>
            <form
              onSubmit={mintForm.handleSubmit(onMint)}
              className="space-y-8 mt-10"
            >
              <>
                <FormField
                  control={mintForm.control}
                  name="nftTokenId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NFT Collection</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select collection to mint to" />
                          </SelectTrigger>
                          <SelectContent>
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
                <Button type="submit" className="w-full text-lg">
                  ✨ Mint NFT from this Artwork
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full text-lg"
                  onClick={() => setImage(undefined)}
                >
                  Cancel
                </Button>
              </>
            </form>
          </Form>
        )}
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
                  src={`data:image/png;base64,${image.base64}`}
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
      <AlertDialog open={!!transactionId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>NFT Minting Successful!</AlertDialogTitle>
            <AlertDialogDescription>
              Congratulations! Your artwork has been successfully minted as an
              NFT. Your files are being uploaded to IPFS. This process may take
              some time, so your artwork might not be immediately visible on the
              block explorer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="transactionId" className="sr-only">
                Transaction
              </Label>
              <Input
                id="transactionId"
                defaultValue={`https://testnet.hashscan.io/transaction/${transactionId}`}
                readOnly
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-3"
              onClick={() =>
                window.open(
                  `https://hashscan.io/testnet/transaction/${transactionId}`,
                  "_blank"
                )
              }
            >
              <span className="sr-only">Open Link</span>
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setTransactionId(undefined)
                setImage(undefined)
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  )
}
