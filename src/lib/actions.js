const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SECRET_KEY = 0xa3b1c2d3n;
function base62Encode(num) {
  let encoded = "";
  const base = 62n;
  num = BigInt(num);
  while (num > 0n) {
    encoded = BASE62[Number(num % base)] + encoded;
    num = num / base;
  }
  return encoded.padStart(8, "0");
}
function base62Decode(str) {
  let num = 0n;
  const base = 62n;
  for (let char of str) {
    const value = BigInt(BASE62.indexOf(char));
    num = num * base + value;
  }
  return num;
}
function encrypt(phoneNumber) {
  if (!/^\d{12}$/.test(phoneNumber)) {
    throw new Error("Phone number must be exactly 10 digits.");
  }
  const num = BigInt(phoneNumber);
  const obfuscated = num ^ SECRET_KEY;
  return base62Encode(obfuscated);
}
function decrypt(cipherText) {
  if (!/^[0-9A-Za-z]{8}$/.test(cipherText)) {
    throw new Error("Cipher text must be exactly 8 base62 characters.");
  }
  const decoded = base62Decode(cipherText);
  const original = decoded ^ SECRET_KEY;
  return original.toString().padStart(10, "0");
}
function generateAlphaCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
const isUserAdmin = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login again");
    return false;
  }

  const response = await fetch(`${BACKEND_URL}/auth/admin-login`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (data.status === 200) {
    return true;
  } else {
    toast.error(data.message);
    return false;
  }
};


export {
  isUserAdmin,
  generateAlphaCode,
  encrypt,
  decrypt,
  base62Decode,
  base62Encode
};
