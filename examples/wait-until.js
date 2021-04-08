async function delayedFetch(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      fetch('https://httpbin.org/get').then(resolve)
    }, ms)
  })
}

async function handleEvent(event) {
  event.waitUntil(delayedFetch(500))
  return new Response('body')
}

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})
