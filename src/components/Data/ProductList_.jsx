import React, { useEffect, useState } from "react";
import LoadingProduct from "../Loading/LoadingProduct";
import { Link } from "react-router-dom";
import Pro from "../../assets/pro.jpg";
import Lg from "../../assets/logo.png";

const ProductList_ = ({ searchTerm, selectedCategory }) => {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [visibleData, setVisibleData] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(
    showMore ? searchTerm.length : 12
  );
  const API_URL = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    const filterProductsByCategory = async () => {
      try {
        let filteredData;

        if (!selectedCategory || selectedCategory === "all") {
          filteredData = searchTerm.slice(0, itemsToShow);
        } else {
          const filtered = searchTerm.filter(
            (product) =>
              product.Product_Category.name?.toLowerCase() === selectedCategory
          );
          filteredData = filtered.slice(0, itemsToShow);
        }

        setVisibleData(filteredData);
      } catch (error) {
        console.error("Error filtering products:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    // Call filterProductsByCategory function
    filterProductsByCategory();
    setLoading(false);
    setLoadingInitial(false);
  }, [searchTerm, selectedCategory, itemsToShow]); // Add itemsToShow to the dependency array

  const toggleShowMore = () => {
    setLoadingMore(true);
    setShowMore(!showMore);
    setItemsToShow(!showMore ? searchTerm.length : 12); // Update itemsToShow
    setVisibleData(!showMore ? searchTerm : searchTerm.slice(0, itemsToShow));

    // Simulate waiting time for additional loading (replace with actual API request)
    setTimeout(() => {
      setLoadingMore(false);
    }, 1500);
  };

  if (loadingInitial) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        <LoadingProduct />
        <LoadingProduct />
        <LoadingProduct />
        <LoadingProduct />
        <LoadingProduct />
        <LoadingProduct />
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <div className="font-bold text-gray-900 mb-3 text-xl">Daftar Produk</div>

      <div>
        {visibleData.length === 0 ? (
          <div className="text-center font-semibold text-gray-500">
            <img
              src={Pro}
              alt="Tidak ada Outlet"
              className="responsive-image"
            />
            <p> Tidak ada produk yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {visibleData.map((item) => (
              <Link
                to={`/products/detail/${item.id}`}
                className="bg-white border rounded-lg shadow hover:shadow-2xl"
                key={item.id}
              >
                <div className="flex justify-center items-center">
                  <img
                    src={item.image == null ? Lg : `${API_URL}/${item.image}`}
                    className="w-auto object-cover md:h-52 h-32 rounded-t-lg"
                    alt={item.name}
                  />
                </div>
                <div className="pl-1.5 pr-1.5 pb-1.5">
                  <Link to={`/products/detail/${item.id}`}>
                    <div className=" text-sm tracking-tight font-semibold text-gray-900">
                      {item.name}
                    </div>
                  </Link>
                  <div className="flex">
                    {item && item.Product_Category && (
                      <p className="text-sm lowercase rounded-lg font-normal text-gray-400  flex">
                        {item.Product_Category.name}
                      </p>
                    )}
                  </div>
                  <div className="inline-flex items-center text-sm font-medium text-center text-black">
                    Rp {item.price.toLocaleString("id-ID")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div>
          {visibleData.length >= 12 && (
            <div className="flex justify-center mt-6">
              {visibleData.length > 3 && (
                <div>
                  <button
                    onClick={toggleShowMore}
                    className="px-4 py-2 rounded-lg font-bold text-[#6E205E] focus:outline-none bg-white border border-[#6E205E] hover:bg-gray-100 hover:text-[#6E205E] focus:z-10 focus:ring-4 focus:ring-gray-200"
                  >
                    {loadingMore ? (
                      <div className="flex justify-center">
                        <div className="h-4 w-4 mt-1 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                        <div>Loading...</div>
                      </div>
                    ) : showMore ? (
                      "Tampilkan Kurang"
                    ) : (
                      "Muat Lebih Banyak"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList_;
