import { bridgeAbi } from "@/artifacts/eth/bridge/bridge";
import { parseEther } from "ethers/lib/utils.js";
import { Dispatch, SetStateAction, useMemo } from "react";
import { Address } from "ton-core";
import { getContract } from "viem";
import { getTransactionReceipt } from "viem/actions";
import { useWalletClient } from "wagmi";

export const useSendEthTx = (
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

  const onFormSubmit = async (tonAddr: string, ethsToWrap: string) => {
    if (!bridgeContract) {
      return;
    }
    const addrHash = Address.parse(tonAddr).hash.toString("hex");
    const txHash = await bridgeContract.write.swapETH([
      `0x${addrHash}`,
      process.env.NEXT_PUBLIC_ETH_ADAPTER_ADDR,
      { value: parseEther(ethsToWrap) },
    ]);

    setEthHash(txHash);

    const rec_res = getTransactionReceipt(walletClient!, {
      hash: txHash,
    });

    console.log("rec_res", rec_res);
  };

  return {
    onFormSubmit,
  };
};
