import useContract from "@/context/useContract";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { errorDecoder, NULL_ADDRESS } from "@/context/constants";
import { ethers } from "ethers";
import { toast } from "sonner";

const SelectWinner = ({ winners, setWinner }: any) => {
  const { candidates } = useContract();
  const candidatesData = candidates
    .filter((candidate: any) => winners.includes(candidate[0]))
    .map((candidate: any) => {
      return {
        id: Number(candidate[0]),
        address: candidate[1],
        name: candidate[2],
        description: candidate[3],
        votes: Number(candidate[4]),
      };
    });

  const [selectedWinner, setSelectedWinner] = useState<number | null>(null);

  const handleWinnerSelect = (id: number) => {
    setSelectedWinner(id);
    setWinner(id);
  };

  return (
    <>
      {candidatesData.map((candidate: any) => (
        <div key={candidate.id} className="flex gap-2">
          <input
            type="radio"
            id={`candidate_${candidate.id}`}
            name="winner"
            value={candidate.id}
            checked={selectedWinner === candidate.id}
            onChange={() => handleWinnerSelect(candidate.id)}
          />
          <label htmlFor={`candidate_${candidate.id}`}>
            <div className="font-bold">
              {candidate.name} ({candidate.address})
            </div>
            <div>{candidate.description}</div>
          </label>
        </div>
      ))}
    </>
  );
};

const AdminWinnerContent = ({ winners }: any) => {
  const {
    updateWinners,
    weiPrize,
    sendPrizeToWinner,
    getAddressFromCandidateId,
  } = useContract();
  const ethPrize = ethers.formatEther(BigInt(weiPrize));
  const [winner, setWinner] = useState(-1);

  const submitUpdateWinners = async () => {
    try {
      const tx = await updateWinners();
      toast.promise(tx.wait(), {
        loading: "Loading...",
        success: (receipt: any) => {
          window.location.reload();
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
      toast.error(`Error updating winners: "${reason}"`, { duration: 5000 });
    }
  };

  const submitSendPrize = async (winnerId: number) => {
    if (winnerId === -1)
      return toast.error("Please select a winner", { duration: 5000 });

    try {
      const tx = await sendPrizeToWinner(winnerId);
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
      toast.error(`Error sending prize: "${reason}"`, { duration: 5000 });
    }
  };

  if (winners.length === 0)
    return (
      <div className="flex flex-col gap-2">
        <span>Winners are not currently available.</span>
        <Button onClick={submitUpdateWinners}>Update Winners</Button>
      </div>
    );

  if (winners.length === 1)
    return (
      <>
        <WinnerDisplay winner={getAddressFromCandidateId(winners[0])} />
        <br />
        <Button onClick={() => submitSendPrize(winners[0])} size="lg">
          Send Prize ({ethPrize} ETH)
        </Button>
      </>
    );

  if (winners.length > 1)
    return (
      <>
        <CardDescription>
          There are multiple winners. Please choose one to send the prize.
        </CardDescription>

        <SelectWinner winners={winners} setWinner={setWinner} />

        <Button onClick={() => submitSendPrize(winner)} size="lg">
          Send Prize ({ethPrize} ETH)
        </Button>
      </>
    );

  return `Winner: ${winners[0]}`;
};

const AdminView = () => {
  const { getWinners, finalWinner } = useContract();
  const [winners, setWinners] = React.useState([]);

  React.useEffect(() => {
    getWinners()
      .then((winners: any) => {
        setWinners(winners);
      })
      .catch((error: any) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (finalWinner !== NULL_ADDRESS)
    return <WinnerDisplay winner={finalWinner} />;

  return (
    <Card className="m-auto max-w-2xl space-y-4 rounded-xl bg-white p-8 shadow-md">
      <CardTitle>Admin View</CardTitle>
      <AdminWinnerContent winners={winners} />
    </Card>
  );
};

const WinnerDisplay = ({ winner }: any) => {
  const { getCandidateData } = useContract();
  const [candidate, setCandidate] = useState<any>();

  useEffect(() => {
    getCandidateData(winner)
      .then((candidate: any) => {
        setCandidate(candidate);
      })
      .catch((error: any) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCandidateData, winner]);

  if (!candidate) return `Winner: ${winner}`;

  return (
    <div className="flex flex-col">
      <div>
        Winner: {candidate.name} ({candidate.address})
      </div>
      <div>Votes: {candidate.votes}</div>
    </div>
  );
};

const UserWinnerContent = () => {
  const { finalWinner: winner } = useContract();

  if (winner === NULL_ADDRESS) return "Winner is not currently available.";

  return <WinnerDisplay winner={winner} />;
};

const UserView = () => {
  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
      <CardTitle>Voting has ended!</CardTitle>
      <CardDescription>
        <UserWinnerContent />
      </CardDescription>
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
