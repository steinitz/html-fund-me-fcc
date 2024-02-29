import {ethers} from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js"
import {abi, contractAddress} from "./constants.js"

// console.log({abi});

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
fundButton.onclick = fund
withdrawButton.onclick = withdraw
balanceButton.onclick = getBalance

const getEthWallet = () => {
  const result = window.ethereum
  if (result) {
    return result
  }
  else {
    connectButton.innerHTML = "Please install Metamask"
    console.log('no ethereum wallet found')
  }
}

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
  console.log('getBalance running')
  if(isEthWalletInstalled()) {
    console.log('getting Balance')
    const {provider} = await getProviderAndSigner();
    const balance = await provider.getBalance(contractAddress)
    console.log(ethers.formatEther(balance))
  }
  else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

// fund 
// async function fund(ethAmount) {
async function fund() {
  const ethAmountElement = document.getElementById("ethAmount")
  const ethAmount = ethAmountElement.value || ethAmountElement.getAttribute("placeholder")
  console.log(`Funding with ${ethAmount}`)
  if (isEthWalletInstalled()) {
    const {signer, provider} = await getProviderAndSigner()
    const contract = new  ethers.Contract(contractAddress, abi, signer)
    console.log({contract})
    try {
      const transactionResponse = await contract.fund(
        {value: ethers.parseEther(ethAmount)}
      )
      await listenForTransactionMine(transactionResponse, provider)
    }
    catch(error) {
      console.log({error})
    }
  }
  else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (isEthWalletInstalled()) {
    const {signer, provider} = await getProviderAndSigner()
    await provider.send('eth_requestAccounts', []) // Patrick did this.  Why?
    const contract = new ethers.Contract(contractAddress, abi, signer)
    console.log({contract})
    try {
      // const transactionResponse = await contract.withdraw()
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
    }
    catch(error) {
      console.error({error})
    }
  }
  else {
    withdrawButton.innerHTML = "Please install MetaMask"
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

