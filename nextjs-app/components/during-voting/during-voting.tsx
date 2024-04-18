import useContract from "@/context/useContract";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardFooter } from "../ui/card";
import VotingChart from "./voting-chart";
import { VotingOptionsModal } from "./voting-options-modal";
import { toast } from "sonner";
import { errorDecoder } from "@/context/constants";
import { ethers } from "ethers";

const AdminView = () => {
  const { stopVoting } = useContract();

  const submitStopVoting = async () => {
    try {
      const tx = await stopVoting();
      toast.promise(tx.wait(), {
        loading: "Loading...",
        success: (receipt: any) => {
          return (
            <div>
              Transaction completed! ({tx.hash})
              <br />
              Gas used: <b>{ethers.formatEther(receipt.gasUsed)} ETH</b>
            </div>
          );
        },
        error: "There was an error with your transaction.",
      });
    } catch (error: any) {
      console.log(error);
      const { reason } = await errorDecoder.decode(error);
      toast.error(`Error stopping voting: "${reason}"`, { duration: 5000 });
    }
  };

  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
      <CardTitle>Admin View</CardTitle>
      <CardFooter>
        <Button onClick={submitStopVoting}>Stop Voting</Button>
      </CardFooter>
    </Card>
  );
};

const UserView = () => {
  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
      <CardTitle>Vote your favorite</CardTitle>
      <CardFooter>
        <VotingOptionsModal />
      </CardFooter>
    </Card>
  );
};

const DuringVoting = () => {
  const { currentAccount, adminAccount } = useContract();
  const isAdmin = currentAccount === adminAccount;

  return (
    <>
      {isAdmin ? <AdminView /> : <UserView />}
      <VotingChart />
    </>
  );
};

export default DuringVoting;
