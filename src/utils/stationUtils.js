export function normalizeStations(data) {
  // Return an array normalized from various API response shapes
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.stations)) return data.stations;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && (data._id || data.stationId)) return [data];
  if (data && typeof data === 'object') {
    const arr = Object.values(data).find(v => Array.isArray(v));
    if (arr) return arr;
  }
  return [];
}

export default normalizeStations;
