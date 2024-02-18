import {ethers} from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js"
import {abi, contractAddress} from "./constants.js"

// console.log({abi});

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance

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
    console.  log('Connected')
  }
  else {
    connectButton.innerHTML = "Please install Metamask"
    console.log('no ethereum wallet found')
  }
}

const getProviderAndSigner = async () => {
  // get a connection to the blockchain
  const provider = new ethers.BrowserProvider(getEthWallet())
  const signer = await provider.getSigner()
  return {provider, signer}
}

async function getBalance() {
  if(isEthWalletInstalled()) {
    const {provider} = await getProviderAndSigner();
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.formatEther(balance))
  }
}

// fund 
// async function fund(ethAmount) {
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}`)
  if (isEthWalletInstalled()) {
    const {signer, provider} = await  getProviderAndSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund(
        {value: ethers.parseEther(ethAmount)}
      )
      await listenForTransactionMine(transactionResponse, provider)
      console.log('Transaction mine completed')
    }
    catch(error) {
      console.log({error})
    }
  }
}

const listenForTransactionMine = (transactionResponse, provider) => {
  console.log(`Mining ${transactionResponse.hash}...`)
  return new Promise(
    (resolve) => {
      provider.once(
        transactionResponse.hash, 
        async (transactionReceipt) => {
          // console.log({transactionReceipt})
          const confirmations = await transactionReceipt.confirmations()
          console.log(
            `Completed with ${confirmations} confirmations`
          )
          resolve()
        }
      )
    }
  )
}

// withdraw