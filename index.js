import {ethers} from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js"
import {abi, contractAddress} from "./constants.js"

// console.log({abi});

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
connectButton.onclick = connect
fundButton.onclick = fund

const getEthWallet = () => window.ethereum

const isEthWalletInstalled = () => {
  return typeof getEthWallet() !== "undefined"
}

async function connect() {
  if(isEthWalletInstalled()) {
    if (getEthWallet().isMetaMask) {
      console.log('MetaMask, installed -- connecting')
    }
    else {
      console.log('Ethereum wallet installed -- connecting')
    }
    connectButton.innerHTML = "Connecting..."
    try {
      await getEthWallet().request(
        {method: 'eth_requestAccounts'}
      )}
    catch (e) {
      console.log('caught error', {e})
    }
    connectButton.innerHTML = "Connected"
    console.log('Connected')
  }
  else {
    connectButton.innerHTML = "Please install Metamask"
    console.log('no ethereum wallet found')
  }
}

// fund 
// async function fund(ethAmount) {
async function fund() {
  const ethAmount = '7' // temporary until we pass the value as an argument or...
  console.log(`Funding with ${ethAmount}`)
  if(isEthWalletInstalled()) {
    // get a connection to the blockchain
    const provider = new ethers.BrowserProvider(getEthWallet())

    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    /* const transactionRespnse = */ await contract.fund(
      {value: ethers.parseEther(ethAmount)}
    )
  }
}

// withdraw