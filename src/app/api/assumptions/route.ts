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
        "The nest egg uses a future-value lump sum plus an ordinary annuity until retirement. Social Security has COLA (general inflation). Pension is omitted when $0; its COLA can be turned off. Inflation raises spending and COLA income, not nest-egg deposits.",
    },
  });
}
