import { bridgeAbi } from "@/artifacts/eth/bridge/bridge";
import { parseEther } from "ethers/lib/utils.js";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Address } from "ton-core";
import { getContract } from "viem";
import { getTransactionReceipt } from "viem/actions";
import { useAccount, useWalletClient } from "wagmi";

export const useBurnwTonTx = (
  setEthHash: Dispatch<SetStateAction<string | undefined>>
) => {
  const { data: walletClient } = useWalletClient();
  const bridgeContract = useMemo(() => {
    if (!walletClient) {
      return undefined;
    }

    return getContract({
      address: process.env.NEXT_PUBLIC_ETH_BRIDGE_ADDR as `0x${string}`,
      abi: bridgeAbi,
      client: walletClient,
    });
  }, [walletClient]);

  const myEvmAccount = useAccount();

  const onFormSubmit = async (tonAddr: string, ethsToWrap: string) => {
    if (!bridgeContract) {
      return;
    }
    const addrHash = Address.parse(tonAddr).hash.toString("hex");
    const txRes = await bridgeContract.write.swapToken([
      myEvmAccount.address,
      parseEther(ethsToWrap),
      `0x${addrHash}`,
      process.env.NEXT_PUBLIC_ETH_ADAPTER_ADDR,
    ]);

    const rec_res = await getTransactionReceipt(walletClient!, { hash: txRes });

    console.log(rec_res.transactionHash);
    setEthHash(rec_res.transactionHash);

    console.log("rec_res", rec_res);
  };

  return {
    onFormSubmit,
  };
};
