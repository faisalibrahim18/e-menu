import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function GetDataTable() {
  // Use the useHistory hook for programmatic navigation
  const navigate = useNavigate();
  // Use the useParams hook to get route parameters
  const { tableId, businessId } = useParams();

  // Use the useEffect hook to mimic the mounted lifecycle event
  useEffect(() => {
    loginGuest();
  }, []);
  const API_URL = import.meta.env.VITE_API_KEY;
  // Define the loginGuest function
  async function loginGuest() {
    try {
      if (!localStorage.getItem("token")) {
        // Make an HTTP GET request using axios
        const { data } = await axios.get(`${API_URL}/api/v1/auth/guest/login`);

        // Set the token in localStorage
        localStorage.setItem("token", data.data);
      }

      // Create a dataTable object using route parameters
      const dataTable = {
        tableId: tableId,
        businessId: businessId,
      };

      // Set data_table in localStorage and remove data_outlet
      localStorage.setItem("data_table", JSON.stringify(dataTable));
      localStorage.removeItem("data_outlet");
      localStorage.setItem("with_scan", "YES");

      //   console.log("data dari qr", dataTable);
      // Programmatically navigate to the 'Menu' route with the 'order' type
      navigate("/menu/order/all-menu");
    } catch (error) {
      console.error("Error during loginGuest:", error);
    }
  }

  // Render an empty div
  return <div></div>;
}

export default GetDataTable;
