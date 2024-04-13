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

const DynamicBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);

const VotingChart = () => {
  const data = [
    { candidate: "Candidate A", votes: 500, color: "#8884d8" },
    { candidate: "Candidate B", votes: 700, color: "#82ca9d" },
    { candidate: "Candidate C", votes: 300, color: "#ffc658" },
    // Add more candidates as needed
  ];

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
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Bar>
    </DynamicBarChart>
  );
};

export default VotingChart;
