

import { useState, useMemo } from "react";
import api from "../api/axios";

export default function CartPanel({ cart = [], setCart }) {
  /* ================= CUSTOMER ================= */


  const [showOrderHistory, setShowOrderHistory] = useState(false);
const [orderHistory, setOrderHistory] = useState([]);


  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [pendingId, setPendingId] = useState(null);

  const [showPaymentDone, setShowPaymentDone] = useState(false);

  /* ================= OTP STATES ================= */
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingPayload, setPendingPayload] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= ADDRESS ================= */
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  // const [newAddress, setNewAddress] = useState({
  //   address_line: "",
  //   city: "",
  //   state: "",
  //   pincode: "",
  // });

  const [newAddress, setNewAddress] = useState({
  door_no: "",
  street: "",
  area: "",
  address_line: "",
  city: "",
  state: "",
  pincode: "",
});

  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("pay");

  /* ================= GST ================= */
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstPercent, setGstPercent] = useState(5);

  /* ================= HELPERS ================= */
  const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

  /* ================= CALCULATIONS ================= */
  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart],
  );

  const gst = useMemo(() => {
    if (!gstEnabled) return 0;
    return (subtotal * gstPercent) / 100;
  }, [subtotal, gstEnabled, gstPercent]);

  const total = Math.max(subtotal + gst - discount, 0);

  /* ================= QTY ================= */
  const increaseQty = (index) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index && item.qty < item.stock
          ? { ...item, qty: item.qty + 1 }
          : item,
      ),
    );
  };

  const decreaseQty = (index) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  };

  /* ================= SUBMIT ================= */


  const handleSubmit = async () => {
  if (!customer.name || !isValidPhone(customer.phone)) {
    alert("Enter valid customer details");
    return;
  }

  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const selectedAddressObj = addresses.find(
    (a) => String(a.id) === String(selectedAddress)
  );

  let addressData = null;

  if (selectedAddressObj) {
    addressData = selectedAddressObj;
  } else if (showNewAddress) {
    addressData = newAddress;
  }

  // ✅ FIXED VALIDATION (works for both old + new address)
  if (!addressData) {
    alert("Please provide complete address");
    return;
  }

  if (showNewAddress) {
    // New Address must have door, street, area
    if (
      !addressData.door_no ||
      !addressData.street ||
      !addressData.area ||
      !addressData.address_line ||
      !addressData.city ||
      !addressData.state ||
      !addressData.pincode
    ) {
      alert("Please provide complete address");
      return;
    }
  } else {
    // Existing address (old structure safe)
    if (
      !(addressData.address_line || addressData.address) ||
      !addressData.city ||
      !addressData.state ||
      !addressData.pincode
    ) {
      alert("Please provide complete address");
      return;
    }
  }

  const payload = {
    customer_id: selectedCustomer?.id || null,
    address_id: selectedAddress || null,
    new_address: showNewAddress ? newAddress : null,

    payment_method: paymentMode,
    paid_amount: Number(total.toFixed(2)),

    subtotal: subtotal,
    discount_total: discount,
    tax_total: gst,
    grand_total: total,

    customer_name: customer.name,
    customer_phone: customer.phone,

    // ✅ SAFE SNAPSHOT (no crash if old address)
    address_snapshot: {
      door_no: addressData.door_no || null,
      street: addressData.street || null,
      area: addressData.area || null,
      address: addressData.address_line || addressData.address,
      city: addressData.city,
      state: addressData.state,
      country: addressData.country || "India",
      pincode: addressData.pincode,
    },

    items: cart.map((item) => ({
      product_id: item.product_id,
      variant_id: item.variation_id,
      qty: item.qty,
    })),
  };

  try {
    setLoading(true);

    console.log("SENDING OTP...");

    const otpRes = await api.post(
      "/admin-dashboard/send-order-otp",
      payload
    );

    console.log("FULL RESPONSE:", otpRes);

    if (otpRes?.data?.success === true) {
      setPendingPayload(payload);
      setPendingId(otpRes.data.pending_id);
      setShowOtpModal(true);
      alert("OTP sent to WhatsApp");
    } else {
      alert(otpRes?.data?.message || "Unexpected response");
    }
  } catch (err) {
    console.log("🔥 ACTUAL ERROR:", err);
    alert("Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const verifyRes = await api.post("/admin-dashboard/verify-order-otp", {
        otp,
        pending_id: pendingId,
      });
      console.log(verifyRes.data.success);
      if (verifyRes.data.success) {
        // STEP 2 → AFTER VERIFY CREATE ORDER

        console.log("Name:", customer.name);
        console.log("Phone:", customer.phone);
        console.log("amount", total);
        const paymentRes = await api.post(
          "/admin-dashboard/create-payment-link",
          {
            amount: total,
            name: customer.name,
            phone: customer.phone,
          },
        );

        if (paymentRes.data.success) {
          alert("Payment link sent to customer phone");

          setShowPaymentDone(true);

          console.log("Payment Link:", paymentRes.data.payment_link);
        }

        // const orderRes = await api.post(
        //   "/admin-dashboard/pos/create-order",
        //   pendingPayload,
        // );

        // if (orderRes.data.success) {
        //   alert(`Order Created: ${orderRes.data.data.invoice_number}`);
        //   setCart([]);
        //   setShowOtpModal(false);
        //   setOtp("");
        //   setPendingPayload(null);
        // } else {
        //   alert(orderRes.data.message);
        // }
      } else {
        alert(verifyRes.data.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchCityState = async (pincode) => {
    if (pincode.length !== 6) return;

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const data = await res.json();

      if (
        data?.[0]?.Status === "Success" &&
        data?.[0]?.PostOffice?.length > 0
      ) {
        const info = data[0].PostOffice[0];
        setNewAddress((prev) => ({
          ...prev,
          city: info.District || "",
          state: info.State || "",
        }));
      }
    } catch (err) {
      console.error("Pin API failed", err);
    }
  };

  const handleManualPaymentSuccess = async () => {
    try {
      setLoading(true);

      const orderRes = await api.post(
        "/admin-dashboard/pos/create-order",
        pendingPayload,
      );

      if (orderRes.data.success) {
        alert(`Order Created: ${orderRes.data.data.invoice_number}`);

        setCart([]);
        setShowOtpModal(false);
        setOtp("");
        setPendingPayload(null);
        setShowPaymentDone(false);
      } else {
        alert(orderRes.data.message);
      }
    } catch (err) {
      console.log(err.response?.data);
      alert("Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-white border-l flex flex-col h-screen">
      {/* HEADER */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Billing</h3>
      </div>

      {/* CUSTOMER */}
      <div className="p-4 border-b space-y-2">
        <input
          value={customer.phone}
          onChange={async (e) => {
            const val = e.target.value.replace(/\D/g, "");

            if (val.length <= 10) {
              setCustomer((p) => ({ ...p, phone: val }));
            }

            if (val.length === 10) {
              try {
                const res = await api.get(
                  `/admin-dashboard/pos/search-user?phone=${val}`,
                );

                if (res.data.success) {
                  const user = res.data.data;

                  setSelectedCustomer(user);

                  setCustomer((p) => ({
                    ...p,
                    name: user.name,
                  }));


                   setOrderHistory(user.orders || []);
                  // ✅ USE ADDRESSES FROM SAME RESPONSE
                  if (user.addresses && user.addresses.length > 0) {
                    setAddresses(user.addresses);
                    setSelectedAddress(user.addresses[0].id);
                    setShowNewAddress(false);
                  } else {
                    setAddresses([]);
                    setSelectedAddress(null);
                    setShowNewAddress(true);
                  }
                } else {
                  setSelectedCustomer(null);
                  setAddresses([]);
                  setShowNewAddress(false);
                }
              } catch {
                setSelectedCustomer(null);
                setAddresses([]);
                setShowNewAddress(false);
              }
            }
          }}
          placeholder="Mobile Number"
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <input
          value={customer.name}
          disabled={!!selectedCustomer}
          onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
          placeholder="Customer Name"
          className={`w-full border rounded-lg px-3 py-2 text-sm ${
            selectedCustomer ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        {orderHistory.length > 0 && (
  <button
    onClick={() => setShowOrderHistory(true)}
    className="text-sm text-blue-600 underline"
  >
    View Purchase History ({orderHistory.length})
  </button>
)}

        {/* ADDRESS UI */}
        {selectedCustomer && (
          <div className="mt-3 space-y-3">
            {/* EXISTING ADDRESSES */}
            {addresses.length > 0 && !showNewAddress && (
              <>
                <label className="text-xs font-semibold text-gray-600">
                  Select Delivery Address
                </label>

                <select
                  value={selectedAddress || ""}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                    {addr.door_no}, {addr.street}, {addr.area}, {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                    </option>
                  ))}
                </select>

                <div className="flex gap-4 text-xs">
                  <button
                    onClick={() => setShowNewAddress(true)}
                    className="text-blue-600 underline"
                  >
                    + Add New
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAddress(null);
                      setAddresses([]);
                      setShowNewAddress(true);
                    }}
                    className="text-gray-500 underline"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* NEW ADDRESS FORM */}
            {showNewAddress && (
              <div className="p-3 border rounded-lg bg-gray-50 space-y-3">
               
               <input
                placeholder="Door No"
                value={newAddress.door_no}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    door_no: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              />

              <input
                placeholder="Street"
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    street: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              />

              <input
                placeholder="Area"
                value={newAddress.area}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    area: e.target.value,
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              /> 
                            
                <input
                  placeholder="Address Line"
                  value={newAddress.address_line}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_line: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        city: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2 text-sm"
                  />

                  <input
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        state: e.target.value,
                      })
                    }
                    className="border rounded px-3 py-2 text-sm"
                  />
                </div>

                <input
                  placeholder="Pincode"
                  maxLength={6}
                  value={newAddress.pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setNewAddress((prev) => ({
                      ...prev,
                      pincode: value,
                    }));

                    // ✅ CALL API WHEN 6 DIGITS
                    if (value.length === 6) {
                      fetchCityState(value);
                    }
                  }}
                  className="w-full border rounded px-3 py-2 text-sm"
                />

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3 text-xs">
                  {addresses.length > 0 && (
                    <button
                      onClick={() => setShowNewAddress(false)}
                      className="text-gray-500 underline"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      if (
                       !newAddress.door_no ||
                      !newAddress.street ||
                      !newAddress.area ||
                      !newAddress.address_line ||
                      !newAddress.city ||
                      !newAddress.state ||
                      newAddress.pincode.length !== 6
                      ) {
                        alert("Please fill all address fields properly");
                        return;
                      }

                      try {
                        const payload = {
                          user_id: selectedCustomer?.id,
                        name: customer.name,
                        phone: customer.phone,
                        door_no: newAddress.door_no,
                        street: newAddress.street,
                        area: newAddress.area,
                        address: newAddress.address_line,
                        city: newAddress.city,
                        state: newAddress.state,
                        pincode: newAddress.pincode,
                        };

                        const res = await api.post(
                          "/admin-dashboard/save-address",
                          payload,
                        );

                        if (res.data.success) {
                          const savedAddress = res.data.data; // backend must return full address object

                          // Add to dropdown
                          setAddresses((prev) => [...prev, savedAddress]);

                          // Select newly saved address
                          setSelectedAddress(savedAddress.id);

                          setShowNewAddress(false);

                          // Clear form
                          setNewAddress({
                            door_no: "",
                            street: "",
                            area: "",
                            address_line: "",
                            city: "",
                            state: "",
                            pincode: "",
                          });

                          alert("Address saved successfully");
                        } else {
                          alert(res.data.message);
                        }
                      } catch (err) {
                        alert(
                          err.response?.data?.message ||
                            "Failed to save address",
                        );
                      }
                    }}
                    className="text-green-600 underline font-semibold"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item, i) => (
          <div
            key={i}
            className="border rounded-xl p-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-sm">{item.product_name}</p>
              <p className="text-xs text-gray-500">{item.variation_name}</p>
              <p className="text-sm mt-1 font-semibold">₹ {item.price}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => decreaseQty(i)}
                className="h-8 w-8 border rounded-lg"
              >
                −
              </button>
              <span>{item.qty}</span>
              <button
                onClick={() => increaseQty(i)}
                className="h-8 w-8 border rounded-lg"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="border-t p-4 space-y-3 text-sm">
        <Row label="Subtotal" value={`₹ ${subtotal.toFixed(2)}`} />

        <div className="flex justify-between items-center">
          <span>Discount</span>
          <input
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-right"
          />
        </div>

        <Row label="GST" value={`₹ ${gst.toFixed(2)}`} />
        <Row label="Total" value={`₹ ${total.toFixed(2)}`} />
      </div>

      {/* PAYMENT */}
      <div className="p-4 border-t">
        <button
          disabled={
            cart.length === 0 || !customer.name || !isValidPhone(customer.phone)
          }
          onClick={handleSubmit}
          className="w-full bg-green-700 text-white py-4 rounded-2xl disabled:opacity-40"
        >
          Proceed to Pay ₹ {total.toFixed(2)}
        </button>
      </div>

      {/* OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 space-y-4">
            <h3 className="text-lg font-semibold text-center">Enter OTP</h3>

            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border rounded px-3 py-2 text-center"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setShowOtpModal(false)}
                className="text-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="bg-green-700 text-white px-4 py-2 rounded"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* manulay confirmation */}
      {showPaymentDone && (
        <button
          onClick={handleManualPaymentSuccess}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px 20px",
            marginTop: "10px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Payment Done (Test)
        </button>
      )}


      {showOrderHistory && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-[800px] max-h-[90vh] overflow-y-auto rounded-2xl p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Purchase History</h3>
        <button
          onClick={() => setShowOrderHistory(false)}
          className="text-gray-500 text-lg"
        >
          ✕
        </button>
      </div>

      {orderHistory.map((order) => (
        <div
          key={order.id}
          className="border rounded-xl p-4 mb-4 bg-gray-50"
        >
          {/* ORDER HEADER */}
          <div className="flex justify-between mb-3">
            <div>
              <p className="font-semibold">
                Invoice: {order.invoice_number}
              </p>
              <p className="text-xs text-gray-500">
                Date: {order.date}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-green-700">
                ₹ {order.grand_total}
              </p>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.qty}
                  </p>
                </div>

                <div className="font-semibold">
                  ₹ {item.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {orderHistory.length === 0 && (
        <p className="text-center text-gray-500">
          No purchase history found
        </p>
      )}
    </div>
  </div>
)}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}





