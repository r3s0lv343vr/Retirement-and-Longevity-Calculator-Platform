import { NextResponse } from "next/server";
import { DEFAULT_INPUT, FIELD_META } from "@/lib/engine";

export async function GET() {
  return NextResponse.json({
    defaults: DEFAULT_INPUT,
    fields: FIELD_META,
    notes: {
      phases:
        "Go-go, slow-go, and no-go years scale lifestyle spending. Healthcare is inflated separately and rises with age.",
      returns:
        "The nest egg uses a future-value lump sum plus an ordinary annuity until retirement. Guaranteed income is annuity[social security, r=0%] + annuity[pension, r=0%] from the nest-egg cutoff through the plan-through age (pension omitted when $0). Inflation raises spending, not deposits or guaranteed income.",
    },
  });
}
