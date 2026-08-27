import { NextResponse } from "next/server";
import { mergeInput, project, validateInput } from "@/lib/engine";
import type { CalculatorPayload } from "@/lib/engine";

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
  const errors = validateInput(input);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Invalid input.", errors }, { status: 400 });
  }

  const result = project(input);
  return NextResponse.json(result);
}
