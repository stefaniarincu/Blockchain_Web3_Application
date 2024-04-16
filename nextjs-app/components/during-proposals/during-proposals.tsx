import React, { useRef } from "react";
import { Card, CardDescription, CardFooter, CardTitle } from "../ui/card";
import useContract from "@/context/useContract";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { errorDecoder } from "@/context/constants";

const AdminView = () => {
  const { startVoting, candidates } = useContract();

  const submitStartVoting = async () => {
    try {
      const tx = await startVoting();
      toast.promise(tx.wait(), {
        loading: "Loading...",
        success: () => {
          return `Transaction completed! ${tx.hash}`;
        },
        error: "There was an error with your transaction.",
      });
    } catch (error: any) {
      console.log(error);
      const { reason } = await errorDecoder.decode(error);
      toast.error(`Error starting voting: "${reason}"`, { duration: 5000 });
    }
  };

  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
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
      return toast.error("Please fill all fields", { duration: 5000 });

    try {
      const tx = await submitCandidate(name, description);
      toast.promise(tx.wait(), {
        loading: "Loading...",
        success: () => {
          return `Transaction completed! ${tx.hash}`;
        },
        error: "There was an error with your transaction.",
      });
    } catch (error: any) {
      console.log(error);
      const { reason } = await errorDecoder.decode(error);
      toast.error(`Error submitting candidate: "${reason}"`, { duration: 5000 });
    }
  };

  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
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
