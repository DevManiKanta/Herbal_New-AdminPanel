// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import {
//   Home,
//   Box,
//   Tag,
//   ShoppingCart,
//   DollarSign,
//   BarChart,
//   Package,
//   Store,
//   Settings,
//   Users,
// } from "lucide-react";
// import { useProfile } from "../context/ProfileContext";
// import api from "../api/axios";
// import { useAppSettings } from "../context/AppSettingsContext";
// import { useLogoSettings } from "../context/LogoSettingsContext";
// import defaultimage from "../assets/profile.jpg";
// import { isHerbal, isHamsini } from "../config/projectConfig.js";

// const SIDEBAR_WIDTH = "88px";
// const FALLBACK_LOGO = defaultimage;
// const BASE_URL = import.meta.env.VITE_API_BASE_URL_Image_URl;

// export default function Sidebar({ open, setOpen, logout }) {
//   const { settings } = useAppSettings();
//   const { showBrandName } = useProfile();
//   const Projectname = "Herbal";
//   const {
//     settings: logoSettings,
//     getLogoSettings, // ✅ IMPORTANT
//   } = useLogoSettings();

//   const location = useLocation();
//   const [logo, setLogo] = useState(FALLBACK_LOGO);

//   /* ===============================
//       FETCH LOGO SETTINGS ON LOAD
//   =============================== */
//   useEffect(() => {
//     getLogoSettings(); // ✅ FIX FOR REFRESH ISSUE
//   }, []);

//   /* ===============================
//       APPLY LOGO FROM CONTEXT
//   =============================== */
//   useEffect(() => {
//     if (!logoSettings) return;

//     setLogo(logoSettings.app_logo_url || FALLBACK_LOGO);
//   }, [logoSettings]);

//   const isActive = (path) =>
//     location.pathname === path
//       ? "bg-yellow-200 text-orange-600"
//       : "text-gray-700 hover:bg-green-100";

//   const Item = ({ to, icon: Icon, label }) => (
//     <Link
//       to={to}
//       onClick={() => setOpen(false)}
//       className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-center ${isActive(
//         to,
//       )}`}
//     >
//       <Icon size={20} />
//       <span className="text-[10px] leading-tight max-w-[64px]">{label}</span>
//     </Link>
//   );

//   return (
//     <aside
//       className={`
//         fixed inset-y-0 left-0 z-40
//         w-[88px] bg-green-50 border-r
//         transform transition-transform duration-300 ease-in-out
//         ${open ? "translate-x-0" : "-translate-x-full"}
//         md:translate-x-0
//       `}
//       style={{ width: SIDEBAR_WIDTH }}
//     >
//       <div className="h-full flex flex-col">
//         {/* LOGO */}
//         <div className="h-16 flex items-center justify-center border-b">
//           <img src={logo} alt="App Logo" className="h-8" />
//         </div>

//         {/* MENU */}
//         <nav className="flex-1 overflow-y-auto p-2 space-y-1">
//           {isHerbal ? (
//             <>
//               <Item to="/dashboard" icon={Home} label="Dashboard" />
//               <Item to="/products" icon={Box} label="Products" />
//               <Item to="/add-categories" icon={Tag} label="Add Category" />
//               <Item to="/pos" icon={ShoppingCart} label="POS" />
//               <Item to="/pos/orders" icon={Users} label="Pos Orders" />

//               <Item to="/online-orders" icon={Package} label="Online Orders" />
//               <Item to="/reports" icon={BarChart} label="Reports" />

//               <Item to="/customers" icon={Users} label="Customers" />

//               {/* <Item to="/orders" icon={Package} label="Orders" /> */}
//               <Item to="/users" icon={Users} label="Users" />

//               <Item
//                 to="/staff-attendance"
//                 icon={Users}
//                 label="Staff Attendance"
//               />
//               <Item to="/settings/profile" icon={Settings} label="Settings" />
//               <Item
//                 to="/settings/shipping-settings"
//                 icon={Settings}
//                 label="Settings"
//               />
//             </>
//           ) : (
//             <>
//               <Item to="/dashboard" icon={Home} label="Dashboard" />
//               <Item to="/products" icon={Box} label="Products" />
//               <Item to="/categories" icon={Tag} label="Category" />
//               {/* <Item to="/online-orders" icon={Package} label="Online Orders" /> */}
//               <Item to="/reports" icon={BarChart} label="Reports" />

//               <Item to="/orders" icon={Package} label="Orders" />
//               <Item to="/users" icon={Users} label="Users" />

//               <Item
//                 to="/staff-attendance"
//                 icon={Users}
//                 label="Staff Attendance"
//               />
//               <Item to="/settings/profile" icon={Settings} label="Settings" />
//             </>
//           )}

//           {/* <Item to="/dashboard" icon={Home} label="Dashboard" />
//           <Item to="/products" icon={Box} label="Products" /> */}

//           {/* {Projectname === "Herbal" ? (
//             <>
//               <Item to="/add-categories" icon={Tag} label="Add Category" />

//               <Item to="/online-orders" icon={Package} label="Online Orders" />
//               <Item to="/reports" icon={BarChart} label="Reports" />
//               <Item to="/pos" icon={ShoppingCart} label="POS" />
//               <Item to="/customers" icon={Users} label="Customers" />

//               <Item to="/calling/orders" icon={Users} label="Calling Orders" />
//             </>
//           ) : (
//             <Item to="/categories" icon={Tag} label="Category" />
//           )} */}

