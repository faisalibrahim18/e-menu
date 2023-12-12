import { Link, useLocation } from "react-router-dom";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import Lg from "../../assets/lg.png";
import Mt from "../../assets/mt.jpg";
import Cart from "./Cart";
import "animate.css/animate.min.css"; // Impor animate.css

const ProductNavbar = ({ loading }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [nameBusiness, setNameBusiness] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 448);

  const location = useLocation();
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 448);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Mengambil data dari localStorage
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartData);
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Menghitung total item dalam keranjang
  const totalItems = cart.length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mengambil API_URL dari variabel lingkungan
        const API_URL = import.meta.env.VITE_API_KEY;

        // Mengambil token dari localStorage
        const token = localStorage.getItem("token");

        // Mengambil data_table dari localStorage
        const data = JSON.parse(localStorage.getItem("data_table"));

        // Memeriksa apakah data_table sesuai dengan format yang diharapkan
        if (
          data &&
          typeof data === "object" &&
          data.hasOwnProperty("tableId") &&
          data.hasOwnProperty("businessId")
        ) {
          // Membuat array yang berisi satu elemen (data tersebut)
          const dataArray = [data];

          // Mengambil businessId dari setiap objek dalam array
          const businessIds = dataArray.map((item) => item.businessId);
          // console.log("businessIds", businessIds);
          const response = await axios.get(
            `${API_URL}/api/v1/business/${businessIds[0]}`, // Mengambil businessId pertama dari array
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setNameBusiness(response.data.data.name);
          // console.log("databusiness", response.data.data.name);
        } else {
          console.error("Data tidak sesuai dengan format yang diharapkan.");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData(); // Memanggil fungsi fetchData
  }, []); // useEffect akan dijalankan saat komponen di-mount
  const [isCartPage, setIsCartPage] = useState(false);

  useEffect(() => {
    // Update isCartPage state based on the current location
    setIsCartPage(location.pathname === "/products/keranjang");
  }, [location]);

  return (
    <>
      <nav className="bg-[#6E205E] shadow-md fixed w-full z-50  mx-auto px-3 sm:px-6 lg:px-8">
        <div className="lg:block md:block items-center justify-between h-[60px]">
          <div className="flex items-center ">
            <div className="flex-shrink-0">
              {isCartPage ? (
                <div
                  className="font-semibold text-white text-xl -mt-[10px] cursor-pointer"
                  onClick={() => window.history.back()}
                >
                  <FaArrowLeft />
                </div>
              ) : (
                <Link to={"/menu/order/all-menu"}>
                  <div className="font-semibold text-white flex -mt-[14px]">
                    <div className="text-3xl transform -rotate-12 -mt-[5px]">
                      e
                    </div>
                    <div className="text-3xl text-yellow-500 -mt-1">-</div>
                    <div className="text-xl mt-0.5">Menu</div>
                  </div>
                </Link>
              )}
            </div>

            <div className="w-full text-white font-semibold -mt-[12px]  text-center">
              {nameBusiness}
            </div>
            <div className="text-2xl ">
              <div className="relative inline-block text-left -mt-[12px]">
                <Link
                  to={"/products/keranjang"}
                  className="text-white px-4 py-2 rounded-md  focus:outline-none hover:text-gray-200"
                  // onClick={handleClick}
                  onMouseEnter={toggleCart}
                  // onMouseLeave={closeCart}
                >
                  <FaShoppingCart />
                  {isCartPage ? (
                    <div></div>
                  ) : (
                    <div>
                      {" "}
                      {totalItems > 0 && ( // Tampilkan notifikasi angka hanya jika ada item dalam keranjang
                        <span className="absolute top-[22px] right-0 bg-red-500 text-white rounded-full px-1 text-xs">
                          {totalItems}
                        </span>
                      )}{" "}
                    </div>
                    // <Link to={"/menu/order/all-menu"}>
                    //   <div className="font-semibold text-white flex">
                    //     <div className="text-3xl transform -rotate-12 -mt-1.5 mr-">
                    //       e
                    //     </div>
                    //     <div className="text-3xl text-yellow-500 -mt-1">-</div>
                    //     <div className="text-xl mt-0.5">Menu</div>
                    //   </div>
                    // </Link>
                  )}
                  {/* {totalItems > 0 && ( // Tampilkan notifikasi angka hanya jika ada item dalam keranjang
                    <span className="absolute top-5 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
                      {totalItems}
                    </span>
                  )} */}
                </Link>
                <div
                  className={`${
                    isCartOpen
                      ? "cart-dropdown absolute ml-20 right-0 w-[350px] rounded-md shadow-lg mt-3 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-auto cart-dropdown-animation md:block hidden"
                      : "hidden"
                  }`}
                  onMouseLeave={closeCart}
                >
                  <div className="cart-items p-4 ">
                    <Cart cart={cart} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <hr  className="-mt-[26px]"/> */}
      </nav>
    </>
  );
};

export default ProductNavbar;
