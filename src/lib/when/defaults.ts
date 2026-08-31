import { NEED_DEFAULT } from "@/lib/need/defaults";
import type { CalculatorInput } from "@/lib/engine";

/** Same lean starting point as How much. Work-end is the unknown, not an input. */
export const WHEN_DEFAULT: CalculatorInput = { ...NEED_DEFAULT };
