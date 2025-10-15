import normalizeStations from '../stationUtils';

describe('normalizeStations', () => {
  test('returns empty array for falsy input', () => {
    expect(normalizeStations(null)).toEqual([]);
    expect(normalizeStations(undefined)).toEqual([]);
  });

  test('passes through arrays', () => {
    const arr = [{ _id: '1' }, { _id: '2' }];
    expect(normalizeStations(arr)).toBe(arr);
  });

  test('extracts stations property', () => {
    const data = { stations: [{ _id: 's1' }] };
    expect(normalizeStations(data)).toEqual([{ _id: 's1' }]);
  });

  test('extracts data property', () => {
    const data = { data: [{ _id: 'd1' }] };
    expect(normalizeStations(data)).toEqual([{ _id: 'd1' }]);
  });

  test('wraps single object', () => {
    const obj = { _id: 'single', stationId: 'S1', name: 'One' };
    expect(normalizeStations(obj)).toEqual([obj]);
  });

  test('finds first array-valued prop', () => {
    const data = { meta: {}, list: [{ _id: 'l1' }], other: 'x' };
    expect(normalizeStations(data)).toEqual([{ _id: 'l1' }]);
  });
});
