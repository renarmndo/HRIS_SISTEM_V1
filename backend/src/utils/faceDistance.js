export function validateDistance(arr1, arr2) {
  // Parsing defensively if values are stored/sent as JSON strings
  if (typeof arr1 === "string") {
    try {
      arr1 = JSON.parse(arr1);
    } catch (e) {
      console.error("validateDistance: Failed to parse arr1:", e);
    }
  }
  if (typeof arr2 === "string") {
    try {
      arr2 = JSON.parse(arr2);
    } catch (e) {
      console.error("validateDistance: Failed to parse arr2:", e);
    }
  }
  // Handle double-serialized JSON strings
  if (typeof arr1 === "string") {
    try {
      arr1 = JSON.parse(arr1);
    } catch (e) {}
  }
  if (typeof arr2 === "string") {
    try {
      arr2 = JSON.parse(arr2);
    } catch (e) {}
  }

  // FIX: Handle cases where Sequelize/Network returns an object with numeric keys instead of an array
  if (arr1 && typeof arr1 === "object" && !Array.isArray(arr1)) {
    arr1 = Object.values(arr1);
  }
  if (arr2 && typeof arr2 === "object" && !Array.isArray(arr2)) {
    arr2 = Object.values(arr2);
  }

  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return Infinity;
  if (arr1.length === 0 || arr2.length === 0) return Infinity;
  if (arr1.length !== arr2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const a = Number(arr1[i]);
    const b = Number(arr2[i]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
    sum += Math.pow(a - b, 2);
  }
  return Math.sqrt(sum);
}
