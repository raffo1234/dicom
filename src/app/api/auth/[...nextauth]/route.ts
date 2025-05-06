// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"; // Adjust the import path if needed

// Handlers for GET, POST, PUT, DELETE, etc.
// These functions receive the incoming request context automatically from Next.js
export const { GET, POST } = handlers;

// IMPORTANT: Do NOT put await auth(); or code that calls auth() directly here
// outside of the GET or POST handler functions.
// Example of what NOT to do:
// const sessionCheck = await auth(); // <-- ERROR: Called outside request scope
// console.log(sessionCheck);
