require('./cloudflare-obj')

describe('cloudflare-obj', () => {
  it('responds with data from the req.cf object', async () => {
    const response = await worker.run(new Request('https://google.com'))

    const responseJson = await response.json()

    expect(Object.keys(responseJson)).toEqual([
      'asn',
      'colo',
      'httpProtocol',
      'requestPriority',
      'tlsCipher',
      'tlsClientAuth',
      'tlsVersion',
      'country',
      'city',
      'continent',
      'latitude',
      'longitude',
      'postalCode',
      'metroCode',
      'region',
      'regionCode',
      'timezone',
    ])

    expect(responseJson).toMatchObject({
      httpProtocol: 'HTTP/2',
    })
  })
})
