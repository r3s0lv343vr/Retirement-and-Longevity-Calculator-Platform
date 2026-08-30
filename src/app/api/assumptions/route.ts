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
        "The nest egg uses a future-value lump sum plus an ordinary annuity until retirement. Yearly deposits stay level unless you turn on rising savings with inflation. Social Security has COLA (general inflation). A 67 vs 70 claiming compare scales the entered check; the main run does not. Pension is omitted when $0; its COLA can be turned off. A weak first-decade return path is shown beside the usual-return outlook.",
    },
  });
}
