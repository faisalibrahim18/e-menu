import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Loading from "../Loading/Loading";
import Mt from "../../assets/mt.jpg";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

function CheckOut({
  isOpen,
  closeModal,
  setIsModalOpen,
  dataBusiness,
  selectedItems,
  selectedOutlets,
}) {
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [checkoutTime, setCheckoutTime] = useState(new Date());
  const [TRANSIDMERCHANT] = useState(nanoid(12));
  const [nominal, setNominal] = useState(0);
  const [urlVendor, setUrlVendor] = useState(""); // Mendefinisikan urlVendor sebagai state dengan nilai awal kosong
  // console.log("sasa", dataBusiness)
  const API_URL = import.meta.env.VITE_API_KEY;
  const [disabledButton, setDisabledButton] = useState(false);
  const [dateTime, setDateTime] = useState("2021/06/27 16:00:00");
  const [resDate, setResDate] = useState(null);
  const [resTime, setResTime] = useState(null);
  const [dataOutlet, setDataOutlet] = useState(
    localStorage.getItem("data_outlet") || null
  );
  const [dataTable, setDataTable] = useState(
    localStorage.getItem("data_table") || null
  );
  const [taxAndService, setTaxAndService] = useState({ tax: 0, charge: 0 });
  const [allDataTable, setAllDataTable] = useState({});

  const [allDataBusiness, setAllDataBusiness] = useState({});
  const [getSalesType, setGetSalesType] = useState(0); // Add this line
  const [customerAccountId, setCustomerAccountId] = useState(
    localStorage.getItem("customer_account_id") || null
  );
  const [dataCustomer, setDataCustomer] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const token = localStorage.getItem("token");
  const handleGetIncludedTable = () => {
    if (dataTable) {
      handleTableName();
    }
  };

  const handleDateTime = () => {
    const date = dayjs(resDate).format("YYYY/MM/DD");
    const time = dayjs(resTime).format("HH:mm:ss");
    console.log("date", date);
    setDateTime(`${date} ${time}`);
  };

  const handleTableName = async () => {
    try {
      const storedDataTable = JSON.parse(localStorage.getItem("data_table"));
      const response = await axios.get(
        `${API_URL}/api/v1/table-management/cust/${storedDataTable.tableId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("table: ", response.data.data);
      setAllDataTable(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckTaxAndService = async () => {
    try {
      const token = localStorage.getItem("token");
      const resultOutlet = await axios.get(
        `${API_URL}/api/v1/outlet/${dataBusiness.outlet_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("tatatat", resultOutlet);
      let taxPercentage = 0;
      let servicePercentage = 0;
      const resTemp = resultOutlet.data.data;

      if (resTemp.Outlet_Taxes && resTemp.Outlet_Taxes.length > 0) {
        resTemp.Outlet_Taxes.forEach((item) => {
          if (item.Tax.Tax_Type.name === "Tax") {
            taxPercentage = parseInt(item.Tax.value);
          }
          if (item.Tax.Tax_Type.name === "Charge") {
            servicePercentage = parseInt(item.Tax.value);
          }
        });
      }

      console.log("taxPercentage", taxPercentage);
      console.log("servicePercentage", servicePercentage);

      setTaxAndService({ tax: taxPercentage, charge: servicePercentage });
    } catch (error) {
      console.error(error);
      console.log("error handleCheckTaxAndService");
    }
  };
  const handleSalesType = async () => {
    try {
      const dataTable = JSON.parse(localStorage.getItem("data_table"));
      const response = await axios.get(
        `${API_URL}/api/v1/sales-type/guest?business_id=${dataTable.businessId}&require_table=1`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Tai", response.data.data[0].id)
      setGetSalesType(response.data.data[0].id);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCheckout = async () => {
    try {
      setDisabledButton(true);
      const dataTable = JSON.parse(localStorage.getItem("data_table"));
      console.log("dataTable", dataTable.tableId);

      // const salesTypeId = await handleSalesType();
      console.log("salesTypeId", getSalesType);

      // setEnableWaiting(false);
      const tempItems = [];
      const receiptId =
        "ORDER_" +
        dayjs(new Date()).format("YY/MM/DD-HH/mm/ss") +
        dataBusiness.outlet_id;
      console.log("receiptId", receiptId);
      // Retrieve cart items from local storage
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

      cartItems.forEach((value) => {
        const tempAddons = [];
        if (value.fullDataAddons) {
          value.fullDataAddons.forEach((value2) => {
            tempAddons.push({
              id: value2.id,
              price: value2.price,
            });
          });
        }
        tempItems.push({
          sales_type_id: getSalesType,
          product_id: value.id,
          addons: tempAddons || [],
          quantity: value.totalItem,
          price_product: value.priceItem,
          price_discount: 0,
          price_service: 0,
          price_addons_total: value.totalPriceAddons || 0,
          price_total: value.totalAmount,
          notes: value.notes,
        });
      });
      // console.log("cart", cartItems);
      const sendData = {
        receipt_id: receiptId,
        items: tempItems,
        outlet_id: parseInt(dataBusiness.outlet_id),
        business_id: parseInt(dataBusiness.business_id),
        table_id: parseInt(dataTable.tableId),
      };
      // console.log("sendData", sendData);
      const resTransaction = await axios.post(
        `${API_URL}/api/v1/transaction/save/qr`,
        sendData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("transaksi", resTransaction);
      const getUserBusiness = await axios.get(
        `${API_URL}/api/v1/auth/get-user?business_id=${parseInt(
          dataBusiness.business_id
        )}&outlet_id=${parseInt(dataBusiness.outlet_id)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("getUserBusiness", getUserBusiness.data.data);

      if (resTransaction.data.statusCode === 201) {
        if (getUserBusiness) {
          const deviceUser = [];
          getUserBusiness.data.data.forEach((value) => {
            console.log("looping device ", value.device);
            if (value.device) {
              const splitDevice = value.device.split("-");
              if (splitDevice.length === 5) {
                deviceUser.push(value);
              }
            }
          });
          // console.log("deviceUser", deviceUser);
          const resultDevice = deviceUser.map((value) => value.device);

          console.log("include_player_ids yang akan dikirim", resultDevice);
          const bodyOneSignal = {
            app_id: "545db6bf-4448-4444-b9c8-70fb9fae225b",
            include_player_ids: resultDevice,
            contents: {
              en: "Mohon konfirmasi order pada menu booking aplikasi BeetPOS anda",
              id: "Mohon konfirmasi order pada menu booking aplikasi BeetPOS anda",
            },
            headings: {
              en: "Request Self Order baru pada " + allDataTable.name,
              id: "Request Self Order baru pada " + allDataTable.name,
            },
            subtitle: {
              en: "Request Self Order baru pada [NamaTable]",
              id: "Request Self Order baru pada [NamaTable]",
            },
          };
          fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization:
                "Basic ZGJiNjZmYWEtNTQ2Ny00MmExLTgwZjMtZDRhN2U2YWUwMjk0",
            },
            body: JSON.stringify(bodyOneSignal),
          })
            .then((response) => response.json())
            .then((responseJson) => {
              const result = responseJson;
              console.log("responseJSON send notif ==> ", result);
            })
            .catch((_err) => {
              console.log("ERR ==> ", _err);
            });
        }
        Swal.fire({
          icon: "success",
          title: "Pesanan Berhasil",
          showConfirmButton: false,
          timer: 2000,
          customClass: {
            title: "text-lg",
          },
        }).then(() => {
          // You might want to navigate back or perform other actions
          localStorage.removeItem("cart");
          window.location.reload();
          setIsModalOpen(false);
        });
        // Swal.fire({
        //   title: "Pesanan Berhasil",
        //   text: "",
        //   icon: "success",
        // }).then((result) => {
        //   if (result.isConfirmed) {
        //     // Clear the cart from local storage
        //     localStorage.removeItem("cart");

        //     // Delay for 2 seconds (2000 milliseconds) before closing the modal and reloading the window
        //     setTimeout(() => {
        //       setIsModalOpen(false);
        //       window.location.reload();
        //       // or router.push({ name: 'AllMenu' }); if you are using a router
        //     }, 2000);
        //   }
        // });
      }
    } catch (error) {
      console.log("ERROR CHECKOUT", error);
      console.log("allDataTable", allDataTable);
      // router.push({ name: 'AllMenu' });
      setIsModalOpen(false);
      Swal.fire(`Table ${allDataTable.name} already in use`, "", "warning");
    }
  };

  // useEffect to mimic componentDidMount
  useEffect(() => {
    handleSalesType();
    handleGetIncludedTable();
    handleDateTime();
    handleTableName();
    handleCheckTaxAndService();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCheckoutTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartData);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cartData = JSON.parse(localStorage.getItem("cart")) || [];
        const businessIds = cartData.map((item) => item.business_id);
        const businessIdsString = businessIds.join(",");
        const API_URL = import.meta.env.VITE_API_KEY;
        const token = localStorage.getItem("token");
        const apiUrlWithQuery = `${API_URL}/api/v1/payment-method/development?businessId=${businessIdsString}`;

        const response = await axios.get(apiUrlWithQuery, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setPayment(response.data.data.rows);
      } catch (error) {
        console.error(error);
      } finally {
        const timer = setTimeout(() => {
          setLoading(false);
        }, 1500);
        return () => {
          clearTimeout(timer);
        };
      }
    };

    fetchData();
  }, []);

  const calculateTotalPrice = () => {
    let totalTax = 0;
    let totalService = 0;
    let totalPaymentTotal = 0;
    let totalResultTotal = 0;

    cart.forEach((item) => {
      if (
        selectedItems.includes(item.id) &&
        selectedOutlets.includes(item.business)
      ) {
        const resultTotal = item.priceItem * item.totalItem;
        const tax = Math.ceil((resultTotal * taxAndService.tax) / 100);
        const service = Math.ceil((resultTotal * taxAndService.charge) / 100);
        const paymentTotal = resultTotal;

        // Hitung resultAmount
        const resultTotalValue = Math.ceil(paymentTotal + tax + service);

        // Accumulate totals
        totalTax += tax;
        totalService += service;
        totalPaymentTotal += paymentTotal;
        totalResultTotal += resultTotalValue;
      }
    });

    return {
      totalTax,
      totalService,
      totalPaymentTotal,
      totalResultTotal,
    };
  };
  const totalValues = calculateTotalPrice();

  const selectedItemsData = cart.filter((item) =>
    selectedItems.includes(item.id)
  );
  // console.log(selectedItemsData);
  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 overflow-auto">
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-black opacity-70" />
          </div>
          <div className="relative z-10 w-full max-w-7xl m-5 bg-white shadow-lg rounded-lg lg:p-4 p-3.5 md:p-8">
            <h1 className="text-2xl font-semibold mb-4">Checkout</h1>

            <button
              onClick={closeModal}
              className="absolute top-0 right-0 m-2 px-4 text-5xl py-2  text-[#6E205E] hover:text-[#965088] "
            >
              &times;
            </button>

            {loading ? (
              <div className="p-40 flex justify-center">
                <Loading />
              </div>
            ) : (
              <>
                {loading1 ? (
                  <div className="p-40 flex justify-center">
                    <Loading />
                  </div>
                ) : urlVendor ? (
                  <>
                    {" "}
                    {urlVendor && (
                      <iframe
                        src={urlVendor}
                        className="w-full"
                        height="600px"
                        title="Konten Pembayaran"
                        allow="geolocation"
                      />
                    )}
                  </>
                ) : (
                  <div className="overflow-auto">
                    <div className="mb-4 md:space-x-8">
                      <div className="bg-gray-300 p-3 rounded-lg">
                        <div className="font-semibold text-lg mb-3">
                          {/* {outletName} */}
                          {selectedOutlets}
                        </div>
                        <ul>
                          {selectedItemsData.map((item) => (
                            <li
                              key={item.id}
                              className="flex justify-between pl-2"
                            >
                              <span>{item.nameItem}</span>
                              <span className="flex items-center">
                                <span className="w-16 text-right">
                                  {item.totalItem}x
                                </span>
                                <span className="w-24 text-right flex-grow">
                                  Rp. {item.priceItem.toLocaleString("id-ID")}
                                </span>
                              </span>
                            </li>
                          ))}

                          <hr className="border-2 ml-2 border-gray-400 mb-2 mt-2 rounded-lg" />
                          <li className="flex justify-between pl-2">
                            <span>
                              Tax{" "}
                              <span className="ml-1 text-xs">
                                ({taxAndService.tax}%)
                              </span>
                            </span>
                            <span>
                              Rp. {totalValues.totalTax.toLocaleString("id-ID")}
                            </span>
                          </li>
                          <li className="flex justify-between pl-2">
                            <span>
                              Service{" "}
                              <span className="ml-1 text-xs">
                                ({taxAndService.charge}%)
                              </span>
                            </span>
                            <span>
                              Rp.{" "}
                              {totalValues.totalService.toLocaleString("id-ID")}
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* <hr className="" /> */}
                      <div className="flex justify-between pr-3 pt-2">
                        <span className="font-semibold">Total Harga:</span>
                        <span>
                          Rp.{" "}
                          {totalValues.totalResultTotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Bayar */}
                    <div className="text-center">
                      <button
                        className="bg-[#6E205E] text-white px-20 py-2 rounded-2xl hover-bg-[#8f387d]"
                        onClick={() => handleCheckout()}
                      >
                        Pesan
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckOut;
