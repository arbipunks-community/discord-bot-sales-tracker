const { ethers, utils } = require("ethers");
const { MessageEmbed, WebhookClient } = require('discord.js');

const ARBITRUM_DEFAULT_RPC = "https://arb1.arbitrum.io/rpc"
const SMOLPUDDLE_ADDRESS  = "0xa39eAd9429AB35bFA7aA85786bcddA500a78155D"
const ARBIPUNK_CONTRACT_ADDRESS  = "0xa39eAd9429AB35bFA7aA85786bcddA500a78155D"

let sells=[];

async function run(){
  const provider = new ethers.providers.JsonRpcProvider(ARBITRUM_DEFAULT_RPC);


  filterP2 = {
    address: SMOLPUDDLE_ADDRESS,
    topics: [
      utils.id("OrderExecutedP2(uint8,address,uint256)"),
    ]
  }
  filterP3 = {
    address: SMOLPUDDLE_ADRESS,
    topics: [
      utils.id("OrderExecutedP3(address,uint256,address[],uint256[])"),
    ]
  }

  provider.on(filterP2, resp => {
      console.log('P2 : ',resp);
      if ( ! sells[resp.transactionHash]) sells[resp.transactionHash] = {};
      sells[resp.transactionHash].nftContract = resp.topics[2];
      sells[resp.transactionHash].nftId = parseInt(resp.topics[3]);

  })
  provider.on(filterP3, resp => {
      console.log('P3 : ',resp);
      if ( ! sells[resp.transactionHash]) sells[resp.transactionHash] = {};
      sells[resp.transactionHash].price = parseInt(resp.topics[2]   ) / 1e18;

      setTimeout( () => {notify(resp.transactionHash)},500);
  })



}



function notify(transactionHash){

  console.log('sells before loop',sells)

  let sell = sells[transactionHash];

  console.log('sell', sell)


  if ( sell.nftContract != ARBIPUNK_CONTRACT_ADDRESS)
    return;

  collection =  'ArbiPunk';

  console.log( ` ${collection} #${sell.nftId} sold for ${sell.price} ETH`)

  delete sells[transactionHash];

  console.log('sells after remove ',sells)


  const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

  const embed = new MessageEmbed()
    .setTitle(` ${collection} #${sell.nftId} sold for ${sell.price} ETH`)
    .setColor('#0099ff')
    .setImage(`https://api.arbipunks.com/images/${sell.nftId}.svg`)
    .setURL(`https://arbiscan.io/tx/${transactionHash}`)


  webhookClient.send({
    content: `https://rarity.tools/cryptopunks/view/${sell.nftId}`,
    username: 'New punk sells',
    avatarURL: `https://api.arbipunks.com/images/${sell.nftId}.svg`,
    embeds: [embed],
  });

}

run();



