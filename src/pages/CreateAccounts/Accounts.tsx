import React from "react";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import Button from "../../components/ui/button/Button";

const Accounts = () => {
  return (
    <div>
      <div className="flex justify-end items-end mr-12 mb-1 ">
        <Button
          size="md"
          variant="primary"
          onClick={() => {}}
          endIcon={<span className="font-bold text-2xl">+</span>}
        >
          Add Account/User
        </Button>
      </div>
      <RecentOrders />
    </div>
  );
};

export default Accounts;
