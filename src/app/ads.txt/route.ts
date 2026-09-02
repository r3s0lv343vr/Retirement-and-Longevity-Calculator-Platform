import { adsensePublisherId } from "@/lib/ads";

export const dynamic = "force-dynamic";

export function GET() {
  const client = adsensePublisherId();
  if (!client) {
    return new Response("AdSense is not attached.\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const publisher = client.replace(/^ca-/, "");
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
