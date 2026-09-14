import { NextResponse } from "next/server";
import { withRunTracking } from "@/lib/admin/request";
import { estimateMortgage, mergeMortgageInput, validateMortgageInput } from "@/lib/mortgage/estimateMortgage";
import type { MortgagePayload } from "@/lib/mortgage/defaults";

export async function POST(request: Request) {
  let payload: MortgagePayload = {};
  try {
    const text = await request.text();
    if (text) {
      payload = JSON.parse(text) as MortgagePayload;
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const input = mergeMortgageInput(payload);
  const errors = validateMortgageInput(input);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Invalid input.", errors }, { status: 400 });
  }

  return withRunTracking(request, "mortgage", NextResponse.json(estimateMortgage(input)));
}
