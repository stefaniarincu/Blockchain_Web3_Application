import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Countdown({
  title,
  description,
  days,
  hours,
  minutes,
  seconds,
}: {
  title: string;
  description: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <Card className="m-auto max-w-xl space-y-4 rounded-xl bg-white p-8 shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl font-bold tracking-tighter">
          {title}
        </CardTitle>
        <CardDescription className="text-lg text-gray-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 border-y py-4">
        <div className="flex justify-between">
          <div className="flex flex-col items-center">
            <Badge className="cursor-default rounded-full bg-gray-300 px-4 py-2 text-xl text-gray-700 hover:bg-white">
              {days}
            </Badge>
            <p className="mt-2 text-sm text-gray-500">Days</p>
          </div>
          <div className="flex flex-col items-center">
            <Badge className="cursor-default rounded-full bg-gray-300 px-4 py-2 text-xl text-gray-700 hover:bg-white">
              {hours}
            </Badge>
            <p className="mt-2 text-sm text-gray-500">Hours</p>
          </div>
          <div className="flex flex-col items-center">
            <Badge className="cursor-default rounded-full bg-gray-300 px-4 py-2 text-xl text-gray-700 hover:bg-white">
              {minutes}
            </Badge>
            <p className="mt-2 text-sm text-gray-500">Minutes</p>
          </div>
          <div className="flex flex-col items-center">
            <Badge className="cursor-default rounded-full bg-gray-300 px-4 py-2 text-xl text-gray-700 hover:bg-white">
              {seconds}
            </Badge>
            <p className="mt-2 text-sm text-gray-500">Seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
