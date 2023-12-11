import jwtDecode from 'jwt-decode';

export const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Pastikan currentTime sesuai dengan format waktu token

      if (decodedToken.exp < currentTime) {
        // Token sudah kadaluwarsa, hapus data dari local storage
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
        localStorage.removeItem("data_table");
        localStorage.removeItem("with_scan");
      }
    } catch (error) {
      // Tangani kesalahan secara lebih spesifik sesuai kebutuhan aplikasi Anda
      console.log("Error decoding token:", error);
      // Contoh: Hapus token jika terjadi kesalahan dalam mendekode
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      localStorage.removeItem("data_table");
      localStorage.removeItem("with_scan");
    }
  }
};
