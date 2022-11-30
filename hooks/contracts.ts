import { useContract } from "@starknet-react/core";
import starknet_id_abi from "../abi/starknet/starknet_id_abi.json";
import naming_abi from "../abi/starknet/naming_abi.json";
import pricing_abi from "../abi/starknet/pricing_abi.json";
import verifier_abi from "../abi/starknet/verifier_abi.json";
import erc20_abi from "../abi/starknet/erc20_abi.json";
import { Abi } from "starknet";

export function useStarknetIdContract() {
  return useContract({
    abi: starknet_id_abi as Abi,
    address: process.env.STARKNETID_CONTRACT,
  });
}

export function useNamingContract() {
  return useContract({
    abi: naming_abi as Abi,
    address: process.env.NAMING_CONTRACT,
  });
}

export function usePricingContract() {
  return useContract({
    abi: pricing_abi as Abi,
    address: process.env.PRICING_CONTRACT,
  });
}

export function useVerifierIdContract() {
  return useContract({
    abi: verifier_abi as Abi,
    address: process.env.VERIFIER_CONTRACT,
  });
}

export function useEtherContract() {
  return useContract({
    abi: erc20_abi as Abi,
    address: process.env.ETHER_CONTRACT,
  });
}
