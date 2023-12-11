import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import Cr from "../../assets/cart.jpg";
import Lg from "../../assets/logo.png";
import CheckOut from "./CheckOut";
import { Link, useNavigate } from "react-router-dom";
import ProductNavbar from "../topbar/ProductNavbar";
import Topbar from "../topbar/Topbar";
import { BiDetail } from "react-icons/bi";
import DetailKeranjang from "./DetailKeranjang";

const ProductKeranjang = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetail, setIsModalDetail] = useState(false);
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

  const openModal = () => {
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
          text: "Anda harus memilih setidaknya satu item untuk pesan.",
        });
      } else if (selectedOutletNames.length > 1) {
        Swal.fire({
          icon: "error",
          title: "Peringatan",
          text: "Anda hanya dapat pesan dari satu outlet pada satu waktu.",
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
  const openModalDetail = (itemId) => {
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
      setIsModalDetail(true);
      setSelectedDetailItemId(itemId);
    }
  };
  const closeModalDetail = () => {
    setIsModalDetail(false);
  };
  const fetchItemDetails = (itemId) => {
    try {
      // Get the cart data from localStorage
      const cartData = JSON.parse(localStorage.getItem("cart")) || [];

      // Find the item in the cart based on itemId
      const selectedItem = cartData.find((item) => item.id === itemId);

      // Return the details of the selected item
      return selectedItem;
    } catch (error) {
      console.error("Error fetching item details:", error);
      throw error; // Handle the error appropriately in your application
    }
  };

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartData);
    setLoading(false);
  }, []);
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
      {/* <Topbar detail={cart} loading={loading} /> */}
      <ProductNavbar products={cart} loading={loading} />
      <div className="pt-20">
        <div className="lg:pl-12 p-5 lg:flex-1 md:flex block">
          <div className="lg:w-2/3 md:w-2/3">
            <h2 className="text-2xl font-bold">Keranjang Belanja</h2>

            {cart && cart.length === 0 ? (
              <div className="text-center flex justify-center lg:pl-96 md:pl-56">
                <div className="flex flex-col justify-center items-center">
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
                  <div className="font-semibold text-gray-500">
                    Keranjang belanja Anda masih kosong.
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {Object.keys(outletItems).map((outletId) => (
                  <div
                    key={outletId}
                    className="border p-2 mb-4 border-[#6E205E] rounded-lg mt-2"
                  >
                    <div className="flex items-center">
                      <div>
                        <Link className="text-lg font-semibold text-gray-900 mt-4">
                          {
                            outletItems[outletId][0].fullDataProduct.Business
                              .name
                          }
                        </Link>
                      </div>
                    </div>

                    {outletItems[outletId].map((item) => (
                      <div key={item.id}>
                        <div
                          className="flex mt-3 flex-shrink-0 flex-wrap justify-between items-center shadow-[#6E205E] shadow-sm border rounded-lg mb-4 p-2 lg:mx-4"
                          key={item.id}
                        >
                          <div className="flex items-center pl-">
                            <div className="flex">
                              <input
                                type="checkbox"
                                className="mr-3"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleItemSelection(item.id)}
                              />

                              <img
                                src={
                                  item.imageItem == null
                                    ? Lg
                                    : `${API_URL}/${item.imageItem}`
                                }
                                alt=""
                                className="shadow object-cover w-20 h-20 border rounded-md pl-"
                              />
                            </div>
                          </div>
                          <div className="flex-1 lg:pl-5 lg:pr-20 pt-3 pl-3.5 max-w-[your-max-width] flex-shrink-0">
                            <div className="lg:text-xl w-auto md:text-lg text-md font-semibold tracking-tight text-gray-900 whitespace-nowrap overflow-hidden overflow-ellipsis">
                              <Link to={`/products/detail/${item.id}`}>
                                {item.nameItem}
                              </Link>
                            </div>
                            <div className="flex items-center py-2 text-lg font-medium text-center text-gray-500">
                              <button
                                className={`px-1.5 py-0.5 bg-[#6E205E] rounded-full text-white text-sm ${
                                  item.total === 1
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
                                className="px-1.5 py-0.5 bg-[#6E205E] rounded-full text-white text-sm"
                                onClick={() => incrementQuantity(item)}
                              >
                                <FaPlus />
                              </button>
                            </div>
                            <div className="py-2 text-lg text-gray-500">
                              Rp{" "}
                              {(item.priceItem * item.totalItem).toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div>
                            {" "}
                            <div className=" lg:mt-0 mr-3 ml-auto">
                              <button
                                className="bg-[#6E205E] rounded-2xl p-1.5 mb-2  text-white font-semibold  hover-bg-[#8f387d]"
                                onClick={() => openModalDetail(item.id)}
                              >
                                <BiDetail />
                              </button>
                            </div>
                            <div className="  lg:mt-0 mr-2">
                              <button
                                className="bg-[#6E205E] rounded-2xl text-white font-semibold p-1.5 hover-bg-[#8f387d]"
                                onClick={() => handleRemoveFromCart(item.id)}
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

             
              </div>
            )}
          </div>
          {cart && cart.length === 0 ? (
            <div></div>
          ) : (
            <div className="lg:w-1/3  md:w-1/2 md:pt-4">
              <div className="lg:pl-10 md:pl-5 w-full">
                <div className="border border-[#e4c0dd] mt-8 p-3 rounded-2xl">
                  <div className="flex">
                    <div className=" text-gray-500 md:w-2/3 w-3/4">
                      <div>Total Harga :</div>
                    </div>
                    <div className="">
                      <div>
                        Rp {calculateTotalPrice().toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 ">
                  <div className="w-full">
                    <button
                      onClick={openModal}
                      className="bg-[#6E205E] w-full text-white px-20 py-2 rounded-2xl hover-bg-[#8f387d]"
                    >
                      Pesan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {isModalDetail && (
        <DetailKeranjang
          itemId={selectedDetailItemId}
          onClose={closeModalDetail}
          fetchItemDetails={fetchItemDetails} 
        />
      )}
      {isModalOpen && (
        <CheckOut
          dataBusiness={dataBusiness}
          isOpen={isModalOpen}
          closeModal={closeModal}
          loading={loading}
          selectedItems={selectedItems}
          selectedOutlets={selectedOutlets} 
        />
      )}
    </>
  );
};

export default ProductKeranjang;
