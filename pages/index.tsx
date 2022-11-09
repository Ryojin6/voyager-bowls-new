import type { NextPage } from 'next';
import { ethers } from 'ethers';
import axios from 'axios';
import { useEffect, useState } from 'react';

import Marquee from 'react-fast-marquee';
import useWeb3 from '../lib/web3';
import abi from '../shared/contract-abi.json';
import { notify } from '../components/notification';

const CONTRACT_ADDRESS = '0x241800E852F1c06a16f2341B5519d755967e8811';

// eslint-disable-next-line no-shadow
enum SaleTypeENUM {
    WL_SALE = 1,
}

const MAX_QTY = 1;
const PRICE = 0;

const MINUTE_MS = 2000;

const Home: NextPage = () => {
    const { connectedAddress, connectWallet, signer, isConnected } = useWeb3();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tokenId, setTokenId] = useState<number | null>(null);
    const [totalSupply, setTotalSupply] = useState<number>(0);
    const [maxSupply, setMaxSupply] = useState<number>(0);

    const nftContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    async function getTotalSupply() {
        try {
            const total = await nftContract.totalSupply();
            setTotalSupply(total.toNumber());
        } catch (e) {
            console.log(e);
        }
    }

    async function getMaxSupply() {
        try {
            const _maxSupply = await nftContract.maxSupply();
            console.log(_maxSupply);
            setMaxSupply(_maxSupply.toNumber());
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (isConnected) {
                getTotalSupply();
            }
        }, MINUTE_MS);

        if (isConnected) {
            getMaxSupply();
        }

        return () => clearInterval(interval);
    }, [isConnected]);

    async function mint() {
        try {
            setIsLoading(true);

            const saleType: [boolean | number] =
                await nftContract.getSaleConfig(SaleTypeENUM.WL_SALE);

            if (saleType[0] === false) {
                notify.error('Not on WL!');
                setIsLoading(false);
                return;
            }

            const results = await axios.post('/api/get-signature', {
                saleId: SaleTypeENUM.WL_SALE,
                address: connectedAddress,
            });

            if (results.status >= 400) {
                notify.error('Not on WL');
                setIsLoading(false);
                return;
            }

            const res: { nonce: number; saleId: number; signature: string } =
                results.data;

            const hasMinted = await nftContract.getAllowlistNonceStatus(
                SaleTypeENUM.WL_SALE,
                res.nonce
            );

            if (hasMinted) {
                notify.error('Already minted!');
                setIsLoading(false);
                return;
            }

            const tokenURI = await nftContract.allowlistMint(
                SaleTypeENUM.WL_SALE,
                MAX_QTY,
                res.nonce,
                res.signature,
                { value: String(PRICE) }
            );
            const tx = await tokenURI.wait();

            const event = tx.events[0];
            const value = event.args[2];
            setTokenId(value.toNumber());
            notify.success('Successfully minted');
            setIsLoading(false);
        } catch (e) {
            notify.error('Error minting');
            setIsLoading(false);
        }
    }

    return (
        <div
            className={
                'w-full h-screen relative flex flex-col gap-5 justify-center bg-black items-center '
            }
        >
            <div className=" max-w-6xl mx-auto rounded-2xl  shadow-white z-50 relative">
                <div className=" w-full  z-10  bg-black   top-6 flex space-x-4 justify-end items-center  text-white right p-4">
                    {!connectedAddress && (
                        <button
                            type={'button'}
                            onClick={() => connectWallet()}
                            className="px-6 effect-underline effect-shine bg-white text-black py-3 font-bold rounded-2xl"
                        >
                            Connect Wallet
                        </button>
                    )}

                    {connectedAddress && (
                        <div className="flex font-bold items-center flex-col ">
                            <span className="pr-4 text-black font-bold">
                                Wallet Connected:
                            </span>
                            <h2 className="">{connectedAddress}</h2>
                        </div>
                    )}
                </div>
                <div className="relative">
                    {!tokenId && (
                        <button
                            type={'button'}
                            onClick={() => mint()}
                            className="max-w-lg top-0 px-8 py-2 -mt-2 md:-ml-10 hover:shadow-xl absolute left-1/2 -translate-x-1/2 hover:scale-105 duration-300 ease-in-auto"
                        >
                            <img
                                src="/hover.png"
                                alt=""
                                className="w-full rounded-3xl"
                            />
                        </button>
                    )}
                    <img src="/bg.jpg" alt="" className="w-full rounded-3xl" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-center absolute -bottom-14  text-white font-bold left-1/2 -translate-x-1/2 ">
                    {tokenId && <h1>{tokenId}</h1>}
                    <span>{isLoading}</span>
                    <span>{totalSupply}</span>
                    <span>/</span>
                    <span>{maxSupply}</span>
                </div>
            </div>
        </div>
    );
};

export default Home;
