import React, { useRef } from "react";
import { Card, CardDescription, CardFooter, CardTitle } from "../ui/card";
import useContract from "@/context/useContract";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const AdminView = () => {
  const { startVoting, candidates } = useContract();

  const submitStartVoting = async () => {
    try {
      await startVoting();
      alert("Voting started successfully");
    } catch (error) {
      console.log(error);
      alert("Error starting voting");
    }
  };

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
      <CardFooter>
        <Button onClick={handleSubmit}>Submit Participation</Button>
      </CardFooter>
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
