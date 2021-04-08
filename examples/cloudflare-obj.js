addEventListener('fetch', (event) => {
  const data =
    event.request.cf !== undefined
      ? event.request.cf
      : { error: 'The `cf` object is not available inside the preview.' }

  return event.respondWith(
    new Response(JSON.stringify(data, null, 2), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    })
  )
})
