import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Vote {
  transactionId: string;
  vote: string;
  date: string;
}

const VotesTable = () => {
  const votes: Vote[] = [
    {
      transactionId: "0x1234",
      vote: "Bob",
      date: "2021-10-01",
    },
    {
      transactionId: "0x5678",
      vote: "Alice",
      date: "2021-10-02",
    },
    {
      transactionId: "0x9abd",
      vote: "Bob",
      date: "2021-10-03",
    },
    {
      transactionId: "0xbetr",
      vote: "Alice",
      date: "2021-10-04",
    },
    {
      transactionId: "0x1237",
      vote: "Bob",
      date: "2021-10-05",
    },
    {
      transactionId: "0x5678",
      vote: "Alice",
      date: "2021-10-06",
    },
    {
      transactionId: "0x9abe",
      vote: "Bob",
      date: "2021-10-07",
    },
    {
      transactionId: "0xdef0",
      vote: "Alice",
      date: "2021-10-08",
    },
    {
      transactionId: "0x1235",
      vote: "Bob",
      date: "2021-10-09",
    },
    {
      transactionId: "0x5678",
      vote: "Alice",
      date: "2021-10-10",
    },
    {
      transactionId: "0x9abc",
      vote: "Bob",
      date: "2021-10-11",
    },
    {
      transactionId: "0xasfd",
      vote: "Alice",
      date: "2021-10-12",
    },
  ];

  return (
    <div>
      <Table divClassname="h-[350px] overflow-y-auto">
        <TableHeader className="sticky top-0 bg-slate-50">
          <TableRow>
            <TableHead className="w-[100px]">Vote For</TableHead>
            <TableHead className="w-[200px]">Date</TableHead>
            <TableHead className="text-right">Transaction Id</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {votes.map((vote) => (
            <TableRow key={vote.transactionId}>
              <TableCell className="font-medium">{vote.vote}</TableCell>
              <TableCell>{vote.date}</TableCell>
              <TableCell className="text-right">{vote.transactionId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="sticky bottom-[-1px] bg-slate-50">
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell className="text-right">{votes.length} votes</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <h4 className="text-muted-foreground text-center mt-5 font-semibold">
        Live Votes Update
      </h4>
    </div>
  );
};

export default VotesTable;
