require('./fetch-json')

describe('fetch-json', () => {
  it('makes a fetch request to the demo url', async () => {
    fetch.mockResponseOnce(JSON.stringify({ foo: 'bar' }))

    await worker.run(new Request('https://google.com'))

    expect(fetch).toBeCalledWith('https://httpbin.org/get', expect.anything())
  })

  it('responds with the fetched JSON', async () => {
    fetch.mockResponseOnce(JSON.stringify({ foo: 'bar' }))

    // response is the result of event.respondWith()
    const response = await worker.run(new Request('https://google.com'))

    const responseJson = await response.json()

    expect(responseJson).toEqual({
        foo: 'bar',
    })
  })
})
