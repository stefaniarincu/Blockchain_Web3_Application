import useContract from "@/context/useContract";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardDescription, CardFooter } from "../ui/card";

const SelectWinner = ({ winners, setWinner }: any) => {
  const { candidates } = useContract();
  const candidatesData = candidates
    .filter((candidate: any) => winners.includes(candidate.id))
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
        <div key={candidate.id}>
          <input
            type="radio"
            id={`candidate_${candidate.id}`}
            name="winner"
            value={candidate.id}
            checked={selectedWinner === candidate.id}
            onChange={() => handleWinnerSelect(candidate.id)}
          />
          <label htmlFor={`candidate_${candidate.id}`}>
            <div>{candidate.name}</div>
            <div>{candidate.description}</div>
          </label>
        </div>
      ))}
    </>
  );
};

const AdminWinnerContent = ({ winners }: any) => {
  const { updateWinners, weiPrize, sendPrizeToWinner } = useContract();
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
      <div>
        Winners are not currently available.
        <Button onClick={submitUpdateWinners}>Update Winners</Button>
      </div>
    );

  if (winners.length === 1)
    return (
      <>
        <div>Winner {winners[0]}</div>
        <Button onClick={() => submitSendPrize(winners[0])} size="lg">
          Send Prize {weiPrize}
        </Button>
      </>
    );

  if (winners.length > 1)
    return (
      <>
        <CardTitle>Multiple Winners</CardTitle>
        <CardDescription>
          There are multiple winners. Please choose one to send the prize.
        </CardDescription>

        <SelectWinner winners={winners} setWinner={setWinner} />

        <Button onClick={() => submitSendPrize(winner)} size="lg">
          Send Prize {weiPrize}
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
        console.log(winners);
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

  if (finalWinner) return `Winner: ${finalWinner}`;

  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
      <CardTitle>Admin View</CardTitle>
      <CardDescription>
        {winners.length > 0
          ? `Winner ${winners[0]}`
          : "Winners are not currently available."}
      </CardDescription>
      <CardFooter>
        {winners.length == 0 && (
          <Button onClick={submitUpdateWinners}>Update Winners</Button>
        )}
      </CardFooter>
    </Card>
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
  }, []);

  if (!winner) return "Winner is not currently available.";

  return `Winner: ${winner}`;
};

const UserView = () => {
  const { getWinners } = useContract();
  const [winners, setWinners] = React.useState([]);

  React.useEffect(() => {
    getWinners()
      .then((winners: any) => {
        console.log(winners);
        setWinners(winners);
      })
      .catch((error: any) => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
      <CardTitle>Voting has ended!</CardTitle>
      <CardDescription>
        <UserWinnerContent winners={winners} />
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
