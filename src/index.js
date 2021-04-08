const NodeEnvironment = require('jest-environment-node')
const { ModuleMocker } = require('jest-mock')
const cloudworker = require('@dollarshaveclub/cloudworker')
const mockFetch = require('./mock-fetch')

const moduleMocker = new ModuleMocker(global)
const jestFn = moduleMocker.fn.bind(moduleMocker)

const cfRequestHeaders = {
  asn: '395747',
  colo: 'IATA',
  httpProtocol: 'HTTP/2',
  requestPriority: 'weight=192;exclusive=0;group=3;group-weight=127',
  tlsCipher: 'AEAD-AES128-GCM-SHA256',
  tlsClientAuth: 'certIssuerDNLegacy',
  tlsVersion: 'TLSv1.3',
  country: 'CF-IPCountry',
  city: 'Austin',
  continent: 'NA',
  latitude: '30.27130',
  longitude: '-97.74260',
  postalCode: '78701',
  metroCode: '635',
  region: 'Texas',
  regionCode: 'TX',
  timezone: 'America/Chicago',
}

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
    this.global.worker.run = async (originalRequest) => {
      return new Promise((resolve, reject) => {
        const fetchHandler = this.global.worker.listeners.fetch

        const request = new cloudworker.Request(originalRequest)

        Object.defineProperty(request, 'cf', {
          value: { ...cfRequestHeaders },
          writable: false,
          enumerable: false,
        })

        const promiseQueue = []

        const mockedEvent = {
          request,
          waitUntil: jestFn(async (thenable) => {
            promiseQueue.push(thenable)

            try {
              await thenable
            } catch (err) {
              console.error(err)
              reject(err)
            }
          }),
          respondWith: async (response) => {
            await Promise.all(promiseQueue)

            try {
              const res = await response
              resolve(res)
            } catch (err) {
              console.error(err)
              reject(err)
            }
          },
        }

        this.global.worker.event = mockedEvent

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
