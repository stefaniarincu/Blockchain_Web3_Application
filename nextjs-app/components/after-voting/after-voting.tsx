import useContract from "@/context/useContract";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { NULL_ADDRESS } from "@/context/constants";
import { ethers } from "ethers";

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
  const { updateWinners, weiPrize, sendPrizeToWinner } = useContract();
  const ethPrize = ethers.formatEther(BigInt(weiPrize));
  const [winner, setWinner] = useState(-1);

  const submitUpdateWinners = async () => {
    try {
      await updateWinners();
      alert("Winners updated successfully");
    } catch (error) {
      console.log(error);
      alert("Error updating winners");
    }
  };

  const submitSendPrize = async (winnerId: number) => {
    if (winnerId === -1) return alert("Please select a winner");

    try {
      await sendPrizeToWinner(winnerId);
      alert("Prize sent successfully");
    } catch (error) {
      console.log(error);
      alert("Error sending prize");
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
        <div>Winner {winners[0]}</div>
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
  const { getWinners, getPrizeSentTo } = useContract();
  const [finalWinner, setFinalWinner] = useState();
  const [winners, setWinners] = React.useState([]);

  React.useEffect(() => {
    getWinners()
      .then((winners: any) => {
        setWinners(winners);
      })
      .catch((error: any) => {});

    getPrizeSentTo()
      .then((address: any) => {
        setFinalWinner(address);
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
  const { getPrizeSentTo } = useContract();
  const [winner, setWinner] = useState();

  useEffect(() => {
    getPrizeSentTo()
      .then((address: any) => {
        setWinner(address);
      })
      .catch((error: any) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPrizeSentTo]);

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
