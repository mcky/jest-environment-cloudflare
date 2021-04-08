const NodeEnvironment = require('jest-environment-node')
const cloudworker = require('@dollarshaveclub/cloudworker')
const mockFetch = require('./mock-fetch')

class CloudflareEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context)
  }

  async setup() {
    await super.setup()

    const globals = {
      Request: cloudworker.Request,
      Response: cloudworker.Response,

      fetch: mockFetch,

      worker: {
        listeners: {},
      },
    }

    Object.assign(this.global, globals)

    // @TODO: Respond to schedule event
    this.global.worker.run = async (request) => {
      return new Promise((resolve, reject) => {
        const fetchHandler = this.global.worker.listeners.fetch

        const mockedEvent = {
          request: request,
          waitUntil: async (...args) => {
            // @TODO
          },
          respondWith: async (response) => {
            try {
              const res = await response
              resolve(res)
            } catch (err) {
              console.error(err)
              reject(err)
            }
          },
        }

        try {
          fetchHandler(mockedEvent)
        } catch (err) {
          console.error(err)
        }
      })
    }

    this.global.addEventListener = (type, handler) => {
      if (!this.global.worker.listeners.fetch) {
        this.global.worker.listeners.fetch = handler
      } else {
        throw new Error('Only one fetch event listener allowed')
      }
    }
  }
}

module.exports = CloudflareEnvironment
