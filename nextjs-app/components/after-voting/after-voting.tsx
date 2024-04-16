import useContract from "@/context/useContract";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardTitle, CardDescription, CardFooter } from "../ui/card";

const AdminView = () => {
  const { getWinners, updateWinners } = useContract();
  const [winners, setWinners] = React.useState([]);

  const submitUpdateWinners = async () => {
    try {
      await updateWinners();
      alert("Winners updated successfully");
    } catch (error) {
      console.log(error);
      alert("Error updating winners");
    }
  };

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
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md h-full">
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

const UserWinnerContent = ({ winners }: any) => {
  if (winners.length === 0) return "Winner is not currently available.";

  if (winners.length > 1)
    return "There was a tie! Waiting for admin to make the final verdict.";

  return `Winner: ${winners[0]}`;
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
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md h-full">
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
