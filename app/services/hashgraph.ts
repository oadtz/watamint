"use server"

import {
  AccountBalanceQuery,
  Client,
  TokenInfoQuery,
  TokenNftInfoQuery,
} from "@hashgraph/sdk"
import TokenBalanceMap from "@hashgraph/sdk/lib/account/TokenBalanceMap"

import { siteConfig } from "@/config/site"

const client = Client.forTestnet()
client.setOperator(
  siteConfig.services.hederaAccountId!,
  siteConfig.services.hederaPrivateKey!
)

export async function getAccountTokens(accountId: string) {
  const query = new AccountBalanceQuery().setAccountId(accountId)

  const tokenBalance = await query.execute(client)

  if (!tokenBalance.tokens) return []

  const tokens = []
  const tokenIds = Object.keys(tokenBalance.tokens?.toJSON())

  for (const tokenId of tokenIds) {
    const token = await getTokenInfo(tokenId)
    tokens.push({
      id: tokenId,
      name: token.name,
      symbol: token.symbol,
      type: token.tokenType?.valueOf(),
    })
  }

  return tokens
}

export async function getTokenInfo(tokenId: string) {
  const tokenInfo = await new TokenInfoQuery()
    .setTokenId(tokenId)
    .execute(client)

  return tokenInfo
}
