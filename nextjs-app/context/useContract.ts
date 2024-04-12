import { useContext } from "react";
import { ContractContext } from "./ContractContext";

const useContract = () => {
  return useContext(ContractContext);
};

export default useContract;
