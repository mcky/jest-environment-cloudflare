# jest-environment-cloudflare
A jest test environment for testing cloudflare workers

Unit test your cloudflare workers just like the rest of your code - without having to modify your workers or inject them into a workers runtime.

⚠️ **Warning:** This package is currently a work in progress and therefor unstable. It only has a subset of cloudflare worker's
functionality and has some parallelity issues due to global usage. It's also built on top of the jest node environment, whereas
cloudflare workers are run in an [isolated V8 environment](https://developers.cloudflare.com/workers/learning/security-model).


## Usage
To enable for all tests set the `testEnvironment` in your jest config (`jest.config.js`, or `package.json` under `jest` - see [Configuring Jest](https://jestjs.io/docs/configuration))
```js
module.exports = {
  testEnvironment: 'jest-environment-cloudflare'
}
```

To enable for a specific file add the `@jest-environment` pragma at the top of the file
```
/**
 * @jest-environment jest-environment-cloudflare
 */
```

Given a worker file (example below)
```js
// worker.js
const log = require('./my-logger')

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })

async function handleRequest() {
  return fetch('https://example.com')
}

addEventListener('fetch', (event) => {
  event.waitUntil(delay(500).then(log))
  return event.respondWith(handleRequest())
})
```

Then in your tests call `await worker.run(request)` to trigger an invocation of your fetch handler
```js
// worker.test.js
const log = require('./my-logger')
require('./worker')

jest.mock('./my-logger', () => {
  return jest.fn()
})

describe('jest-env-cloudflare', () => {
  it('allows you to run a worker and assert on the response', async () => {
    // The env provides a global `worker` variable which allows you to
    // simulate the worker responding to a fetch event
    const response = await worker.run(new Request('https://example.com'))

    // It also provides `Request`/`Response` globals
    expect(response).toBeInstanceOf(Response)
  })

  it('allows mocking fetch calls', async () => {
    // Use a cloudflare-emulating jest-fetch-mock
    fetch.mockResponseOnce(
      JSON.stringify({
        data: [],
      })
    )

    await worker.run(new Request('https://google.com'))
    expect(fetch).toHaveBeenCalledWith('https://example.com')
  })

  it('allows asserting on a workers response', async () => {
    const mockApiData = { data: [] }
    fetch.mockResponseOnce(JSON.stringify(mockApiData))

    const response = await worker.run(new Request('https://example.com'))
    
    // Treat the response as you would any other fetch
    // Coming soon - custom assertions
    const responseBody = await response.json()
    expect(responseBody).toEqual(mockApiData)
  })

  it('will wait for event.waitUntil calls to resolve', async () => {
    await worker.run(new Request('https://example.com'))

    // Our function calls `log` after a delay - our test will wait for
    // it to resolve before stopping execution.
    expect(worker.event.waitUntil).toHaveBeenCalled()
    expect(log).toHaveBeenCalled()
  })
})
```
