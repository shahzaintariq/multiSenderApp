import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import abi from './coin.json';

const getBlockchain = (contractAddress) =>
  new Promise( async (resolve, reject) => {
    let provider = await detectEthereumProvider();
    if(provider) {
      let account = await provider.request({ method: 'eth_requestAccounts' });
      const networkId = await provider.request({ method: 'net_version' })
      provider = new ethers.providers.Web3Provider(provider);
      const signer = provider.getSigner();
      const contract = new Contract(
        contractAddress,
        abi,
        signer
      );

      resolve({contract, networkId, account,provider,signer});
      return;
    }
    reject('Install Metamask');
  });

export default getBlockchain;