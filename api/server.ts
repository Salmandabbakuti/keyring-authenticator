Bun.serve({
  routes: {
    "/health": () => Response.json({ status: "ok" })
  },
  fetch: (req) => new Response("Not Found", { status: 404 }),
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,
    // Echo console logs from the browser to the server
    console: true
  }
});
