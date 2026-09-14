


// // import axios from "axios";

// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_BASE_URL, // from .env
// //   withCredentials: true,
// // });

// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("adminToken");
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });

// // export default api;



// // import axios from "axios";

// // const api = axios.create({
// //   baseURL: import.meta.env.VITE_API_BASE_URL
// // });

// // export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// /* 🔐 REQUEST: attach token */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("adminToken");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* 🚨 RESPONSE: handle 401 globally */
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       console.warn("401 detected → logging out");
//       localStorage.removeItem("adminToken");
//       window.location.href = "/admin/login";
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;





import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/* 🔐 REQUEST: attach token */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* 🚨 RESPONSE: handle 401 globally */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("401 detected → logging out");
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export default api;
