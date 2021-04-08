require('./wait-until')

describe('wait-until', () => {
  it('waits until all waited-on promises have fulfilled', async () => {
    fetch.mockResponseOnce('')

    const response = await worker.run(new Request('https://google.com'))

    const responseBody = await response.text()

    expect(fetch).toHaveBeenCalled()
    expect(responseBody).toEqual('body')
  })

  it('can assert on event.waitUntil calls', async () => {
    await worker.run(new Request('https://google.com'))
    expect(worker.event.waitUntil).toHaveBeenCalled()
  })
})
