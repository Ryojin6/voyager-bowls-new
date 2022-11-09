import { useEffect, useState } from 'react';

import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { JsonRpcSigner, Network, Web3Provider } from '@ethersproject/providers';

import { notify } from '../components/notification';
import { Web3Core } from './web3model';

export default function useWeb3() {
    const [provider, setProvider] = useState<Web3Provider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);
    const [chainIdUsed, setChainIdUsed] = useState<Network | undefined>(
        undefined
    );
    const [connectedAddress, setConnectedAddress] = useState<
        string | undefined
    >(undefined);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const [web3Modal, setWeb3Modal] = useState<Web3Core | null>(null);

    useEffect(() => {
        const providerOptions = {
            coinbasewallet: {
                package: CoinbaseWalletSDK,
                options: {
                    appName: 'Bored Grapes - Bottles',
                    infuraId: process.env.NEXT_PUBLIC_INFURA_KEY,
                },
            },
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: process.env.NEXT_PUBLIC_INFURA_KEY,
                },
            },
        };

        const newWeb3Modal = new Web3Modal({
            cacheProvider: true,
            disableInjectedProvider: false,
            network: 'mainnet',
            providerOptions,
            theme: 'dark',
        });

        newWeb3Modal.clearCachedProvider();

        setWeb3Modal(newWeb3Modal);
    }, []);

    async function addListeners(web3ModalProvider: any) {
        web3ModalProvider.on('accountsChanged', async () => {
            const _provider = new ethers.providers.Web3Provider(
                web3ModalProvider
            );
            await setProvider(_provider);

            const _signer = provider?.getSigner();
            setSigner(_signer);
            const address = await _signer?.getAddress();
            const chainId = await _provider?.getNetwork();
            setChainIdUsed(chainId);
            setConnectedAddress(address);
            setIsConnecting(false);
            setIsConnected(true);
            notify.success(`${address} connected`);
        });

        // Subscribe to chainId change
        web3ModalProvider.on('chainChanged', (chainId: Network) => {
            setChainIdUsed(chainId);
        });
    }

    const connectWallet = async () => {
        setIsConnecting(true);
        let instance;
        try {
            instance = await web3Modal?.connect();
            await addListeners(instance);
        } catch (e) {
            console.error('Could not get a wallet connection', e);
            setIsConnecting(false);
            return;
        }
        const _provider = new ethers.providers.Web3Provider(instance);
        setProvider(_provider);

        const _signer = await _provider?.getSigner();
        setSigner(_signer);
        const address = await _signer?.getAddress();
        const chainId = await _provider?.getNetwork();

        if (address) {
            setChainIdUsed(chainId);
            setConnectedAddress(address);
            setIsConnecting(false);
            setIsConnected(true);
            notify.success(`${address} connected`);
        }
    };

    return {
        provider,
        signer,
        chainIdUsed,
        connectedAddress,
        connectWallet,
        isConnecting,
        isConnected,
    };
}
