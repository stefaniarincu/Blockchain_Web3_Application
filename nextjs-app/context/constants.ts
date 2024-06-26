import rewarder from "../contracts/Rewarder.json";
import voting from "../contracts/Voting.json";
import { ErrorDecoder } from "ethers-decode-error";

export const RewarderAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const RewarderABI = rewarder.abi;

export const VotingAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const VotingABI = voting.abi;

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const errorDecoder = ErrorDecoder.create();
