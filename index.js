async function connect() {
  if(typeof(window.ethereum) !== undefined) {
    const ethereum = window.ethereum
    if (ethereum.isMetaMask) {
      console.log('MetaMask, installed -- connecting')
    }
    else {
      console.log('Ethereum wallet installed -- connecting')
    }
    document.getElementById("connectButton").innerHTML = "Connecting..."
    await window.ethereum.request(
      {method: 'eth_requestAccounts'}
    )
    document.getElementById("connectButton").innerHTML = "Connected"
    console.log('Connected')
  }
  else {
    document.getElementById("connectButton").innerHTML = "Please install Metamask"
    console.log('no ethereum wallet found')
  }
}
