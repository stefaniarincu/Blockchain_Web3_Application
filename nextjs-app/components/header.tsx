import React from "react";
import { Button } from "./ui/button";
import useContract from "@/context/useContract";
import { Badge } from "./ui/badge";
import GasPriceInput from "./gas-price-input";

const Header = () => {
  const { currentAccount, adminAccount, connectWallet } = useContract();
  return (
    <div className="fixed z-50 top-0 shadow-md bg-white w-full leading-[5rem] px-10 flex justify-between">
      <div className="font-bold text-[20px]">BOBERT</div>
      <GasPriceInput />
      <div>
        {currentAccount ? (
          <>
            <Button className="cursor-default" variant="outline">
              Wallet Connected
            </Button>
            {currentAccount == adminAccount && (
              <Badge variant="destructive" className="ml-5">
                Admin
              </Badge>
            )}
          </>
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
};

export default Header;
