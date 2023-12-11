import { useNavigate } from "react-router-dom";
import CheckOut1 from "../../components/Products/CheckOut";
import BottomBar from "../../components/bottombar/BottomBar";
import { useEffect } from "react";
import { checkTokenExpiration } from "../../utils/token";
import Swal from "sweetalert2";

const CheckOut = () => {
  const navigate = useNavigate();
  useEffect(() => {
    checkTokenExpiration();
    const token = localStorage.getItem("token");
    if (!token) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-right",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "warning",
        text: "You don't have access!",
      });
      navigate("/");
    }
  });
  return (
    <>
      {" "}
      <div className="">
        <CheckOut1 />
      </div>
      <BottomBar />
    </>
  );
};

export default CheckOut;
