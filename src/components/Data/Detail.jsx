import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useParams, useHistory } from "react-router-dom";

const Detail = ({ dataBusiness }) => {
  const [dataTable, setDataTable] = useState(
    localStorage.getItem("data_table") || null
  );
  const [statusTable, setStatusTable] = useState("");
  const [paymentAvailable, setPaymentAvailable] = useState(false);
  const [costumerId, setCostumerId] = useState(
    localStorage.getItem("customer_account_id")
  );
  const [product, setProduct] = useState({});
  const [isActive, setIsActive] = useState(false);
  const [handleSelect, setHandleSelect] = useState([]);
  const [allSelectAddOns, setAllSelectAddOns] = useState([]);
  const [selectedSize, setSelectedSize] = useState(1);
  const [selectedTopping, setSelectedTopping] = useState(1);
  const [allAddons, setAllAddons] = useState([]);
  const [totalItem, setTotalItem] = useState(1);
  const [notes, setNotes] = useState("");
  const [salesType, setSalesType] = useState([]);
  const [size, setSize] = useState([
    {
      id: 1,
      name: "Standart",
      price: 0,
    },
    {
      id: 2,
      name: "Large",
      price: 2000,
    },
    {
      id: 3,
      name: "Extra Large",
      price: 4000,
    },
  ]);
  const [topping, setTopping] = useState([
    {
      id: 1,
      name: "Bobba",
      price: 3000,
    },
    {
      id: 2,
      name: "Jelly",
      price: 3000,
    },
  ]);
  const [allDataTable, setAllDataTable] = useState({});
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams();

  useEffect(() => {
    handleGetProduct();
    handlePaymentMethod();
    getAllSalesType();
    handleGetIncludedTable();
  }, []);

  // ... (other methods)

  const decrement = () => {
    if (totalItem > 0) {
      setTotalItem((prevTotalItem) => prevTotalItem - 1);
    }
  };

  const increment = () => {
    setTotalItem((prevTotalItem) => prevTotalItem + 1);
  };

  const handleAddCart = () => {
    if (statusTable !== "used") {
      if (true) {
        if (totalItem > 0) {
          const addons = [];
          const priceAddons = [];
          let totalPriceAddons = null;

          allSelectAddOns.forEach((val) => {
            addons.push(val);
            priceAddons.push(val.price);
          });

          if (priceAddons.length > 0) {
            const result = priceAddons.reduce((acc, curr) => acc + curr);
            totalPriceAddons = result;
          }

          const amount = totalPriceAddons + product.price;

          const dataCart = {
            idItem: product.id,
            nameItem: product.name,
            priceItem: amount,
            descriptionItem: product.description || null,
            imageItem: product.image || null,
            totalItem: totalItem,
            updateAddons: handleSelect,
            fullDataAddons: addons,
            fullDataProduct: product,
            allAddons: allSelectAddOns,
            totalAmount: amount * totalItem,
            notes: "", // You might want to update this based on your logic
            salesTypeId: "", // You might want to update this based on your logic
          };

          const tempGetCart = [...getCart];
          const tempFinalCart = [...tempGetCart];
          let has_allSame = false;
          let totalQuantity = totalItem;
          let totalPrice = amount * totalItem;

          tempGetCart.forEach((value, index) => {
            let sameProduct = false;
            let sameNote = false;
            let sameAddons = false;
            let sameSalesType = false;

            // Existing logic for checking same items...

            if (sameProduct && sameNote && sameAddons && sameSalesType) {
              has_allSame = true;
              totalQuantity += value.totalItem;
              totalPrice += value.totalAmount;

              const dataCartTemp = {
                idItem: product.id,
                nameItem: product.name,
                priceItem: amount,
                descriptionItem: product.description || null,
                imageItem: product.image || null,
                totalItem: totalQuantity,
                updateAddons: handleSelect,
                fullDataAddons: addons,
                fullDataProduct: product,
                allAddons: allSelectAddOns,
                totalAmount: totalPrice,
                notes: "", // You might want to update this based on your logic
                salesTypeId: "", // You might want to update this based on your logic
              };

              tempFinalCart[index] = dataCartTemp;
            }
          });

          if (!has_allSame) {
            setGetCart((prevCart) => [...prevCart, dataCart]);

            // Navigate back or perform other actions
            goBack();
          } else {
            // Perform actions for duplicate items
            // e.g., setGetCart(tempFinalCart);
            // goBack();
          }
        } else {
          console.log("failed");
        }
      } else {
        Swal.fire(
          "This merchant haven't payment gateway",
          "please choose another merchant",
          "warning"
        );
      }
    } else {
      // Your logic for redirecting and showing warnings...
    }
  };
  const handleGetIncludedTable = async () => {
    try {
      console.log("dataTable", dataTable);
      if (dataTable) {
        handleCheckTable();
        handleRequireTable();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRequireTable = async () => {
    try {
      const dataTable = JSON.parse(localStorage.getItem("data_table"));
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/sales-type/guest?business_id=${dataTable.businessId}&require_table=1`
      );
      console.log("require table", data.data);
      dispatch({ type: "SET_SALES_TYPE", payload: data.data[0].id });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectSalesType = (data, index) => {
    try {
      console.log("handleSelectSalesType data", data);
      console.log("handleSelectSalesType index", index);
      dispatch({ type: "SET_SALES_TYPE", payload: data.id });
    } catch (error) {
      console.log(error);
    }
  };

  const getAllSalesType = async () => {
    try {
      let businessId;
      if (dataTable) {
        const dataTable = JSON.parse(localStorage.getItem("data_table"));
        businessId = dataTable.businessId;
      } else {
        const dataOutlet = JSON.parse(localStorage.getItem("data_outlet"));
        businessId = dataOutlet.businessId;
      }
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/sales-type/guest?business_id=${businessId}`
      );
      console.log("salesType", data.data);
      data.data.forEach((value) => {
        setSalesType((prevSalesType) => [...prevSalesType, value]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckTable = async () => {
    try {
      const dataTable = JSON.parse(localStorage.getItem("data_table"));
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/table-management/cust/${dataTable.tableId}`
      );
      setStatusTable(data.data.status);
      setAllDataTable(data.data);
      console.log("check table", data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetProduct = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/product/find-product/${id}`
      );
      console.log("data.data", data.data);
      const groupAddons = JSON.parse(JSON.stringify(data.data.Group_Addons));
      console.log("groupAddons", groupAddons);
      groupAddons.forEach((value) => {
        setAllAddons((prevAllAddons) => [...prevAllAddons, value]);
      });
      if (data.data.image) {
        data.data.image = `${process.env.REACT_APP_API_URL}/${data.data.image}`;
      } else {
        data.data.image = "";
      }
      console.log("data ===>", data.data);
      setProduct(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaymentMethod = () => {
    try {
      console.log("dataBusiness", dataBusiness);
      if (dataBusiness.czEntityId || dataBusiness.dokuClientId) {
        setPaymentAvailable(true);
      } else {
        setPaymentAvailable(false);
      }
    } catch (error) {
      console.log(error);
      setPaymentAvailable(false);
    }
  };

  const handlePlaceholderImg = (e) => {
    e.target.src = "https://via.placeholder.com/250";
  };

  const handleSelectAllAddons = (data2, index, dataGroup) => {
    const data2_temp = { ...data2, group_id: dataGroup.id };
    if (allSelectAddOns.length === 0) {
      console.log("first Time");
      setHandleSelect((prevHandleSelect) => [
        ...prevHandleSelect,
        `${index},${data2_temp.id}`,
      ]);
      setAllSelectAddOns((prevAllSelectAddOns) => [
        ...prevAllSelectAddOns,
        data2_temp,
      ]);
    } else {
      let same_group = false;
      let sameIndex = 0;

      allSelectAddOns.forEach((value, i) => {
        if (value.group_id === data2_temp.group_id) {
          same_group = true;
          sameIndex = i;
        }
      });

      if (same_group) {
        setAllSelectAddOns((prevAllSelectAddOns) => {
          const temp = prevAllSelectAddOns;
          temp.splice(sameIndex, 1);
          return [...temp, data2_temp];
        });
      } else {
        setHandleSelect((prevHandleSelect) => [
          ...prevHandleSelect,
          `${index},${data2_temp.id}`,
        ]);
        setAllSelectAddOns((prevAllSelectAddOns) => [
          ...prevAllSelectAddOns,
          data2_temp,
        ]);
      }
    }
  };

  return (
    <div className="container list-menu">
      <div className="wrapper-icon-back" onClick={goBack}>
        <img src="@/assets/images/back-arrow.png" alt="Back" />
      </div>
      <div className="row">
        <div className="col-md-12 d-flex -items-center">
          <div className="image-product mr-4">
            <div className="wrapper-image" onError={handlePlaceholderImg}>
              <img
                src={
                  product.image ||
                  "@/assets/images/websiteplanet-dummy-540X400.png"
                }
                alt="Product Image"
              />
            </div>
          </div>
          <div>
            <div className="text-name">Name: {product.name}</div>
            {product.product_category_id ? (
              <div className="text-category">
                Category: {product.Product_Category.name}
              </div>
            ) : (
              <div className="text-category">Category: no category</div>
            )}
            <div className="text-price">Price: Rp. {product.price}</div>
          </div>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-md-12">
          {!product.description ? (
            <h5 className="description">Description</h5>
          ) : (
            <div className="description-product">
              <h5 className="description">Description :</h5>
              <p className="content-description">{product.description}</p>
            </div>
          )}
        </div>
      </div>
      <hr />
      <div className="row mt-2">
        <div className="col-md-12">
          {allAddons.length > 0 ? (
            <>
              <h5 className="available-addon">Available Add-On</h5>
              <hr />
              {allAddons.map((data, index) => (
                <div key={index}>
                  <h6 className="size mb-2">{data.name}</h6>
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
                            className={`choose-size d-flex justify-content-between mb-3 ${
                              handleSelect.some(
                                (element) => element === `${index},${data2.id}`
                              )
                                ? "selected"
                                : ""
                            }`}
                          >
                            <p className="title-choose-size">{data2.name}</p>
                            <p className="price-choose-size">
                              Rp. {data2.price}
                            </p>
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
                            className={`choose-size d-flex justify-content-between mb-3 ${
                              allSelectAddOns.some(
                                (element) => element.id === data2.id
                              )
                                ? "selected"
                                : ""
                            }`}
                          >
                            <p className="title-choose-size">{data2.name}</p>
                            <p className="price-choose-size">
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
      <hr />
      <div className="row mt-2">
        <div className="col-xl-5 col-md-12">
          <h4>Sales Type</h4>
          {salesType.map((data, index) => (
            <div key={index} onClick={() => handleSelectSalesType(data, index)}>
              <div
                className={`choose-size d-flex justify-content-between mb-3 ${
                  getSalesType === data.id ? "selected" : ""
                }`}
              >
                <p className="title-choose-size">{data.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-xl-5 col-md-12">
          <h4>
            Notes <span className="text-muted">(optional)</span>
          </h4>
          <textarea
            name="notes"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          ></textarea>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-xl-5 col-md-12">
          <div
            className={`d-flex justify-content-between align-items-center ${
              statusTable === "used" ? "disable-button" : "enable-button"
            }`}
          >
            <div className="total-item">
              <div className="icon-minus" onClick={decrement}>
                -
              </div>
              {totalItem}
              <div className="icon-plus" onClick={increment}>
                +
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-xl-5 col-md-12">
          <div
            className={`button-add-cart ${
              statusTable === "used" ? "disable-button" : "enable-button"
            }`}
            onClick={addCart}
          >
            Add Cart
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
