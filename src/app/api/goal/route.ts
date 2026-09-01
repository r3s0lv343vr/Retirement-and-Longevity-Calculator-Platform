import { NextResponse } from "next/server";
import { withRunTracking } from "@/lib/admin/request";
import { estimateGoal, mergeGoalInput, validateGoalInput } from "@/lib/goal/estimateGoal";
import type { GoalPayload } from "@/lib/goal/defaults";

export async function POST(request: Request) {
  let payload: GoalPayload = {};
  try {
    const text = await request.text();
    if (text) {
      payload = JSON.parse(text) as GoalPayload;
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const input = mergeGoalInput(payload);
  const errors = validateGoalInput(input);
  if (errors.length > 0) {
    return NextResponse.json({ error: "Invalid input.", errors }, { status: 400 });
  }

  return withRunTracking(request, "goal", NextResponse.json(estimateGoal(input)));
}
