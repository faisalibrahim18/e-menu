import React, { useEffect } from "react";
import ProductList1 from "../../../components/menu/product/ProductList";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { checkTokenExpiration } from "../../../utils/token";

const ProductList = () => {
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
    <div>
      <ProductList1 />
    </div>
  );
};

export default ProductList;
