
// import { useEffect, useState } from "react";
// import SettingsLayout from "../SettingsLayout";
// import useDynamicTitle from "../../../hooks/useDynamicTitle";
// import { useProfile } from "../../../context/ProfileContext";
// import DefaultAvatar from "../../../assets/profile.jpg";


// const DEFAULT_AVATAR = DefaultAvatar
// const AVATAR_BASE_URL = import.meta.env.VITE_API_BASE_URL_Image_URl;

// export default function ProfileSettings() {
//   useDynamicTitle("Profile Settings");

//   const { profile, getProfile, updateProfile, removeAvatar } =
//     useProfile();

//   const [editMode, setEditMode] = useState(false);
//   const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
//   const [avatarFile, setAvatarFile] = useState(null);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//   });

//   /* ---------------- LOAD PROFILE ---------------- */
//   useEffect(() => {
//     getProfile();
//   }, []);

//   /* ---------------- MAP PROFILE → FORM ---------------- */
//   useEffect(() => {
//     if (!profile) return;

//     setForm({
//       name: profile.name ?? "",
//       email: profile.email ?? "",
//       phone: String(profile.phone ?? ""), // ensure string
//       password: "",
//     });

//     setAvatar(
//       profile?.avatar
//         ? `${AVATAR_BASE_URL}/${profile.avatar}`
//         : DEFAULT_AVATAR
//     );

//     // setAvatar(DEFAULT_AVATAR)
//   }, [profile]);

//   /* ---------------- HANDLERS ---------------- */
//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleAvatarChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setAvatar(URL.createObjectURL(file));
//     setAvatarFile(file);
//   };

//   /* ---------------- SAVE ---------------- */
//   const handleSave = async () => {
//     const formData = new FormData();

//     formData.append("name", form.name);
//     formData.append("email", form.email);
//     formData.append("phone", form.phone);

//     if (form.password.trim().length > 0) {
//       formData.append("password", form.password);
//     }

//     if (avatarFile) {
//       formData.append("avatar", avatarFile);
//     }

//     const success = await updateProfile(formData);

//     if (success) {
//       setEditMode(false);
//       setAvatarFile(null);
//       setForm((prev) => ({ ...prev, password: "" }));
//     }
//   };

//   const handleRemoveAvatar = async () => {
//     await removeAvatar();
//     setAvatar(DEFAULT_AVATAR);
//     setAvatarFile(null);
//   };

//   return (
//     <SettingsLayout>
//       <div className="bg-white rounded-xl border p-6 space-y-6">
//         {/* HEADER */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">Profile</h2>

//           {!editMode ? (
//             <button
//               onClick={() => setEditMode(true)}
//               className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
//             >
//               Edit
//             </button>
//           ) : (
//             <div className="flex gap-2">
//               <button
//                 onClick={handleSave}
//                 className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setEditMode(false)}
//                 className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
//         </div>

//         {/* PROFILE IMAGE */}
//         <div className="flex items-center gap-6">
//           <div className="w-24 h-24 rounded-full border bg-gray-50 overflow-hidden flex items-center justify-center">
//             <img
//               src={avatar}
//               alt="Avatar"
//               className="w-full h-full object-cover"
//             />
//           </div>

//           {editMode && (
//             <div className="flex gap-3">
//               <label className="px-4 py-1.5 text-sm border rounded-lg cursor-pointer hover:bg-gray-50">
//                 Upload
//                 <input
//                   type="file"
//                   accept="image/*"
//                   hidden
//                   onChange={handleAvatarChange}
//                 />
//               </label>

//               <button
//                 onClick={handleRemoveAvatar}
//                 className="px-4 py-1.5 text-sm border text-red-600 rounded-lg hover:bg-red-50"
//               >
//                 Remove
//               </button>
//             </div>
//           )}
//         </div>

//         <hr />

