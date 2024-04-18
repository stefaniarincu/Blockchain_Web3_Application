"use client";

import React, { useState, useEffect, createContext, ReactNode } from "react";
import { ethers } from "ethers";

import {
  VotingABI,
  VotingAddress,
  RewarderABI,
  RewarderAddress,
} from "./constants";
import { toast } from "sonner";

export const ContractContext = createContext<any>(undefined);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const [gasPrice, setGasPrice] = useState<number>(612371124);

  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [adminAccount, setAdminAccount] = useState<string>("");
  const [votingContract, setVotingContract] = useState<any>(undefined);
  const [rewarderContract, setRewarderContract] = useState<any>(undefined);
  const [startingTime, setStartingTime] = useState<Date>();
  const [endingTime, setEndingTime] = useState<Date>();
  const [weiPrize, setWeiPrize] = useState<number>(0);
  const [startVotePriceWei, setStartVotePriceWei] = useState<BigInt>();
  const [endVotePriceWei, setEndVotePriceWei] = useState<BigInt>();
  const [candidates, setCandidates] = useState<string[]>();
  const [finalWinner, setFinalWinner] = useState<string>();

  const prepareContracts = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const votingContractLocal = new ethers.Contract(
      VotingAddress,
      VotingABI,
      signer
    );

    const rewarderContractLocal = new ethers.Contract(
      RewarderAddress,
      RewarderABI,
      signer
    );

    setVotingContract(votingContractLocal);
    setRewarderContract(rewarderContractLocal);

    return [votingContractLocal, rewarderContractLocal];
  };

  // https://ethereum.stackexchange.com/questions/42768/how-can-i-detect-change-in-account-in-metamask
  useEffect(() => {
    async function listenMMAccount() {
      window.ethereum.on("accountsChanged", async function () {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setCurrentAccount(accounts[0]);
        prepareContracts();
      });
    }
    listenMMAccount();
  }, []);

  const fetchTimeInformation = async (votingContractLocal: any) => {
    const startingTime = new Date(
      Number(await votingContractLocal.startVotingTimestamp()) * 1000
    );
    const endingTime = new Date(
      Number(await votingContractLocal.stopVotingTimestamp()) * 1000
    );

    setStartingTime(startingTime);
    setEndingTime(endingTime);
  };

  const fetchPrizeInformation = async (rewarderContractLocal: any) => {
    const prize = await rewarderContractLocal.totalPrize();
    setWeiPrize(Number(prize));
  };

  const fetchAdminAccount = async (rewarderContractLocal: any) => {
    const adminAccount = await rewarderContractLocal.votingAdmin();
    setAdminAccount(adminAccount.toLowerCase());
  };

  const fetchStartEndVotePrices = async (votingContractLocal: any) => {
    const startVotePrice = await votingContractLocal.adminStartVoteCost();
    const endVotePrice = await votingContractLocal.adminStartVoteCost();

    setStartVotePriceWei(startVotePrice);
    setEndVotePriceWei(endVotePrice);
  };

  const fetchCandidates = async (votingContractLocal: any) => {
    const candidates = await votingContractLocal.getCandidatesList();
    setCandidates(candidates);
  };

  const fetchFinalWinner = async (rewarderContractLocal: any) => {
    const sentPrizeTo = await rewarderContractLocal.prizeSentTo();
    setFinalWinner(sentPrizeTo);
  };

  const [onlyOnceVotingEvents, setOnlyOnceVotingEvents] = useState(false);
  const [onlyOnceRewarderEvents, setOnlyOnceRewarderEvents] = useState(false);

  useEffect(() => {
    if (!votingContract) return;
    if (onlyOnceVotingEvents) return;

    // const localVotingContract = votingContract;

    votingContract.on("SomeoneCandidated", () => {
      console.log("[EVENT] Someone candidated");
      votingContract.getCandidatesList().then((candidates: any) => {
        setCandidates(candidates);
      });
    });

    votingContract.on("SomeoneVoted", () => {
      console.log("[EVENT] Someone voted");
      votingContract.getCandidatesList().then((candidates: any) => {
        setCandidates(candidates);
      });
    });

    votingContract.on("StartVote", (startVotingTimestamp: BigInt) => {
      console.log("[EVENT] Voting started");
      setStartingTime(new Date(Number(startVotingTimestamp) * 1000));
    });

    votingContract.on("EndVote", (endVotingTimestamp: BigInt) => {
      console.log("[EVENT] Voting ended");
      setEndingTime(new Date(Number(endVotingTimestamp) * 1000));
    });

    setOnlyOnceVotingEvents(true);

    // return () => {
    //   localVotingContract.removeListener("SomeoneCandidated", listenerF);
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votingContract]);

  useEffect(() => {
    if (!rewarderContract) return;
    if (onlyOnceRewarderEvents) return;

    // const localRewarderContract = rewarderContract;

    rewarderContract.on("PrizeAdded", () => {
      fetchPrizeInformation(rewarderContract);
    });

    rewarderContract.on("WinnerDeclared", (winnerAddress: string) => {
      setFinalWinner(winnerAddress);
    });

    setOnlyOnceRewarderEvents(true);

    // return () => localRewarderContract.removeAllListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewarderContract]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window as any;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      prepareContracts().then(([votingContract, rewarderContract]) => {
        fetchTimeInformation(votingContract);
        fetchPrizeInformation(rewarderContract);
        fetchAdminAccount(rewarderContract);
        fetchStartEndVotePrices(votingContract);
        fetchCandidates(votingContract);
        fetchFinalWinner(rewarderContract);
      });
    } else {
      console.log("No authorized account found");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Get MetaMask!", { duration: 5000 });
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    window.location.reload();
  };

  const getVotingCurrentState = async () => {
    const state = await votingContract.checkVotingCurrentState();
    return state;
  };

  const submitCandidate = async (name: string, description: string) => {
    const tx = await votingContract.candidate(name, description, { gasPrice });
    return tx;
  };

  const startVoting = async () => {
    const tx = await votingContract.startVoting({
      value: startVotePriceWei,
      gasPrice,
    });
    return tx;
  };

  const stopVoting = async () => {
    const tx = await votingContract.endVoting({
      value: endVotePriceWei,
      gasPrice,
    });
    return tx;
  };

  const getWinners = async () => {
    const winners = await votingContract.getWinners({ gasPrice });
    return winners;
  };

  const updateWinners = async () => {
    const tx = await votingContract.updateWinners({ gasPrice });
    return tx;
  };

  const sendVotes = async (votes: number[]) => {
    const tx = await votingContract.vote(votes, { gasPrice });
    return tx;
  };

  const hasVotedFor = async (voter: any, candidateId: any) => {
    const hasVoted = await votingContract.hasVotedFor(voter, candidateId, {
      gasPrice,
    });
    return hasVoted;
  };

  const sendPrizeToWinner = async (winner: any) => {
    const tx = await rewarderContract["sendPrizeToWinner(uint256)"](winner, {
      gasPrice,
    });
    return tx;
  };

  const getCandidateData = async (address: any) => {
    if (!candidates) return null;

    // Assuming candidates is an array containing candidate data
    address = address.toLowerCase();
    const candidate = candidates.find(
      (candidate: any) => candidate[1].toLowerCase() === address
    );

    if (candidate) {
      return {
        id: Number(candidate[0]),
        address: candidate[1],
        name: candidate[2],
        description: candidate[3],
        votes: Number(candidate[4]),
      };
    } else {
      return null;
    }
  };

  const getAddressFromCandidateId = (id: any) => {
    if (!candidates) return null;

    const candidate = candidates.find((candidate: any) => candidate[0] === id);

    if (candidate) {
      return candidate[1];
    } else {
      return null;
    }
  };

  const restartVotingSession = async (weiValue: any) => {
    const tx = await votingContract.restartVotingSession({
      value: weiValue,
      gasPrice,
    });
    return tx;
  };

  return (
    <ContractContext.Provider
      value={{
        currentAccount,
        adminAccount,
        connectWallet,
        candidates,
        getVotingCurrentState,
        startingTime,
        endingTime,
        weiPrize,
        submitCandidate,
        startVoting,
        stopVoting,
        getWinners,
        updateWinners,
        sendVotes,
        hasVotedFor,
        finalWinner,
        sendPrizeToWinner,
        getCandidateData,
        getAddressFromCandidateId,
        gasPrice,
        setGasPrice,
        restartVotingSession,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
