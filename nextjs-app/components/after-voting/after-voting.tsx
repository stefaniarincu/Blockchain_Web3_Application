import useContract from "@/context/useContract";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardDescription, CardFooter } from "../ui/card";

const AdminView = () => {
  const { currentAccount, startVoting, getCandidates } = useContract();
  const [candidates, setCandidates] = React.useState([]);

  const submitStartVoting = async () => {
    try {
      await startVoting();
      alert("Voting started successfully");
    } catch (error) {
      console.log(error);
      alert("Error starting voting");
    }
  };

  React.useEffect(() => {
    if (!currentAccount) return;

    getCandidates()
      .then((candidates: any) => {
        console.log(candidates);
        setCandidates(candidates);
      })
      .catch((error: any) => {
        console.error(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount]);

  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md h-full">
      <CardTitle>Admin View</CardTitle>
      <CardDescription>
        Currently {candidates.length} candidates
      </CardDescription>
      <CardFooter>
        <Button onClick={submitStartVoting}>Start Voting</Button>
      </CardFooter>
    </Card>
  );
};

const AfterVoting = () => {
  const { currentAccount, adminAccount } = useContract();
  const isAdmin = currentAccount === adminAccount;

  if (isAdmin) return <AdminView />;
  else return <UserView />;
};

export default AfterVoting;
