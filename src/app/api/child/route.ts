import { NextResponse } from "next/server";
import { withRunTracking } from "@/lib/admin/request";
import { estimateChild, mergeChildInput, validateChildInput } from "@/lib/child/estimateChild";
import type { ChildPayload } from "@/lib/child/defaults";

export async function POST(request: Request) {
  let payload: ChildPayload = {};
  try {
    const text = await request.text();
    if (text) {
      payload = JSON.parse(text) as ChildPayload;
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const input = mergeChildInput(payload);
  const errors = validateChildInput(input);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Invalid input.", errors }, { status: 400 });
  }

  return withRunTracking(request, "child", NextResponse.json(estimateChild(input)));
}
