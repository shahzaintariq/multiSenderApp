import { React, useState, useEffect } from 'react';
import logo from './logo.svg';
import tokenAbi from './token.json';
import './App.css';
import { ethers, Contract } from 'ethers';
import BigNumber from 'bignumber.js';
import getBlockchain from './contract.js';

export default function App() {
  const [provider, setProvider] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();

  const [contractInfo, setContractInfo] = useState({
    contractAddress: '0x632267bEFa85c229468995BDE3436a21A3146dAF',
    tokenAddress: '',
    decimal: 18,
    recv_list: [
      '0x33530bb5d7b912e01eb7cc1a27d69dd078cee03a',
      '0xd0cda47a263859316febc1eb29a65517ab22926a',
    ],
    amount: ['10', '50'],
  });

  const [contract, setContract] = useState(undefined);
  const [tokenContract, setTokenContract] = useState(undefined);
  const [signer, setSigner] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const { contract, networkId, account, provider, signer } =
        await getBlockchain('0x632267bEFa85c229468995BDE3436a21A3146dAF');

      setSigner(signer);
      setProvider(provider);
      setContract(contract);
      setAccount(account);
      setNetwork(networkId);
    };
    init();
  }, []);

  const getTokenContract = async () => {
    const { tokenAddress } = contractInfo;

    const tokenContracts = new Contract(tokenAddress, tokenAbi, signer);

    setTokenContract(tokenContracts);
  };

  if (provider) {
    provider.provider.on('accountsChanged', (accounts) => {
      setAccount(accounts);
    });
    provider.provider.on('chainChanged', (r) => {
      setNetwork(new BigNumber(r).toFixed());
    });
  }

  const getFees = async () => {
    if (
      ethers.utils.getAddress(account[0]) ===
      ethers.utils.getAddress('0xB883522944A7c7DCe56774B875d6573F39758e34')
    ) {
      return 0;
    } else {
      return ethers.utils.parseUnits('0.05', 'ether').toHexString();
    }
  };

  const execute2 = async () => {
    const { contractAddress, tokenAddress, recv_list, amount, decimal } =
      contractInfo;

    let allowance = await tokenContract.allowance(account[0], contractAddress);
    allowance = new BigNumber(allowance._hex).toFixed();

    if (allowance == 0) {
      let amount = 1000000000 * 10 ** 18;
      amount = new BigNumber(amount).toFixed();
      const tx = await tokenContract.approve(contractAddress, amount);
      tx.wait();
    }

    let tokenAmount = amount.map((r) => (r * 10 ** decimal).toString());

    const tx = await contract.populateTransaction.multisendToken(
      tokenAddress,
      recv_list,
      tokenAmount
    );
    const fees = await getFees();

    signer.sendTransaction({
      value: fees,
      ...tx,
    });
  };

  let browserExtensionStatus;
  if (network == 97 || (56 && provider)) {
    browserExtensionStatus = `${provider.connection.url} Detected. `;
  } else {
    browserExtensionStatus = 'No Browser Extension detected';
  }

  let accountInfo = null;
  if (account) {
    accountInfo = (
      <div>
        Current account:{' '}
        <small>
          <code>{account[0]}</code>
        </small>
        <br />
      </div>
    );
  }

  let networkInfo = null;
  if (network == 97) {
    networkInfo = <p>Network: BSC Testnet</p>;
  } else if (network == 56) {
    networkInfo = <p>Network: BSC Mainnet</p>;
  } else {
    networkInfo = (
      <p>
        Not connected to BSC Mainnet (
        <a
          target="_black"
          href="https://docs.binance.org/smart-chain/wallet/metamask.html"
        >
          Use BSC with Metamask
        </a>
        )
      </p>
    );
  }

  let contractForm2 = null;
  if (network == 56 || network == 97) {
    contractForm2 = (
      <div style={{ margin: '20px 0' }}>
        <h2>SendAirdropInBulk</h2>
        Token address:
        <input
          style={{ width: '300px' }}
          value={contractInfo.tokenAddress}
          onChange={(e) =>
            setContractInfo({ ...contractInfo, tokenAddress: e.target.value })
          }
          placeholder="Token Address"
        />
        <br />
        Decimals:
        <input
          style={{ width: '300px' }}
          value={contractInfo.decimal}
          onChange={(e) =>
            setContractInfo({ ...contractInfo, decimal: e.target.value })
          }
          placeholder="decimals"
        />
        <br />
        <button onClick={() => getTokenContract()}>Add Token Address</button>
        <br />
        <br />
        Receiver address list:
        <textarea
          style={{ width: '600px' }}
          value={contractInfo.recv_list}
          onChange={(e) =>
            setContractInfo({ ...contractInfo, recv_list: e.target.value })
          }
          placeholder="Receiver"
        />
        <br />
        Amount:
        <textarea
          style={{ width: '600px' }}
          value={contractInfo.amount}
          onChange={(e) =>
            setContractInfo({ ...contractInfo, amount: e.target.value })
          }
          placeholder="Amount"
        />
        <br />
        <button onClick={() => execute2()}>
          Approve Token and send transaction
        </button>
      </div>
    );
  }

  let pageHeader = null;
  pageHeader = (
    <div className="page-header">
      <h2 align="center" id="timeline">
        BEP-20 Token AirDrop
      </h2>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{browserExtensionStatus}</p>
        {pageHeader}
        {accountInfo}
        {networkInfo}
        {contractForm2}
      </header>
    </div>
  );
}
