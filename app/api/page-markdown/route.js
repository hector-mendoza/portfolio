export const runtime = "edge";

export async function GET(request) {
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/llms.txt`);
  const text = await res.text();
  return new Response(text, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
