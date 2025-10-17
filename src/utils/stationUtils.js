export function normalizeStations(data) {
  // Return an array normalized from various API response shapes
  // and ensure each station has stable keys used by the UI.
  const sampleStations = [
    { name: 'Aramco Station A', stationId: 'A-100', _id: 'A-100', location: { type: 'Point', coordinates: [46.6753, 24.7136] } },
    { name: 'Aramco Station B', stationId: 'B-200', _id: 'B-200', location: { type: 'Point', coordinates: [46.68, 24.716] } },
    { name: 'Aramco Station C', stationId: 'C-300', _id: 'C-300', location: { type: 'Point', coordinates: [46.6825, 24.718] } }
  ];

  if (!data) {
    // No data returned from API: don't silently fall back to sample stations.
    // Return an empty array so the UI can surface a clear empty state or error.
    return [];
  }

  let arr = null;
  if (Array.isArray(data)) arr = data;
  else if (data && Array.isArray(data.stations)) arr = data.stations;
  else if (data && Array.isArray(data.data)) arr = data.data;
  else if (data && (data._id || data.stationId)) arr = [data];

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

  if (!arr && data && typeof data === 'object') {
    arr = findArrayDeep(data, 4);
  }

  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    // No stations found in API response — return empty array and let the UI
    // show a helpful message or debugging output.
    return [];
  }

  // Normalize each station object to guarantee fields the UI expects.
  const normalized = arr.map((s, idx) => {
    const out = { ...s };
    // Ensure stationId and _id exist
    if (!out.stationId && out._id) out.stationId = String(out._id);
    if (!out._id && out.stationId) out._id = String(out.stationId);
    if (!out._id) out._id = out.stationId || `station-${idx}`;
    if (!out.stationId) out.stationId = out._id;
    if (!out.name) out.name = out.stationId;
    return out;
  });

  return normalized;
}

export default normalizeStations;
