import { useEffect, useState } from "react";

// FIX (Task 5.15): debounce hook untuk search inputs.
// value: nilai yang berubah (mis. setiap keystroke)
// delay: jeda dalam ms sebelum nilai di-update.
// Return: nilai yang sudah di-debounce.
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
