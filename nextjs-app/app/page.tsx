"use client";

import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import VotingChart from "@/components/voting-chart";

export default function Home() {
  return (
    <main className="flex items-center justify-center flex-col">
      <div className="flex flex-col items-center relative w-[90vw] h-[80vh] lg:w-[60vw] lg:h-[40vh] border border-black/[0.2]">
        <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
        <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
        <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
        <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />
        <EvervaultCard
          text={
            <>
              <h1 className="font-bold text-[3rem] text-center cursor-default">
                BOBERT Voting System
              </h1>
              <h4 className="text-gray-500 text-[1.5rem] text-center cursor-default">
                Ballots Optimized for Balanced Electoral Representation and
                Transparency
              </h4>
            </>
          }
        />
      </div>
      <div>
        <VotingChart />
      </div>
    </main>
  );
}
