import { NEED_DEFAULT } from "@/lib/need/defaults";
import type { CalculatorInput } from "@/lib/engine";

/** Lean plan, plus the two facility rents this compare runs as exclusive paths. */
export const HOUSING_DEFAULT: CalculatorInput = {
  ...NEED_DEFAULT,
  ccrcRentAnnual: 48_000,
  ccrcStartAge: 75,
  nursingHomeRentAnnual: 100_000,
  nursingHomeStartAge: 85,
  seniorHomeRentAnnual: 0,
};
