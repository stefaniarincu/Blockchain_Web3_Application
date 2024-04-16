import useContract from "@/context/useContract";
import useCountdown from "@/hooks/use-countdown";
import React from "react";
import Countdown from "./countdown";
import DuringProposals from "./during-proposals/during-proposals";
import DuringVoting from "./during-voting/during-voting";
import AfterVoting from "./after-voting/after-voting";

const ConditionalProposalOrVoting = () => {
  const { startingTime, endingTime } = useContract();
  const currentState = (() => {
    const now = new Date();
    if (now < startingTime) return "before";
    if (now < endingTime) return "during";
    return "after";
  })();

  const secondsUntilStart = (() => {
    switch (currentState) {
      case "before":
        return Math.floor(
          (startingTime.getTime() - new Date().getTime()) / 1000
        );
      case "during":
        return Math.floor((endingTime.getTime() - new Date().getTime()) / 1000);
      default:
        return 0;
    }
  })();

  const [days, hours, minutes, seconds] = useCountdown(secondsUntilStart);

  if (currentState === "before") {
    return (
      <>
        <Countdown
          title="Voting starts in"
          description="Until voting starts you can propose yourself"
          days={days}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
        />
        <DuringProposals />
      </>
    );
  }

  if (currentState === "during") {
    return (
      <>
        <Countdown
          title="Voting ends in"
          description="Vote for your favorite candidate"
          days={days}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
        />
        <DuringVoting />
      </>
    );
  }

  return <AfterVoting />;
};

export default ConditionalProposalOrVoting;