//           {/* <Item to="/brands" icon={Store} label="Brand" /> */}
//           {/* {showBrandName && (
//   <Item to="/brands" icon={Store} label="Brand" />
// )} */}
//           {/* {showBrandName && <Item to="/pos" icon={ShoppingCart} label="POS" />}
//           <Item to="/expenses" icon={DollarSign} label="Expenses" /> */}
//           {/* <Item to="/orders" icon={Package} label="Orders" /> */}
//           {/* <Item to="/online-orders" icon={Package} label="Online Orders" /> */}
//           {/* <Item to="/reports" icon={BarChart} label="Reports" /> */}
//           {/* <Item to="/users" icon={Users} label="Users" /> */}
//           {/* <Item to="/my-staff" icon={Users} label="My Staff" /> */}
//           {/* <Item to="/add-staff" icon={Users} label="Add Staff" /> */}
//           {/* <Item to="/staff-attendance" icon={Users} label="Staff Attendance" />
//           <Item to="/settings/profile" icon={Settings} label="Settings" /> */}
//         </nav>

//         {/* LOGOUT */}
//         <div className="p-2 border-t">
//           <button
//             onClick={logout}
//             className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }


import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Box,
  Tag,
  ShoppingCart,
  BarChart,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { useLogoSettings } from "../context/LogoSettingsContext";
import defaultimage from "../assets/profile.jpg";
import { isHerbal, isHamsini } from "../config/projectConfig.js";

const SIDEBAR_WIDTH = "88px";
const FALLBACK_LOGO = defaultimage;

export default function Sidebar({ open, setOpen, logout }) {
  const location = useLocation();
  const { settings: logoSettings, getLogoSettings } = useLogoSettings();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const [logo, setLogo] = useState(FALLBACK_LOGO);

  useEffect(() => {
    getLogoSettings();
  }, []);

  useEffect(() => {
    if (!logoSettings) return;
    setLogo(logoSettings.app_logo_url || FALLBACK_LOGO);
  }, [logoSettings]);

  const isActive = (path) => {
    const pathname = location.pathname;
    // Only highlight if it's an exact match (not a parent of another route)
    if (pathname === path || pathname === path + "/") {
      return "bg-yellow-200 text-orange-600";
    }
    return "text-gray-700 hover:bg-green-100";
  };

  const Item = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg text-center ${isActive(
        to
      )}`}
    >
      <Icon size={20} />
      <span className="text-[10px] leading-tight max-w-[64px]">
        {label}
      </span>
    </Link>
  );

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40
        w-[88px] bg-green-50 border-r
        transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="h-full flex flex-col">
        {/* LOGO */}
        <div className="h-16 flex items-center justify-center border-b">
          <img src={logo} alt="App Logo" className="h-8" />
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">

          {/* ================= EMPLOYEE ================= */}
          {role === "employee" && (
            <>
              {isHerbal && (
                <>
                  <Item to="/pos" icon={ShoppingCart} label="POS" />
                  <Item to="/pos/orders" icon={Package} label="POS Orders" />
                  <Item to="/staff-attendance" icon={Users} label="Staff Attendance" />
                  <Item to="/customers" icon={Users} label="Customers" />
                </>
              )}

              {isHamsini && (
                <>
                  <Item to="/pos" icon={ShoppingCart} label="POS" />
                  <Item to="/pos/orders" icon={Package} label="POS Orders" />
                  <Item to="/staff-attendance" icon={Users} label="Staff Attendance" />
                </>
              )}
            </>
          )}

          {/* ================= ADMIN ================= */}
          {role === "admin" && (
            <>
              {isHerbal && (
                <>
                  <Item to="/dashboard" icon={Home} label="Dashboard" />
                  <Item to="/products" icon={Box} label="Products" />
                       <Item to="/bulk-variant-images" icon={Box} label="Bulk Variant Images" />
                  <Item
                    to="/add-categories"
                    icon={Tag}
                    label="Add Category"
                  />
                  <Item to="/pos" icon={ShoppingCart} label="POS" />
                  <Item
                    to="/pos/orders"
                    icon={Package}
                    label="POS Orders"
                  />
                  <Item
                    to="/online-orders"
                    icon={Package}
                    label="Online Orders"
                  />
                  <Item to="/customers" icon={Users} label="Customers" />
                  <Item to="/users" icon={Users} label="Users" />
                  <Item
                    to="/staff-attendance"
                    icon={Users}
                    label="Staff Attendance"
                  />
                  <Item
                    to="/settings/profile"
                    icon={Settings}
                    label="Settings"
                  />
                </>
              )}

              {isHamsini && (
                <>
                  <Item to="/dashboard" icon={Home} label="Dashboard" />
                  <Item to="/products" icon={Box} label="Products" />
                       <Item to="/bulk-variant-images" icon={Box} label="Bulk Variant Images" />
                  <Item to="/categories" icon={Tag} label="Category" />
                  <Item to="/orders" icon={Package} label="Orders" />
                  <Item to="/users" icon={Users} label="Users" />
                  <Item
                    to="/staff-attendance"
                    icon={Users}
                    label="Staff Attendance"
                  />
                  <Item
                    to="/settings/profile"
                    icon={Settings}
                    label="Settings"
                  />
                </>
              )}
            </>
          )}
        </nav>

        {/* LOGOUT */}
        <div className="p-2 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}