import React from "react";
import { Card, CardDescription, CardTitle } from "../ui/card";
import useContract from "@/context/useContract";
import { Button } from "../ui/button";

const AdminView = () => {
  const { currentAccount, adminAccount, getCandidates } = useContract();
  const [candidates, setCandidates] = React.useState([]);

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
      <Button>Start Voting</Button>
    </Card>
  );
};

const DuringProposals = () => {
  const { currentAccount, adminAccount } = useContract();
  const isAdmin = currentAccount.address === adminAccount.address;

  if (isAdmin) return <AdminView />;
  else return <div>Not an admin</div>;
};

export default DuringProposals;
