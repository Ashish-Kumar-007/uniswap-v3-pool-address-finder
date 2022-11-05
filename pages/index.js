import Head from 'next/head'
import Image from 'next/image'
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import styles from '../styles/Home.module.css'
import { UniswapV3FactoryAddress, ABI } from '../ABI'


export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("Connect Wallet")
  const [addressA, setAddressA] = useState();
  const [addressB, setAddressB] = useState();
  const [poolAddress, setPoolAddress] = useState();
  const [fee, setFee] = useState();
  const [signer, setSigner] = useState();

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();


  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Main network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    console.log(chainId)
    if (chainId !== 1) {
      window.alert("Change the network to Mainnet");
      throw new Error("Change network to Mainnet");
    }

    if (!needSigner) {
      const signer = web3Provider.getSigner();
      setSigner(signer)
      return signer;
    }
    return web3Provider;
  };

  /*
  connectWallet: Connects the MetaMask wallet
*/
  //Check wallet is connected or not
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      if (walletConnected) {
        const address = (await signer.getAddress())
        setWalletAddress(address)
      }

    } catch (err) {
      console.error(err);
    }
  };

  const getAddressA = (event) => {
    setAddressA(event.target.value.toString());
  }

  const getAddressB = (event) => {
    setAddressB(event.target.value.toString());
  }

  const getFee = (event) => {
    setFee(event.target.value.toString());
  }


  const getPoolAddress = async () => {
    try {
      const provider = await getProviderOrSigner();

      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const factoryContract = new Contract(
        UniswapV3FactoryAddress,
        ABI,
        provider
      );

      const _getPoolAddress = await factoryContract.getPool(addressA, addressB, fee);
      setPoolAddress(_getPoolAddress);


    } catch {

    }
  }





  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    console.log(walletConnected);
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "mainnet",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      // connectWallet();
    }
  }, [walletConnected]);



  return (
    <div className={styles.container}>
      <Head>
        <title>Uniswap Pool Address</title>
        <meta name="description" content="uniswap pool address" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <button className={styles.btn} onClick={() => connectWallet()}>{walletAddress}</button>
      {/* { signer && (
        <h3>wallet connected: {signer._address}</h3>
      )} */}



      <div className={styles.card}>
        <div className="card-body">
          <a href="https://uniswap.org/" target="_blank" rel='noopener noreferrer'>
            <Image src="/uniswap.svg"
            width={200}
            height={200}
            alt="Uniswap"
          /></a>
          <h3 className="card-title mb-4">UNISWAP V3 POOL ADDRESS</h3>
          <form>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder='Token-A Address'
                onChange={getAddressA}
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder='Token-B Address'
                onChange={getAddressB}
              />
            </div>
            <div className="mb-3">
              <select className="form-select" aria-label="Default select example" onChange={getFee}>
                <option defaultValue="">Select any fee</option>
                <option value={500}>500</option>
                <option value={3000}>3000</option>
                <option value={10000}>10000</option>
              </select>
            </div>

            <div className="d-grid col-6 mx-auto">
              <button className={styles.btn} type="button" onClick={getPoolAddress}>GET ADDRESS</button>
            </div>
          </form>
        </div>
      </div>


      {poolAddress && (
        <div className="alert alert-success mt-5" role="alert">
          Pool Address : {poolAddress}
        </div>
      )}

    </div>
  )
}
