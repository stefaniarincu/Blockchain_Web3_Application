import useContract from "@/context/useContract";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardFooter } from "../ui/card";

const AdminView = () => {
  const { currentAccount, stopVoting } = useContract();

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
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md h-full">
      <CardTitle>Admin View</CardTitle>
      <CardFooter>
        <Button onClick={submitStopVoting}>Stop Voting</Button>
      </CardFooter>
    </Card>
  );
};

const UserView = () => {
  return <div>User View</div>;
};

const DuringVoting = () => {
  const { currentAccount, adminAccount } = useContract();
  const isAdmin = currentAccount === adminAccount;

  if (isAdmin) return <AdminView />;
  else return <UserView />;
};

export default DuringVoting;
