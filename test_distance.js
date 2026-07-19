import { validateDistance } from "./backend/src/utils/faceDistance.js";

const arr1 = [0.1, 0.2, 0.3];
const arr2Obj = { "0": 0.1, "1": 0.2, "2": 0.3 };

console.log("Distance with array:", validateDistance(arr1, arr1));
console.log("Distance with object:", validateDistance(arr1, arr2Obj));
