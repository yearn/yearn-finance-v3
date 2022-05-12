import { encode } from './encode';

describe('encode', () => {
  it('should encode a string to the specified encoding', () => {
    const actual = encode({ str: '96e0cc51-a62e-42ca-acee-910ea7d2a241:', encoding: 'base64' });

    expect(actual).toEqual('OTZlMGNjNTEtYTYyZS00MmNhLWFjZWUtOTEwZWE3ZDJhMjQxOg==');
  });
});
