const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/* Lấy token */
function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    return auth?.state?.token || null;
  } catch {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  }
}

/* Parse JSON */
async function parseJSON(res) {
  const type = res.headers.get("content-type");
  if (type && type.includes("application/json")) return await res.json();
  throw new Error(`Server không trả JSON. Status ${res.status}`);
}

/* Lấy payment URL */
function getPayUrl(data) {
  return (
    data.payUrl ||
    data.pay_url ||
    data.deepLink ||
    data.deeplink ||
    data.qrCodeUrl ||
    null
  );
}

/* Tạo thanh toán MoMo */
export async function createMoMoPayment(orderId, orderInfo = null) {
  const token = getToken();
  if (!token) {
    return { success: false, error: "Bạn chưa đăng nhập." };
  }

  const body = {
    order_id: orderId,
    order_info: orderInfo || `Thanh toán đơn hàng ${orderId}`,
  };

  const res = await fetch(`${API_BASE_URL}/payments/momo/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await parseJSON(res);

  if (!res.ok) {
    const msg =
      data.message ||
      data.error ||
      `MoMo Error Code: ${data.resultCode || "UNKNOWN"}`;
    return { success: false, error: msg, data };
  }

  const payUrl = getPayUrl(data);

  return {
    success: true,
    payUrl,
    deepLink: data.deepLink || data.deeplink,
    qrCodeUrl: data.qrCodeUrl,
    resultCode: data.resultCode,
    data,
  };
}

/* Redirect thanh toán */
export async function payWithMoMo(orderId, orderInfo = null) {
  const res = await createMoMoPayment(orderId, orderInfo);

  if (!res.success) {
    alert(res.error);
    throw new Error(res.error);
  }

  const redirectUrl = res.deepLink || res.payUrl || res.qrCodeUrl;

  if (!redirectUrl) throw new Error("Không nhận được URL thanh toán từ MoMo");

  window.location.href = redirectUrl;
}

/* Xử lý return URL */
export function handleMoMoReturn() {
  const q = new URLSearchParams(window.location.search);
  const orderId = q.get("orderId") || q.get("order_id");
  const resultCode = q.get("resultCode");
  const frontend = window.location.origin;

  if (resultCode == "0") {
    // Redirect đến order-success với status=success
    window.location.href = `${frontend}/order-success?order_id=${orderId}&method=momo&status=success`;
  } else {
    window.location.href = `${frontend}/payment/failed?order_id=${orderId}&method=momo&error=${resultCode}`;
  }
}
