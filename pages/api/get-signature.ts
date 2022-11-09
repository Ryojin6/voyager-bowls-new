import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

type Data = {
    signature?: string;
    saleId?: number;
    nonce?: number;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const { address, saleId } = req.body;

        if (!address) {
            res.status(400).json({ error: 'Missing address' });
        }

        if (!saleId) {
            res.status(400).json({ error: 'Missing saleId' });
        }

        const allowList = await import('../../shared/1.json');
        const nonce = allowList.allowlist
            .map(el => el.toLowerCase())
            .indexOf(address.toLowerCase());

        const privateKey = process.env.NEXT_PUBLIC_WALLET_PR_KEY ?? '';

        const provider = ethers.getDefaultProvider();
        const signer = new ethers.Wallet(privateKey, provider);

        if (nonce !== -1) {
            const dataHash = ethers.utils.solidityKeccak256(
                ['uint256', 'uint256', 'address'],
                [Number(saleId), nonce, address]
            );
            const signature = await signer.signMessage(
                ethers.utils.arrayify(dataHash)
            );
            res.status(200).send({ saleId, nonce, signature });
        } else {
            res.status(400).json({ error: 'Error getting signature' });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
