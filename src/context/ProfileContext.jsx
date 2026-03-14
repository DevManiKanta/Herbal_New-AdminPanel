



import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: brand visibility toggle
  const [showBrandName, setShowBrandName] = useState(true);

  /* -------- GET PROFILE -------- */
  const getProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin-dashboard/profile");
      setProfile(res.data.user);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to load profile";
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
        icon: "⚠️",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------- UPDATE PROFILE -------- */
  const updateProfile = async (formData) => {
    try {
      setLoading(true);

      const res = await api.post(
        "/admin-dashboard/update-profile",
        formData
      );

      if (res.data?.success === false) {
        const errorMessage = res.data.errors || "Update failed";
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#ef4444",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            zIndex: 99999,
          },
          icon: "⚠️",
        });
        return false;
      }

      toast.success("Profile updated successfully!", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#10b981",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
        icon: "✓",
      });
      await getProfile();
      return true;
    } catch (err) {
      const errorMessage = 
        err.response?.data?.errors ||
        err.response?.data?.message ||
        "Something went wrong";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
        icon: "⚠️",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* -------- REMOVE AVATAR -------- */
  const removeAvatar = async () => {
    try {
      setLoading(true);

      const res = await api.delete(
        "/admin-dashboard/profile/avatar"
      );

      if (res.data?.success === false) {
        const errorMessage = res.data.errors || "Failed to remove avatar";
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
          style: {
            background: "#ef4444",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            zIndex: 99999,
          },
          icon: "⚠️",
        });
        return;
      }

      toast.success("Avatar removed successfully!", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#10b981",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
        icon: "✓",
      });
      await getProfile();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to remove avatar";
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          zIndex: 99999,
        },
        icon: "⚠️",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        getProfile,
        updateProfile,
        removeAvatar,

        // ✅ expose toggle
        showBrandName,
        setShowBrandName,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

