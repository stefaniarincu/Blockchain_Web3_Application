"use client";

import React, { useState, useEffect, createContext, ReactNode } from "react";
import { ethers } from "ethers";

import {
  VotingABI,
  VotingAddress,
  RewarderABI,
  RewarderAddress,
} from "./constants";

export const ContractContext = createContext<any>(undefined);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
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
      alert("Get MetaMask!");
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
    const tx = await votingContract.candidate(name, description);
    return tx;
  };

  const startVoting = async () => {
    const tx = await votingContract.startVoting({ value: startVotePriceWei });
    return tx;
  };

  const stopVoting = async () => {
    const tx = await votingContract.endVoting({ value: endVotePriceWei });
    return tx;
  };

  const getWinners = async () => {
    const winners = await votingContract.getWinners();
    return winners;
  };

  const updateWinners = async () => {
    const tx = await votingContract.updateWinners();
    return tx;
  };

  const sendVotes = async (votes: number[]) => {
    const tx = await votingContract.vote(votes);
    return tx;
  };

  const hasVotedFor = async (voter: any, candidateId: any) => {
    const hasVoted = await votingContract.hasVotedFor(voter, candidateId);
    return hasVoted;
  };

  const getPrizeSentTo = async () => {
    if (!rewarderContract) return;

    const sentPrizeTo = await rewarderContract.prizeSentTo();
    return sentPrizeTo;
  };

  const sendPrizeToWinner = async (winner: any) => {
    const tx = await rewarderContract["sendPrizeToWinner(uint256)"](winner);
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
        getPrizeSentTo,
        sendPrizeToWinner,
        getCandidateData,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
