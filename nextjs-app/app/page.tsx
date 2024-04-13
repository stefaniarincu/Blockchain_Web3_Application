"use client";

import YourActions from "@/components/during-voting/your-actions";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import VotesTable from "@/components/during-voting/votes-table";
import VotingChart from "@/components/during-voting/voting-chart";

export default function Home() {
  return (
    <main className="flex items-center justify-center flex-col size-full gap-10">
      <div className="flex flex-col items-center relative w-[90vw] h-[80vh] lg:h-[40vh] border border-black/[0.2]">
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
              <h4 className="text-muted-foreground text-[1.5rem] text-center cursor-default">
                Ballots Optimized for Balanced Electoral Representation and
                Transparency
              </h4>
            </>
          }
        />
      </div>
      <div className="flex items-center gap-10">
        <VotesTable />
        <YourActions />
        <VotingChart />
      </div>
    </main>
  );
}