//         {/* PROFILE INFO */}
//         <div className="space-y-5 text-sm">
//           {["name", "email", "phone"].map((field) => (
//             <div key={field}>
//               <p className="font-medium capitalize">{field}</p>
//               {editMode ? (
//                 <input
//                   name={field}
//                   value={form[field]}
//                   onChange={handleChange}
//                   className="mt-1 w-full border rounded-lg px-3 py-2"
//                 />
//               ) : (
//                 <p className="text-gray-500">{form[field]}</p>
//               )}
//               <hr />
//             </div>
//           ))}

//           {/* PASSWORD */}
//           <div>
//             <p className="font-medium">Password</p>
//             {editMode ? (
//               <input
//                 type="password"
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 placeholder="New password"
//                 className="mt-1 w-full border rounded-lg px-3 py-2"
//               />
//             ) : (
//               <p className="text-gray-500">••••••••</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </SettingsLayout>
//   );
// }



import { useEffect, useState } from "react";
import SettingsLayout from "../SettingsLayout";
import useDynamicTitle from "../../../hooks/useDynamicTitle";
import { useProfile } from "../../../context/ProfileContext";
import DefaultAvatar from "../../../assets/profile.jpg";

const DEFAULT_AVATAR = DefaultAvatar;
const AVATAR_BASE_URL = import.meta.env.VITE_API_BASE_URL_Image_URl;

export default function ProfileSettings() {
  useDynamicTitle("Profile Settings");

  const {
    profile,
    getProfile,
    updateProfile,
    removeAvatar,
    showBrandName,
    setShowBrandName,
  } = useProfile();

  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    getProfile();
  }, []);

  /* ---------------- MAP PROFILE → FORM ---------------- */
  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name ?? "",
      email: profile.email ?? "",
      phone: String(profile.phone ?? ""),
      password: "",
    });

    setAvatar(
      profile?.avatar
        ? `${AVATAR_BASE_URL}/${profile.avatar}`
        : DEFAULT_AVATAR
    );
  }, [profile]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);

    if (form.password.trim().length > 0) {
      formData.append("password", form.password);
    }

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const success = await updateProfile(formData);

    if (success) {
      setEditMode(false);
      setAvatarFile(null);
      setForm((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleRemoveAvatar = async () => {
    // Remove immediately from UI
    setAvatar(DEFAULT_AVATAR);
    setAvatarFile(null);
    
    // Call API in background
    await removeAvatar();
  };

  return (
    <SettingsLayout>
      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* BRAND NAME TOGGLE */}
        {/* <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <p className="text-sm font-medium">Brand</p>
          </div>

          <button
            onClick={() => setShowBrandName((prev) => !prev)}
            className={`px-4 py-1.5 text-sm rounded-lg border transition ${
              showBrandName
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {showBrandName ? "ON" : "OFF"}
          </button>
        </div> */}
        <hr />
        {/* PROFILE IMAGE */}
        <div className="flex items-center gap-6">
          {/* <div className="w-24 h-24 rounded-full border bg-gray-50 overflow-hidden flex items-center justify-center">
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div> */}
          {editMode && (
            <div className="flex gap-3">
              {/* <label className="px-4 py-1.5 text-sm border rounded-lg cursor-pointer hover:bg-gray-50">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </label> */}

              {/* <button
                onClick={handleRemoveAvatar}
                className="px-4 py-1.5 text-sm border text-red-600 rounded-lg hover:bg-red-50"
              >
                Remove
              </button> */}
            </div>
          )}
        </div>
        {/* PROFILE INFO */}
        <div className="space-y-5 text-sm">
          {["name", "email", "phone"].map((field) => (
            <div key={field}>
              <p className="font-medium capitalize">{field}</p>
              {editMode ? (
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-500">{form[field]}</p>
              )}
              <hr />
            </div>
          ))}

          {/* PASSWORD */}
          <div>
            <p className="font-medium">Password</p>
            {editMode ? (
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="New password"
                className="mt-1 w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-500">••••••••</p>
            )}
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}





