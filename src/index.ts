import index from "./index.html";

const server = Bun.serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    "/health": () => Response.json({ status: "ok" })
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,
    // Echo console logs from the browser to the server
    console: true
  }
});

console.log(`🚀 Server running at ${server.url}`);
