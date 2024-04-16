import useContract from "@/context/useContract";
import dynamic from "next/dynamic";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Cell,
} from "recharts";

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#d6ff00",
  "#00ff00",
];

const DynamicBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);

const VotingChart = () => {
  const { candidates } = useContract();

  const data = candidates.map((candidate: any) => ({
    candidate: candidate[2],
    votes: Number(candidate[4]),
    color: colors[Number(candidate[0]) % colors.length],
  }));

  return (
    <DynamicBarChart
      width={600}
      height={400}
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="candidate" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="votes" fill="#8884d8">
        {data.map((entry: any, index: any) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </DynamicBarChart>
  );
};

export default VotingChart;
