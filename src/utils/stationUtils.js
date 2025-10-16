export function normalizeStations(data) {
  // Return an array normalized from various API response shapes
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.stations)) return data.stations;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && (data._id || data.stationId)) return [data];

  // recursive search for first array value in nested objects (depth-limited)
  function findArrayDeep(obj, depth = 3) {
    if (!obj || typeof obj !== 'object' || depth < 0) return null;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (Array.isArray(v)) return v;
      if (v && typeof v === 'object') {
        const found = findArrayDeep(v, depth - 1);
        if (found) return found;
      }
    }
    return null;
  }

  if (data && typeof data === 'object') {
    const arr = findArrayDeep(data, 4);
    if (arr) return arr;
  }

  return [];
}

export default normalizeStations;
