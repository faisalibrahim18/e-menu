import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "./style.css"; // Pastikan file style.css sudah terhubung dengan benar
import { Navigation } from "swiper/modules";
import axios from "axios";

const Category = ({category, selectedCategory, setSelectedCategory }) => {
  const [categoryData, setCategoryData] = useState([]);
  const { id } = useParams();
  // console.log("catgoryDat", selectedCategory);
  useEffect(() => {
    const getData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_KEY;
        const token = localStorage.getItem("token");
        const dataTableParsed = JSON.parse(localStorage.getItem("data_table"));
        const response = await axios.get(
          `${API_URL}/api/v1/product/beetstore?business_id=${dataTableParsed.businessId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log(response.data.data)
        setCategoryData(response.data.data);
      } catch (error) {
        if (error.response) {
          console.log(error.response.data.message);
        }
      }
    };
    getData();
  }, [id]);
  const uniqueCategories = category.filter(
    (category, index, self) =>
      index ===
      self.findIndex(
        (c) => c.name === category.name
      )
  );
  return (
    <>
      <div className="lg:p-10 p-5 shadow mb-5">
        <div className="text-gray-800 font-semibold pb-2">Pilihan Category</div>
        <div className="lg:pl-4">
          <div className="flex whitespace-nowrap py-3">
            <Swiper
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              modules={[Navigation]}
              spaceBetween={13}
              slidesPerView={3}
              breakpoints={{
                640: {
                  slidesPerView: 3,
                },
                768: {
                  slidesPerView: 6,
                },
                1024: {
                  slidesPerView: 9,
                },
              }}
              className="mySwiper pl-8 custom-swiper-navigation relative  group"
            >
              {/* Konten Swiper di sini */}
              <SwiperSlide>
                <div className="mr-10">
                  <Link>
                    <div
                      className={`bg-gray-100 text-sm hover:bg-gray-300 rounded-2xl p-2 pl-3 pr-3 text-center ${
                        selectedCategory === "all" ? "text-[#6E205E]" : ""
                      }`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      all
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
              {uniqueCategories.map((category) => (
                <SwiperSlide key={category.id}>
                  <div className="mr-10">
                    <div
                      className={`bg-gray-100 text-sm lowercase cursor-pointer hover:bg-gray-300 rounded-2xl p-2 pl-3 pr-3 text-center ${
                        selectedCategory ===
                        category.name.toLowerCase()
                          ? "text-[#6E205E]"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedCategory(
                          category.name.toLowerCase()
                        )
                      }
                    >
                      {category.name}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              {/* Konten Swiper di sini */}
              <div className="swiper-button-prev absolute left-0 top-3 transform translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer text-white opacity-0 group-hover:bg-gray-400 group-hover:text-[#6E205E] group-hover:shadow group-hover:opacity-100 transition duration-300"></div>
              <div className="swiper-button-next absolute right-0 top-3 transform translate-y-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer text-white opacity-0 group-hover:bg-gray-400 group-hover:text-[#6E205E] group-hover:shadow  group-hover:opacity-100 transition duration-300"></div>
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
};

export default Category;
