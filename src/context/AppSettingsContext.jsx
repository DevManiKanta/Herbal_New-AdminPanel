// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../api/axios";

// const AppSettingsContext = createContext();

// const BASE_URL = import.meta.env.VITE_API_BASE_URL_Image_URl;

// export const AppSettingsProvider = ({ children }) => {
//   const [settings, setSettings] = useState({
//     logo: "",
//     app_name: "",
//     favicon: "",
//   });

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadSettings = async () => {
//       try {
//         const res = await api.get("/auth/app-logo-settings");

//         console.log("API RESPONSE:", res.data);

//         if (res.data?.success && res.data?.data) {
//           const data = res.data.data; // ✅ FIXED

//           const fullLogo = data.app_logo ? `${BASE_URL}/${data.app_logo}` : "";

//           const fullFavicon = data.app_favicon
//             ? `${BASE_URL}/${data.app_favicon}`
//             : "";

//           setSettings({
//             logo: fullLogo,
//             app_name: data.app_name || "",
//             favicon: fullFavicon,
//           });
//         }
//       } catch (err) {
//         console.error("Failed to load app settings", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadSettings();
//   }, []);

//   return (
//     <AppSettingsContext.Provider value={{ settings, loading }}>
//       {children}
//     </AppSettingsContext.Provider>
//   );
// };

// export const useAppSettings = () => useContext(AppSettingsContext);

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import api from "../api/axios";

const AppSettingsContext = createContext();

const BASE_URL = import.meta.env.VITE_API_BASE_URL_Image_URl;

export const AppSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    logo: "",
    app_name: "",
    favicon: "",
  });

  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Try admin endpoint first (more up-to-date)
      try {
        const res = await api.get("/admin-dashboard/app-logo-settings");
        if (res.data?.data) {
          const data = res.data.data;
          setSettings({
            logo: data.app_logo ? `${BASE_URL}/${data.app_logo}` : "",
            app_name: data.app_name || "",
            favicon: data.app_favicon ? `${BASE_URL}/${data.app_favicon}` : "",
          });
          return;
        }
      } catch (err) {
        // Fallback to auth endpoint
        console.log("Admin endpoint failed, trying auth endpoint");
      }

      // Fallback to auth endpoint
      const res = await api.get("/auth/app-logo-settings");
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setSettings({
          logo: data.app_logo ? `${BASE_URL}/${data.app_logo}` : "",
          app_name: data.app_name || "",
          favicon: data.app_favicon ? `${BASE_URL}/${data.app_favicon}` : "",
        });
      }
    } catch (err) {
      console.error("Failed to load app settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Refresh settings every 5 seconds to catch updates
    const interval = setInterval(() => {
      loadSettings();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 IMPORTANT: Memoize value
  const value = useMemo(() => {
    return { settings, loading, refreshSettings: loadSettings };
  }, [settings, loading]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
