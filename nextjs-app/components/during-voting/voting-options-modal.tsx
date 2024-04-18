import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useContract from "@/context/useContract";
import { VotingOptionsTable } from "./voting-options-table";
import { useState } from "react";
import { toast } from "sonner";
import { errorDecoder } from "@/context/constants";
import { DialogClose } from "@radix-ui/react-dialog";
import { ethers } from "ethers";

export function AlertPermanent() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Please choose carefully who you vote for.
        <br />
        You can not unvote once you have voted.
      </AlertDescription>
    </Alert>
  );
}

export function VotingOptionsModal() {
  const { candidates, sendVotes } = useContract();
  const [toVoteIds, setToVoteIds] = useState<number[]>([]);
  const candidatesData = candidates.map((candidate: any) => {
    return {
      id: Number(candidate[0]),
      address: candidate[1],
      name: candidate[2],
      description: candidate[3],
      votes: Number(candidate[4]),
    };
  });

  const handleSubmit = async () => {
    try {
      const tx = await sendVotes(toVoteIds);
      toast.promise(tx.wait(), {
        loading: "Loading...",
        success: (receipt: any) => {
          setToVoteIds([]);
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
      setToVoteIds([]);
      const { reason } = await errorDecoder.decode(error);
      toast.error(`Error submitting votes: "${reason}"`, { duration: 5000 });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Click for Options</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[70%]">
        <DialogHeader>
          <DialogTitle>Voting Options</DialogTitle>
          <DialogDescription>
            Select who you would like to vote for.
          </DialogDescription>
          <AlertPermanent />
        </DialogHeader>
        <VotingOptionsTable
          candidatesData={candidatesData}
          setToVoteIds={setToVoteIds}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" variant="destructive" onClick={handleSubmit}>
              Submit vote
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
