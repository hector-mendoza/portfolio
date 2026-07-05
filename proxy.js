import { NextResponse } from "next/server";

export function proxy(request) {
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/markdown")) {
    return NextResponse.rewrite(new URL("/api/page-markdown", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
