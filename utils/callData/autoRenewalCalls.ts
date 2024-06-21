import { Call } from "starknet";

function approve(
  erc20Contract: string,
  renewalContract: string,
  amountToApprove: string
): Call {
  return {
    contractAddress: erc20Contract,
    entrypoint: "approve",
    calldata: [renewalContract, amountToApprove, "0"],
  };
}

function enableRenewal(
  autoRenewalContract: string,
  encodedDomain: string,
  price: string,
  metahash: string
): Call {
  return {
    contractAddress: autoRenewalContract,
    entrypoint: "enable_renewals",
    calldata: [
      encodedDomain.toString(),
      price,
      0, // sponsor
      metahash,
    ],
  };
}

function disableRenewal(
  autoRenewalContract: string,
  encodedDomain: string
): Call {
  return {
    contractAddress: autoRenewalContract,
    entrypoint: "disable_renewals",
    calldata: [encodedDomain.toString()],
  };
}

const registrationCalls = {
  approve,
  enableRenewal,
  disableRenewal,
};

export default registrationCalls;
