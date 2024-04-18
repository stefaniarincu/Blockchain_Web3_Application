import React from "react";
import { Input } from "./ui/input";
import useContract from "@/context/useContract";

const GasPriceInput = () => {
  const { gasPrice, setGasPrice } = useContract();

  return (
    <div className="flex w-[30%] items-center gap-3">
      <label className="text-nowrap">Gas Price</label>
      <Input
        value={gasPrice}
        onChange={(e) => {
          setGasPrice(e.target.value);
        }}
        type="number"
        placeholder="Gas Price"
        className="w-full"
        min={0}
        step={1000}
      />
    </div>
  );
};

export default GasPriceInput;
