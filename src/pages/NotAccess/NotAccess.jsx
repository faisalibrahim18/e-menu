import React from "react";
import ntAc from "../../assets/ntac.jpg";
const NotAccess = () => {
  return (
    <div className="md:flex justify-center items-center">
      <img src={ntAc} className="w-[500px] " alt="" />
      <div className="text-center text-gray-600 font-semibold">
        You don't have a token to access the page yet.
      </div>
    </div>
  );
};

export default NotAccess;
