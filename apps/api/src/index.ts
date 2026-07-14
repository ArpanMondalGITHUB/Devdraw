import { greet, type User } from "@devdraw/shared";

Bun.serve({
  port: 3001,
  routes: {
    "/api/hello": () => {
      const user: User = { id: "1", name: "Arpan" };
      return Response.json({ message: greet(user.name) });
    },
  },
});

console.log("API on http://localhost:3001");
