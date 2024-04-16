import useContract from "@/context/useContract";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardFooter } from "../ui/card";
import VotingChart from "./voting-chart";
import { VotingOptionsModal } from "./voting-options-modal";

const AdminView = () => {
  const { stopVoting } = useContract();

  const submitStopVoting = async () => {
    try {
      await stopVoting();
      alert("Voting stopped successfully");
    } catch (error) {
      console.log(error);
      alert("Error stopped voting");
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
