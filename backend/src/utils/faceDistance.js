export function validateDistance(arr1, arr2) {
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
