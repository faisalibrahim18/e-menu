import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProductsDetail from "./pages/Products/ProductsDetail";
import ProductKeranjang from "./pages/Products/ProductKeranjang";
import ProductList from "./pages/menu/products/ProductList";
import Scanner from "./components/Auth/Scanner";
import GetDataTable from "./components/Data/GetDataTable";
import NotAccess from "./pages/NotAccess/NotAccess";

const { PUBLIC_URL } = import.meta.env;
function App() {
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Simulasikan inisialisasi aplikasi
  //   setTimeout(() => {
  //     setLoading(false); // Matikan loading setelah selesai inisialisasi
  //   }, 1500); // Gantilah ini dengan logika inisialisasi sebenarnya
  // }, []);

  return (
    <>
      <BrowserRouter basename={PUBLIC_URL}>
        <Routes>
          <Route exact path="/scan" element={<Scanner />} />
          <Route exact path="/menu/order/all-menu" element={<ProductList />} />
          <Route
            exact
            path="/products/detail/:id"
            element={<ProductsDetail />}
          />
          <Route
            exact
            path="/get-data/:tableId/:businessId"
            element={<GetDataTable />}
          />
          <Route
            exact
            path="/products/keranjang"
            element={<ProductKeranjang />}
          />
          <Route exact path="/" element={<NotAccess />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
