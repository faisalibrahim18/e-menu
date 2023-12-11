import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import Topbar from "../topbar/Topbar";
import Swal from "sweetalert2";
import Mt from "../../assets/mt.jpg";
import Cr from "../../assets/cart.jpg";
import { Link, useNavigate } from "react-router-dom";
import Ms from "../../assets/ms.png";
import Lg from "../../assets/logo.png";
import CheckOut from "../Products/CheckOut";

// import { checkTokenExpiration } from "../../utils/token";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetailItemId, setSelectedDetailItemId] = useState(null);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [dataBusiness, setDataBusiness] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const API_URL = import.meta.env.VITE_API_KEY;
  const navigate = useNavigate();

  const handleItemSelection = (itemId) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    if (item) {
      if (selectedItems.includes(itemId)) {
        setSelectedItems(
          selectedItems.filter((selectedItemId) => selectedItemId !== itemId)
        );

        // Cek apakah masih ada item lain dalam outlet yang dipilih, jika tidak, batalkan pemilihan outlet
        if (
          !selectedItems.some((selectedItemId) =>
            cart.find(
              (cartItem) =>
                cartItem.business === item.business && selectedItemId !== itemId
            )
          )
        ) {
          setSelectedOutlets(
            selectedOutlets.filter((outlet) => outlet !== item.business)
          );
        }
      } else {
        setSelectedItems([...selectedItems, itemId]);

        // Pilih outlet secara otomatis jika belum dipilih
        if (!selectedOutlets.includes(item.business)) {
          setSelectedOutlets([...selectedOutlets, item.business]);
        }
      }
    }
  };

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    // console.log("data", cartData[0]?.fullDataProduct);
    setDataBusiness(cartData[0]?.fullDataProduct);

    setLoading(false);
  }, []);

  const openModal = () => {
    // checkTokenExpiration();
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
        text: "Anda harus Login Terlebih dahulu!",
      });
      navigate("/");
    } else {
      const selectedOutletNames = Object.keys(selectedOutlets);
      // console.log(selectedOutletNames)
      if (selectedOutletNames.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Peringatan",
          text: "Anda harus memilih setidaknya satu item untuk checkout.",
        });
      } else if (selectedOutletNames.length > 1) {
        Swal.fire({
          icon: "error",
          title: "Peringatan",
          text: "Anda hanya dapat checkout dari satu outlet pada satu waktu.",
        });
      } else {
        // Izinkan untuk membuka modal jika semua kondisi telah terpenuhi
        setIsModalOpen(true);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    // Mengambil data dari localStorage
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartData);
    setLoading(false);
  }, []);
  // Fungsi untuk menghitung total harga
  const calculateTotalPrice = () => {
    let total = 0;
    cart.forEach((item) => {
      if (
        selectedItems.includes(item.id) &&
        selectedOutlets.includes(item.business)
      ) {
        total += item.priceItem * item.totalItem;
      }
    });
    return total;
  };

  const incrementQuantity = (item) => {
    const updatedCart = cart.map((cartItem) => {
      if (cartItem.id === item.id) {
        return { ...cartItem, totalItem: cartItem.totalItem + 1 };
      }
      return cartItem;
    });
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const decrementQuantity = (item) => {
    const updatedCart = cart.map((cartItem) => {
      if (cartItem.id === item.id && cartItem.totalItem > 1) {
        return { ...cartItem, totalItem: cartItem.totalItem - 1 };
      }
      return cartItem;
    });
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveFromCart = (itemId) => {
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menghapus item ini dari keranjang?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedCart = cart.filter((item) => item.id !== itemId);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        Swal.fire({
          icon: "success",
          title: "Item Telah Dihapus",
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            title: "text-sm",
          },
        }).then(() => {
          setClickCounts((prevClickCounts) => {
            const updatedClickCounts = { ...prevClickCounts };
            delete updatedClickCounts[itemId];
            return updatedClickCounts;
          });
          window.location.reload();
        });
      }
    });
  };

  const outletItems = {};
  // Group items by outlet
  cart.forEach((item) => {
    const outletId = item.fullDataProduct.Business.id;
    if (!outletItems[outletId]) {
      outletItems[outletId] = [];
    }
    outletItems[outletId].push(item);
  });
  return (
    <>
      <div className="block">
        <div className="">
          <h2 className="text-sm font-bold mb-4">Keranjang Belanja</h2>

          {cart && cart.length === 0 ? (
            <div className="block text-center m-0">
              {" "}
              {/* Menambahkan class "text-center" untuk pusatkan teks */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={Cr}
                  alt="Keranjang kosong"
                  style={{
                    maxWidth: "70%", // Maksimum lebar gambar adalah lebar container
                    height: "auto", // Tinggi gambar akan menyesuaikan
                    display: "block", // Agar gambar tidak memiliki margin bawah tambahan
                    margin: "0 auto", // Pusatkan gambar horizontal
                  }}
                />
                <div className="font-semibold text-sm text-gray-500 mt-0">
                  {" "}
                  {/* Menambahkan "mt-4" untuk jarak atas */}
                  Keranjang belanja Anda masih kosong.
                </div>
              </div>
            </div>
          ) : (
            <div>
              {Object.keys(outletItems).map((outletId) => (
                <div
                  key={outletId}
                  className="border p-2 mb-4  border-[#6E205E] rounded-lg mt-2"
                >
                  <div className="flex items-center">
                    <div>
                      <Link className="text-lg font-semibold text-gray-900 mt-4">
                        {outletItems[outletId][0].fullDataProduct.Business.name}
                      </Link>
                    </div>
                  </div>

                  <div>
                    {outletItems[outletId].map((item) => (
                      <div
                        className="flex mt-2 py-2 flex-wrap justify-between items-center border shadow-sm shadow-[#6E205E]  rounded-lg mb-1 lg:mx-2"
                        key={item.id}
                      >
                        <div className="flex items-center pl-2">
                          <input
                            type="checkbox"
                            className="mr-1"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleItemSelection(item.id)}
                          />
                          <div>
                            <img
                              src={
                                item.imageItem == null
                                  ? Lg
                                  : `${API_URL}/${item.imageItem}`
                              }
                              alt=""
                              className="shadow object-cover w-20 h-20 border rounded-md"
                            />
                          </div>
                        </div>
                        <div className="flex-1  pl-3">
                          <div className="mb-2 text-sm font-semibold tracking-tight text-gray-900">
                            <Link to={`/products/detail/${item.id}`}>
                              {" "}
                              {item.nameItem}
                            </Link>
                          </div>
                          <div className="flex items-center text-base font-medium text-center text-gray-500">
                            <button
                              className={`px-2 py-0.5 bg-[#6E205E] rounded-full text-white text-xs ${
                                item.quantity === 1
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() => decrementQuantity(item)}
                              disabled={item.totalItem === 1}
                            >
                              <FaMinus />
                            </button>
                            <p className="font-bold pl-2 pr-2">
                              {item.totalItem}
                            </p>
                            <button
                              className="px-2 py-0.5 bg-[#6E205E] rounded-full text-white text-xs"
                              onClick={() => incrementQuantity(item)}
                            >
                              <FaPlus />
                            </button>
                          </div>
                          <div className="text-base text-gray-600">
                            Rp{" "}
                            {(item.priceItem * item.totalItem).toLocaleString(
                              "id-ID"
                            )}
                          </div>
                        </div>
                        <div className="flex mr-3 mt-3.5">
                          <button
                            className="bg-[#6E205E] rounded-xl text-white font-semibold  text-xs  p-2 hover:bg-[#8f387d]"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart && cart.length === 0 ? (
          <div></div>
        ) : (
          <div className="text-sm">
            <div className=" w-full ">
              <div className="border border-[#6E205E] p-1.5 rounded-xl">
                <div className="flex">
                  <div className=" text-gray-500  w-3/5">
                    <div>Total Harga :</div>
                  </div>
                  <div className="">
                    <div>Rp {calculateTotalPrice()}</div>
                  </div>
                </div>
              </div>

              {/* Tombol Check Out */}

              <div className="pt-2">
                <button
                  onClick={openModal}
                  className="bg-[#6E205E] w-full text-white px-20 py-2 rounded-lg hover:bg-[#8f387d]"
                >
                  CheckOut
                </button>
                {/* <Link to={"/CheckOut"}>
                  <button className="bg-[#6E205E] text-white w-full p-2 hover:bg-[#8f387d] rounded-2xl">
                    Check Out
                  </button>
                </Link> */}
              </div>
            </div>
          </div>
        )}
        {/* Total Harga */}
      </div>
      {isModalOpen && (
        <CheckOut
          isOpen={isModalOpen}
          closeModal={closeModal}
          loading={loading}
          selectedItems={selectedItems} // Pass selected item IDs to the Checkout component
          selectedOutlets={selectedOutlets} // Pass selected item IDs to the Checkout component
        />
      )}
    </>
  );
};

export default Cart;
