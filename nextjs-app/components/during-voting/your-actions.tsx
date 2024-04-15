import useContract from "@/context/useContract";
import { get } from "http";
import React, { useEffect } from "react";

const YourActions = () => {
  const {
    currentAccount,
    connectWallet,
    getCandidates,
    getVotingCurrentState,
    startingTime,
    endingTime,
    weiPrize,
  } = useContract();
  const [candidates, setCandidates] = React.useState([]);

  useEffect(() => {
    if (!currentAccount) return;

    getVotingCurrentState()
      .then((state: any) => {
        console.log(state);
      })
      .catch((error: any) => {
        console.error(error);
      });

    getCandidates()
      .then((candidates: any) => {
        console.log(candidates);
        setCandidates(candidates);
      })
      .catch((error: any) => {
        console.error(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!currentAccount) {
    return (
      <div>
        <button onClick={connectWallet}>Connect wallet</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        {startingTime && startingTime.toDateString()} -{" "}
        {endingTime && endingTime.toDateString()}
        <br /> Wei Prize {weiPrize}
      </div>
      {candidates}
      {currentAccount}
    </div>
  );
};

export default YourActions;
