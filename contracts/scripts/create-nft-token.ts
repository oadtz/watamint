import {
  AccountBalanceQuery,
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  TokenCreateTransaction,
  TokenInfoQuery,
  TokenNftInfoQuery,
  TokenSupplyType,
  TokenType,
} from "@hashgraph/sdk";

require("dotenv").config();

const accountId = AccountId.fromString(process.env.TREASURY_ACCOUNT_ID!);
const privateKey = process.env.TREASURY_PRIVATE_KEY!;

async function createNFTToken() {
  const client =
    process.env.NODE_ENV === "production"
      ? Client.forMainnet()
      : Client.forTestnet();

  client.setOperator(accountId, privateKey);

  // Check if the token is already created
  const query = new AccountBalanceQuery().setAccountId(accountId);

  const tokenBalance = await query.execute(client);

  if (tokenBalance.tokens) {
    for (const [tokenId] of tokenBalance.tokens) {
      const tokenInfo = await new TokenInfoQuery()
        .setTokenId(tokenId)
        .execute(client);

      if (tokenInfo.symbol === process.env.NFT_SYMBOL) {
        console.log(`Token ${process.env.NFT_SYMBOL} id: ${tokenId}`);
        process.exit(0);
      }
    }
  }

  // Create the token
  const transaction = await new TokenCreateTransaction()
    .setTokenName(process.env.NFT_NAME!)
    .setTokenSymbol(process.env.NFT_SYMBOL!)
    .setTreasuryAccountId(accountId)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setSupplyKey(PrivateKey.fromStringED25519(privateKey))
    .setMaxTransactionFee(new Hbar(30))
    .setSupplyType(TokenSupplyType.Infinite)
    .freezeWith(client);

  const nftCreateTxSign = await transaction.sign(
    PrivateKey.fromStringED25519(privateKey)
  );
  const nftCreateSubmit = await nftCreateTxSign.execute(client);

  const nftCreateRx = await nftCreateSubmit.getReceipt(client);

  const tokenId = nftCreateRx.tokenId;

  console.log(`Token ${process.env.NFT_SYMBOL} id: ${tokenId}`);

  process.exit(0);
}

(async () => await createNFTToken())();
