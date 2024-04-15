"use client";

import React, { useState, useEffect, createContext, ReactNode } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";

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

  const prepareContracts = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const votingContractLocal = new ethers.Contract(
      VotingAddress,
      VotingABI,
      provider
    );

    const rewarderContractLocal = new ethers.Contract(
      RewarderAddress,
      RewarderABI,
      provider
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
    setAdminAccount(adminAccount);
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

  const getCandidates = async () => {
    const candidates = await votingContract.getCandidatesList();
    return candidates;
  };

  return (
    <ContractContext.Provider
      value={{
        currentAccount,
        adminAccount,
        connectWallet,
        getCandidates,
        getVotingCurrentState,
        startingTime,
        endingTime,
        weiPrize,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
