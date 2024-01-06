import React, { useEffect, useState, reduce, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Topbar from "../topbar/Topbar";
import Loading from "../Loading/Loading";
import Swal from "sweetalert2";
import { FaMinus, FaPlus } from "react-icons/fa";
import Lg from "../../assets/logo.png";

// / Initial state for the reducer
const initialState = {
  salesType: "", // Add other initial state properties as needed
};

// Reducer function to handle state updates
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SALES_TYPE":
      return { ...state, salesType: action.payload };
    // Handle other cases as needed
    default:
      return state;
  }
};
const ProductDetail = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { id } = useParams();
  const [detail, setDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  // const [totalItem, setQuantity] = useState(1);
  const [salesType, setSalesType] = useState([]);
  const [handleSelect, setHandleSelect] = useState([]);
  // console.log("sasas", handleSelect);
  const [product, setProduct] = useState({});
  const [notes, setNotes] = useState("");
  const [statusTable, setStatusTable] = useState("");
  const [allAddons, setAllAddons] = useState([]);
  const [selectedSalesTypeId, setSelectedSalesTypeId] = useState(""); // Define selectedSalesTypeId state
  // console.log("id", selectedSalesTypeId);
  const [allSelectAddOns, setAllSelectAddOns] = useState([]);

  // console.log(statusTable)

  const [totalItem, setTotalItem] = useState(1);
  const API_URL = import.meta.env.VITE_API_KEY;

  const isSameCartItem = (itemA, itemB) => {
    // return item1.idItem === item2.idItem;
    return (
      (itemA.id && itemA.id === itemB.id) ||
      (itemA.idItem && itemA.idItem === itemB.id)
    );
  };

  useEffect(() => {
    getAllSalesType();
    handleGetProduct();
    handleCheckTable();
    handleSelectSalesType();
  }, []);
  const handleSelectSalesType = (data, index) => {
    try {
      if (data && data.id) {
        setSelectedSalesTypeId(data.id);
        dispatch({ type: "SET_SALES_TYPE", payload: data.id });
      } else {
        // console.error("Invalid data or missing 'id' property.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSalesType = async () => {
    try {
      const token = localStorage.getItem("token");
      const dataTable = JSON.parse(localStorage.getItem("data_table"));

      const response = await axios.get(
        `${API_URL}/api/v1/sales-type/guest?business_id=${dataTable.businessId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the state with the sales types
      setSalesType(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // console.log("dsdsa", getSalesType);
    getSalesType();
  }, []);

  const goBack = () => {
    // Navigate back one step
    navigate(-1);
  };
  const handleSelectAllAddons = (data2, index, data) => {
    const data2_temp = { ...data2, group_id: data.id };

    // Check if the add-on is already selected
    const isSelected = allSelectAddOns.some(
      (element) => element.id === data2_temp.id
    );

    if (isSelected) {
      // If already selected, remove it from the selection
      setHandleSelect((prevHandleSelect) =>
        prevHandleSelect.filter(
          (element) => element !== `${index},${data2_temp.id}`
        )
      );

      setAllSelectAddOns((prevAllSelectAddOns) =>
        prevAllSelectAddOns.filter((element) => element.id !== data2_temp.id)
      );
    } else {
      // If not selected, add it to the selection
      setHandleSelect((prevHandleSelect) => [
        ...prevHandleSelect,
        `${index},${data2_temp.id}`,
      ]);

      setAllSelectAddOns((prevAllSelectAddOns) => [
        ...prevAllSelectAddOns,
        data2_temp,
      ]);
    }
  };

  const handleAddCart = () => {
    try {
      // Calculate the total price including addons
      const addonsTotalPrice = allSelectAddOns.reduce(
        (total, addon) => total + addon.price,
        0
      );

      const amount = product.price + addonsTotalPrice;

      const cartItem = {
        id: product.id,
        nameItem: product.name,
        priceItem: amount,
        descriptionItem: product.description || null,
        imageItem: product.image || null,
        totalItem: totalItem,
        updateAddons: handleSelect,
        fullDataAddons: allSelectAddOns,
        fullDataProduct: product,
        allAddons: allSelectAddOns,
        totalAmount: amount * totalItem,
        notes: notes,
        salesTypeId: selectedSalesTypeId,
      };
      console.log("cartItem", cartItem);

      // Get existing cart data from localStorage
      const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

      // Check if the item already exists in the cart
      const existingCartItem = existingCart.find((item) =>
        isSameCartItem(item, cartItem)
      );

      if (existingCartItem) {
        // If the item already exists, update the totalItem and total amount
        // const existingCartItem = existingCart[existingCartItemIndex];
        existingCartItem.totalItem += totalItem;
        existingCartItem.totalAmount += cartItem.totalAmount;
        existingCartItem.notes = notes;
        existingCartItem.salesTypeId = selectedSalesTypeId;
      } else {
        // If it's a new item, add it to the cart
        existingCart.push(cartItem);
      }

      // Save the updated cart data to localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));

      // Show success message or perform other actions
      Swal.fire({
        icon: "success",
        title: "Item Ditambahkan ke Keranjang",
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          title: "text-lg",
        },
      }).then(() => {
        // You might want to navigate back or perform other actions
        goBack();
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      // Handle errors as needed
    }
  };

  const handleCheckTable = async () => {
    try {
      const token = localStorage.getItem("token");
      const dataTable = JSON.parse(localStorage.getItem("data_table"));
      const response = await axios.get(
        `${API_URL}/api/v1/table-management/cust/${dataTable.tableId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatusTable(response.data.data.status);
      // setAllDataTable(data.data);
      // console.log("check table", response.data.data.status);
    } catch (error) {
      console.log(error);
    }
  };
  const handleGetProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/v1/product/find-product/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProduct(response.data.data);

      // console.log("data.data", response);
      const groupAddons = JSON.parse(
        JSON.stringify(response.data.data.Group_Addons)
      );
      // console.log("groupAddons", groupAddons);
      // groupAddons.forEach((value) => {
      //   setAllAddons((prevAllAddons) => [...prevAllAddons, value]);
      // });
      setAllAddons(groupAddons);
      if (response.data.data.image) {
        response.data.data.image;
      } else {
        response.data.data.image = "";
      }
      // console.log("data ===>", response.data.data);
      // setProduct(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllSalesType = async () => {
    try {
      const token = localStorage.getItem("token");
      const dataTable = JSON.parse(localStorage.getItem("data_table"));

      const response = await axios.get(
        `${API_URL}/api/v1/sales-type/guest?business_id=${dataTable.businessId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("salesType", response);
      setSalesType(response.data.data);
      // data.data.forEach((value) => {
      //   setSalesType((prevSalesType) => [...prevSalesType, value]);
      // });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const getData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_KEY;
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/v1/product/find-product/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response);
        setDetail(response.data.data);
        setLoading(false);
      } catch (error) {
        if (error.response) {
          console.log(error.response.data.message);
          setLoading(false);
        }
      }
    };
    getData();
  }, [id]);

  const openModal = (imageUrl) => {
    // Fungsi untuk membuka modal
    const modalImage = document.getElementById("modalImage");
    modalImage.src = imageUrl;
    const modal = document.getElementById("imageModal");
    modal.classList.remove("hidden");
  };

  const closeModal = () => {
    // Fungsi untuk menutup modal
    const modal = document.getElementById("imageModal");
    modal.classList.add("hidden");
  };

  const incrementQuantity = () => {
    setTotalItem(totalItem + 1);
  };

  const decrementQuantity = () => {
    if (totalItem > 1) {
      setTotalItem(totalItem - 1);
    }
  };
  const navigate = useNavigate();
  // Gunakan useEffect untuk memperbarui localStorage ketika cart berubah
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  return (
    <>
      <Topbar detail={detail} loading={loading} />
      {loading ? (
        <div className="pt-20 flex text-center justify-center items-center h-screen">
          <Loading />
        </div>
      ) : (
        <div className="bg-gray-100  pt-14" key={detail.id}>
          <div className="lg:p-12  sm:p-7 flex flex-wrap lg:justify-center md:flex-nowrap bg-white">
            <div className="flex-wrap l">
              <img
                src={detail.image == null ? Lg : `${API_URL}/${detail.image}`}
                className="lg:w-72 lg:h-72 md:w-96 md:h-80  w-screen h-52 lg:rounded-xl md:rounded-xl object-cover cursor-pointer shadow-xl"
                alt={detail.name}
                onClick={
                  () =>
                    openModal(
                      detail.image == null ? Lg : `${API_URL}/${detail.image}`
                    ) // Buka modal dengan gambar yang diklik
                }
              />
            </div>
            <div className="lg:pl-10 pt-5 pl-2 md:pl-10 lg:pr-20 flex-wrap lg:pt-10">
              <div className=" text-3xl font-bold tracking-tight text-gray-900">
                {detail.name}
              </div>
              <div className="flex">
                <div className=" rounded-lg font-normal text-gray-500">
                  {detail.Product_Category?.name}
                </div>
              </div>

              <div className="inline-flex items-center lg:pt-16 md:pt-16 py-2 text-2xl font-medium text-center text-black">
                Rp {detail.price.toLocaleString("id-ID")}
              </div>
              <div className="lg:flex md:flex hidden  mr-5 right-0">
                <div className="bg-[#6E205E] rounded-xl flex items-center justify-between py-2 mr-4 ">
                  <button
                    className={`px-4 pl-5 text-white cursor-pointer hover:opacity-70 duration-500 ${
                      totalItem === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={decrementQuantity}
                    disabled={totalItem === 1}
                  >
                    <FaMinus />
                  </button>
                  <p className="font-bold text-white pl-4 pr-4">{totalItem}</p>
                  <button
                    className="px-5 hover:opacity-70 text-white cursor-pointer duration-500"
                    onClick={incrementQuantity}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* description mobile */}
          <div className="bg-white pl-2 lg:p-12 lg:mt-8 pt-3 lg:pl-12 pr-12 lg:pb-12 pb-6 block">
            <div className="font-semibold mb-2">Description :</div>
            <div className="">
              {detail.description === "null" ? (
                <p>Tidak Ada Description</p>
              ) : detail.description === null ? (
                <p>Tidak Ada Description</p>
              ) : (
                <p>{detail.description}</p>
              )}
            </div>
          </div>
          <hr className="" />
          <div className="pt-2 pl-2 bg-white pb-3 ">
            {" "}
            {/* add-On */}
            <div className="">
              {allAddons.length > 0 ? (
                <>
                  <h5 className="font-semibold">Available Add-On</h5>
                  <hr />
                  {allAddons.map((data, index) => (
                    <div key={index}>
                      <h6 className="mb-2 font-semibold">{data.name}</h6>
                      {data.type === "single" ? (
                        <div>
                          {data.Addons.map((data2, index2) => (
                            <div
                              key={index2}
                              onClick={() =>
                                handleSelectAllAddons(data2, index, data)
                              }
                            >
                              <div
                                className={`border cursor-pointer md:w-[400px] border-[#6E205E] flex mb-2 mr-2 rounded-lg p-1 pl-3 text-sm text-gray-700 hover:bg-[#6E205E] hover:text-white ${
                                  handleSelect.some(
                                    (element) =>
                                      element === `${index},${data2.id}`
                                  )
                                    ? "bg-[#6E205E] text-white"
                                    : ""
                                }`}
                              >
                                <div className="flex-grow">
                                  <p className="">{data2.name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="items-end flex ml-2 mr-1.5">
                                    Rp. {data2.price.toLocaleString("id-ID")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          {data.Addons.map((data2, index2) => (
                            <div
                              key={index2}
                              onClick={() =>
                                handleSelectAllAddons(data2, index, data)
                              }
                            >
                              <div
                                className={`border cursor-pointer   md:w-[400px] border-[#6E205E] flex mb-2 mr-2 rounded-lg p-1 pl-3 text-sm text-gray-700 hover:bg-[#6E205E] hover:text-white ${
                                  allSelectAddOns.some(
                                    (element) => element.id === data2.id
                                  )
                                    ? "selected "
                                    : ""
                                }`}
                              >
                                <p className="title-choose-size">
                                  {data2.name}
                                </p>
                                <p className="justify-end items-end flex text-right">
                                  Rp. {data2.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <h5 className="available-addon">Add-On Not Available</h5>
              )}
            </div>
          </div>

          {/* sales type */}
          {/* <hr className="" />
          <div className=" pl-2 bg-white pb-3">
            <div className="font-semibold">Sales Type</div>
            {salesType.map((data, index) => (
              <div
                key={index}
                onClick={() => handleSelectSalesType(data, index)}
                className="mt-2 mr-2"
              >
                <div
                  className={`flex mb-3 cursor-pointer text-sm text-gray-700 md:w-[400px] border border-[#6E205E] rounded-lg p-1 hover:bg-[#6E205E] hover:text-white ${
                    selectedSalesTypeId === data.id
                      ? "bg-[#6E205E] text-white"
                      : ""
                  }`}
                >
                  <p className="pl-2">{data.name}</p>
                </div>
              </div>
            ))}
          </div> */}

          {/* notes */}
          <div className="pl-2 mr-2 bg-white">
            <label className="flex mb-1.5">
              <div className="font-semibold">Notes</div>
              <div className="font-semibold ml-1 text-gray-400">
                (optional)
              </div>{" "}
            </label>
            <textarea
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-md text-sm p-1.5 w-full border border-gray-400 focus:border-[#6E205E] focus:ring-[#6E205E] focus:outline-none focus:ring focus:ring-opacity-5"
              rows={4}
              cols={50}
              placeholder="Type something here..."
            />
          </div>

          {/* Modal gambar */}
          <div
            id="imageModal"
            className="fixed z-50 top-0 left-0 w-full h-full flex hidden items-center justify-center bg-black bg-opacity-60 transition-opacity  rounded-lg"
          >
            <div className="relative  max-w-xl mx-auto">
              <img
                id="modalImage"
                src={detail.image == null ? Lg : `${API_URL}/${detail.image}`} // Gunakan gambar default jika gambar modal tidak ada
                className=" rounded-lg"
                alt="Modal"
              />
              <button
                id="closeModal"
                className="absolute top-4 right-4 text-white text-3xl hover:text-[#a02e89]"
                onClick={() => closeModal()} // Tutup modal saat tombol close diklik
              >
                &times;
              </button>
            </div>
          </div>

          <div className="lg:block flex justify-center lg:p-2 p-4">
            <div className="lg:hidden md:hidden block lg:ml-10 lg:mr-0 mr-2">
              <div
                className={`bg-[#6E205E] rounded-xl flex items-center justify-between py-2 ${
                  statusTable === "used"
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:opacity-70"
                }`}
              >
                <button
                  className={`px-4 pl-5 text-white cursor-pointer hover:opacity-70 duration-500 ${
                    totalItem === 1 || statusTable === "used"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={
                    statusTable === "used" ? undefined : decrementQuantity
                  }
                  disabled={totalItem === 1 || statusTable === "used"}
                >
                  <FaMinus />
                </button>
                <p className="font-bold text-white pl-4 pr-4">{totalItem}</p>
                <button
                  className={`px-5 hover:opacity-70 text-white cursor-pointer duration-500 ${
                    statusTable === "used"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={
                    statusTable === "used" ? undefined : incrementQuantity
                  }
                  disabled={statusTable === "used"}
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="lg:flex">
              <div className="lg:w-2/5"></div>
              <div className="">
                {" "}
                <button
                  className={`text-white bg-[#6E205E] rounded-xl  font-semibold lg:pl-20 lg:pr-20 md:pl-20 md:pr-20 pl-8 pr-8 py-2  ${
                    statusTable === "used"
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:opacity-70"
                  }`}
                  onClick={handleAddCart}
                  disabled={statusTable === "used"}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
