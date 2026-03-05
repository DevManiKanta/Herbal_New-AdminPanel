import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const menu = [
  { label: "Profile", path: "/settings/profile" },
  { label: "Logo", path: "/settings/logo" },
  { label: "Social media", path: "/settings/social-media" },
  { label: "Payment gateway", path: "/settings/payment-gateway" },
  { label: "Variation Settings", path: "/settings/variation-settings" },
  { label: "Whats App Integration", path: "/settings/whatsapp-integration" },
  { label: "Contact Page Settings", path: "/settings/contact-page" },
  { label: "Customer Care Settings", path: "/settings/customer-care-settings" },
  { label: "coupons-settings", path: "/settings/coupons-settings" },
  { label: "Banner-settings", path: "/settings/banner-settings" },
  { label: "Landing Banner Settings", path: "/settings/landing-banner-settings" },
  { label: "Shipping-settings", path: "/settings/shipping-settings" },
  { label: "Product Sections", path: "/settings/product-sections" },

  {
    label: "Footer Sections",
    children: [
      { label: "Manage Sections", path: "/settings/footer-sections" },
      { label: "Reorder Sections", path: "/settings/footer-sections/reorder" },
      { label: "Page Settings", path: "/settings/pages" },
    ],
  },

  {
    label: "Blog Sections",
    children: [
      { label: "Blog-categories", path: "/settings/blog-categories" },
      { label: "Blog", path: "/settings/blogs" },
    ],
  },
];

export default function SettingsSidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div className="w-56 bg-gray-50 border-r border-gray-200 min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
      </div>

      {/* Menu Items */}
      <ul className="space-y-0 text-sm">
        {menu.map((item, index) => {
          return (
            <li key={index}>
              {/* Normal Menu Item */}
              {!item.children && (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-6 py-3 transition border-l-4 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium border-l-blue-600"
                        : "text-gray-700 hover:bg-gray-100 border-l-transparent"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )}

              {/* Parent Menu */}
              {item.children && (
                <>
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === item.label ? null : item.label)
                    }
                    className="w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-100 transition flex justify-between items-center border-l-4 border-l-transparent"
                  >
                    <span className="font-medium">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition ${openMenu === item.label ? "rotate-180" : ""}`}
                    />
                  </button>

                  {openMenu === item.label && (
                    <ul className="bg-gray-100">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <NavLink
                            to={child.path}
                            className={({ isActive }) =>
                              `block px-6 py-2.5 text-sm transition border-l-4 ${
                                isActive
                                  ? "bg-blue-50 text-blue-600 font-medium border-l-blue-600"
                                  : "text-gray-600 hover:bg-gray-200 border-l-transparent"
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}