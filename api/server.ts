Bun.serve({
  routes: {
    "/health": () => Response.json({ status: "ok" }),
    "/hello": () => new Response("Hello from Bun!")
  }
});
