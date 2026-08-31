import { NextResponse } from "next/server";
import { mergeInput } from "@/lib/engine";
import type { CalculatorPayload } from "@/lib/engine";
import { estimateWorkEnd, validateWhenInput } from "@/lib/when/estimateWorkEnd";
import { withRunTracking } from "@/lib/admin/request";

export async function POST(request: Request) {
  let payload: CalculatorPayload = {};
  try {
    const text = await request.text();
    if (text) {
      payload = JSON.parse(text) as CalculatorPayload;
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const input = mergeInput(payload);
  const errors = validateWhenInput(input);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Invalid input.", errors }, { status: 400 });
  }

  return withRunTracking(request, "when", NextResponse.json(estimateWorkEnd(input)));
}
