import React, { useRef } from "react";
import { Card, CardDescription, CardTitle } from "../ui/card";
import useContract from "@/context/useContract";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

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

const UserView = () => {
  const { submitCandidate } = useContract();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!nameRef.current || !descriptionRef.current) return;

    const name = nameRef.current.value;
    const description = descriptionRef.current.value;

    if (name === "" || description === "")
      return alert("Please fill all fields");

    try {
      await submitCandidate(name, description);
      alert("Candidate submitted successfully");
    } catch (error) {
      console.log(error);
      alert("Error submitting candidate");
    }
  };

  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md h-full">
      <CardTitle>Do you want to candidate?</CardTitle>
      <Input ref={nameRef} placeholder="Your name" />
      <Textarea ref={descriptionRef} placeholder="A description" />
      <Button onClick={handleSubmit}>Submit Participation</Button>
    </Card>
  );
};

const DuringProposals = () => {
  const { currentAccount, adminAccount } = useContract();
  const isAdmin = currentAccount === adminAccount;

  if (isAdmin) return <AdminView />;
  else return <UserView />;
};

export default DuringProposals;
