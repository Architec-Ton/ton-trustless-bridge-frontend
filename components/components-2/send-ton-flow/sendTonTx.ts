import { BridgeOpCodes } from "@/artifacts/ton/bridge/op-codes";
import { TxReq } from "@/types";
import { Base64 } from "@tonconnect/protocol";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Dispatch, SetStateAction } from "react";
import { beginCell, toNano } from "ton-core";

export const buildSendTonTx = (address: bigint, tonsToWrap: string) => {
  return Base64.encode(
    beginCell()
      .storeUint(BridgeOpCodes.WRAP, 32)
      .storeUint(0, 64)
      .storeUint(address, 256)
      .storeUint(toNano(tonsToWrap), 256)
      .storeUint(0, 1)
      .endCell()
      .toBoc()
  );
};

export const useSendTonTx = (
  setTxHash: Dispatch<SetStateAction<TxReq | undefined>>
) => {
  const [tonConnectUI] = useTonConnectUI();
  const myTonAddrRaw = useTonAddress(false);

  const sendWrap = async (ethAddr: bigint, tonsToWrap: string) => {
    try {
      await tonConnectUI.sendTransaction({
        validUntil: Date.now() + 1000000,
        messages: [
          {
            address: process.env.NEXT_PUBLIC_TON_BRIDGE_ADDR!,
            amount: (toNano(tonsToWrap) + toNano("0.2")).toString(),
            payload: buildSendTonTx(ethAddr, tonsToWrap),
          },
        ],
      });
    } catch (err) {
      console.error("sendWrap error: ", err);
    }
  };

  const onFormSubmit = async (ethAddr: string, tonsToWrap: string) => {
    // const { transactions: beforeTxs } =
    //   await tonRawBlockchainApi.blockchain.getBlockchainAccountTransactions(
    //     Address.parse(process.env.NEXT_PUBLIC_TON_BRIDGE_ADDR!).toRawString(),
    //     { limit: 20 }
    //   );

    try {
      await sendWrap(BigInt(ethAddr), tonsToWrap);
      setTxHash({ hash: "nothing", lt: 0, workchain: 0 });
    } catch (err) {
      console.error("sendWrap error: ", err);
    }

    // let found = false;
    // let attempts = 0;
    // while (!found && attempts < 10) {
    //   const txs = (
    //     await await tonRawBlockchainApi.blockchain.getBlockchainAccountTransactions(
    //       Address.parse(process.env.NEXT_PUBLIC_TON_BRIDGE_ADDR!).toRawString(),
    //       { limit: 20 }
    //     )
    //   ).transactions.filter((tx) => {
    //     return !beforeTxs.find((beforeTx) => beforeTx.hash === tx.hash);
    //   });
    //   if (txs.length) {
    //     const tx = txs.find((tx) => {
    //       const addr = tx.in_msg?.source?.address;
    //       if (!addr) return false;
    //       return Address.parse(addr).equals(Address.parse(myTonAddrRaw));
    //     });
    //     if (tx) {
    //       found = true;
    //       const addr = Address.parse(tx.account.address);
    //       const lt = tx.lt;
    //       const workchain = addr.workChain;
    //       setTxHash({ hash: tx.hash, lt, workchain });
    //       console.log(tx); // !!!!!
    //     }
    //   }
    //   attempts += 1;
    //   await sleep(4000);
    // }
  };

  return {
    onFormSubmit,
  };
};
