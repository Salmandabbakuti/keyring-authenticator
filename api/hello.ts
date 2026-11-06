Bun.serve({
  fetch(req) {
    const url = new URL(req.url);

    return Response.json({
      message: "Hello from Bun on Vercel",
      pathname: url.pathname
    });
  }
});
