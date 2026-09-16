import Link from "next/link";
import { GuideCta, GuideFormula, GuideTable } from "@/components/GuideChrome";
import { BABY_SAVE_FAQS, BABY_SAVE_GUIDE, BABY_AFFORD_PATH } from "@/lib/guides";
import { BABY_SAVE_FIGURES as F } from "@/lib/child/babySaveGuideFigures";
import { formatMoney, formatPercent } from "@/lib/format";

const pineLink = "font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine";
const ctaButton =
  "mt-4 inline-flex h-12 items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2";

export function HowMuchToSaveBeforeABaby() {
  return (
    <>
      <article className="max-w-3xl">
        <p className="text-base leading-relaxed text-ink">
          There is no single amount of money you need to have saved before having a baby.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A household with {formatMoney(20_000)} saved could be in a stronger position than one with {formatMoney(50_000)}{" "}
          saved. The difference depends on what the money has to pay for, how living costs grow, how much you can keep
          adding each year, and how long each nest egg has before the cost hits.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          So instead of asking only, “How much should I have in the bank before having a baby?” ask the question Nest
          Eggs for a Child is built to answer:
        </p>
        <p className="mt-4 font-medium text-ink">
          What starting balance, plus the yearly add we can keep making, funds the raising years and a separate
          university pot without either nest egg going negative?
        </p>

        <GuideCta>
          <p>
            <span className="font-semibold text-pine">Run your numbers: </span>
            Use the Runaway Finance Nest Eggs for a Child Calculator. The figures below come from that model, not from a
            lifetime-cost headline.
          </p>
          <Link href="/child" className={ctaButton}>
            Open Nest Eggs for a Child
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">The Short Answer: Two Nest Eggs, Plus Cash You Need Soon</h2>
        <GuideTable
          caption="What the calculator funds, and what it leaves outside the pots"
          headers={["Pot", "Purpose", "Time horizon"]}
          rows={[
            [
              "Transition reserve",
              "Setup costs and a parental-leave income gap. Not a calculator field.",
              "Now / first months",
            ],
            [
              "Raising nest egg",
              "Living (Child cost / month), then school and co-curricular extras",
              "Birth through the year before university",
            ],
            [
              "University nest egg",
              "Each university year, from a second pot",
              "University start for the years you enter",
            ],
          ]}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          You do not need every future dollar sitting in cash before the baby arrives. The calculator finds the capital
          required today so that each year the pot can grow at the return you enter, receive the yearly add, pay that
          year’s cost, and never go negative.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Why “A Child Costs $X” Does Not Answer the Question</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          USDA’s most recent Expenditures on Children by Families report estimated that a middle-income married-couple
          family would spend {formatMoney(233_610)} to raise a child born in 2015 through age 17. USDA also notes that
          this report was published in 2017 and is currently being reevaluated, so it should not be treated as a current
          2026 price tag.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Even a perfectly current lifetime-cost estimate would answer a different question: how many dollars might be
          spent over many years. It would not tell you how much capital is required today. Some expenses occur next year.
          Others occur in ten or eighteen years. During that time, prices can rise, you can keep adding to a pot, and
          invested funds may earn a return.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">1. Start With the First-Year Living Cost</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Nest Eggs for a Child starts living costs from Child cost / month. Year one is that monthly amount times 12,
          in today’s dollars.
        </p>
        <GuideFormula>C1 = 12 × monthly child cost</GuideFormula>
        <GuideFormula>
          C1 = 12 × {formatMoney(F.monthly)} = {formatMoney(F.c1)}
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Multiplying {formatMoney(F.c1)} by 18 would assume living never changes and would ignore when each year is
          paid. The calculator does not do that.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">2. Living Costs Grow Two Ways</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The model distinguishes ordinary inflation from an extra age-related increase. Both apply to living, and they
          multiply. For a child born now, years from today and the child’s age move together:
        </p>
        <GuideFormula>
          Living = C1 × (1 + inflation)^t × (1 + age-related increase)^age
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Using the calculator defaults of {formatPercent(F.inflationRate, 0)} inflation and{" "}
          {formatPercent(F.ageDemandRate, 0)} age-related increase, {formatMoney(F.c1)} in year one becomes:
        </p>
        <GuideTable
          caption="Living cost on the $900 / month path"
          headers={["Year from now", "Child age", "Living that year"]}
          rows={[
            ["0", "0", formatMoney(F.livingY0)],
            ["5", "5", formatMoney(F.livingY5)],
            ["10", "10", formatMoney(F.livingY10)],
            ["17", "17", formatMoney(F.livingY17)],
          ]}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          Year one stays in today’s dollars. Later years grow. A single “combined 4%” rate would miss the age-related
          increase. With inflation only, this same path needs a {formatMoney(F.raisingEggNoAgeDemand)} raising nest egg
          today. With both rates, it needs {formatMoney(F.raisingEggLivingOnly)}.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">3. Convert That Path Into a Nest Egg</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Future costs are not the same as money required today. Each calendar year the raising pot does this:
        </p>
        <GuideFormula>End of year = start × (1 + return) + yearly add − that year’s cost</GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The raising nest egg needed today is the smallest starting balance that keeps that path from going negative
          through the year before university starts (ages 0–17 when university starts at 18). The calculator rounds that
          balance up to the next {formatMoney(100)}.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A one-off present-value identity is still useful intuition. If {formatMoney(F.pvExampleFuture)} is due in{" "}
          {F.pvExampleYears} years and the money hypothetically earns {formatPercent(F.returnRate, 0)} a year:
        </p>
        <GuideFormula>
          PV = {formatMoney(F.pvExampleFuture)} / (1.05)^{F.pvExampleYears} ≈ {formatMoney(F.pvExampleToday)}
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Nest Eggs for a Child does not stop at that single discount. It applies return, then the yearly add, then the
          cost, every year, including the first year in today’s dollars.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">4. The Raising Nest Egg Through 18</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          On the {formatMoney(F.monthly)} / month living path, with {formatPercent(F.inflationRate, 0)} inflation,{" "}
          {formatPercent(F.ageDemandRate, 0)} age-related increase, {formatPercent(F.returnRate, 0)} return, and no
          yearly add, the raising nest egg needed today is {formatMoney(F.raisingEggLivingOnly)}.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          School cost / year and co-curricular / year sit on this same pot. They begin at the school start age and grow
          with education inflation, not ordinary inflation. They are not a third nest egg, and they are not university.
        </p>
        <GuideFormula>
          School that year = school today × (1 + education inflation)^t, once age ≥ school start
        </GuideFormula>

        <h2 className="mt-10 font-serif text-2xl text-pine">5. Childcare Goes Into Child Cost / Month</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Childcare is often a large U.S. expense. Child Care Aware of America reported a national average child-care
          price of {formatMoney(13_128)} for 2024, while warning that prices vary substantially by state and locality.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Nest Eggs for a Child does not collect a childcare amount, start month, or stop date. Paid care belongs in
          Child cost / month. That living stream runs through the year before university and grows with inflation and
          the age-related increase.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          If you add {formatMoney(F.careMonthly)} of care to the {formatMoney(F.monthly)} living example, monthly child
          cost becomes {formatMoney(F.carePlusLivingMonthly)}. The raising nest egg needed today becomes{" "}
          {formatMoney(F.care2400Egg)} — not a four-year block of {formatMoney(F.careMonthly)} × 12 × 4. If care will not
          last 18 years, entering it as a permanent monthly cost will overstate later years. That is a limit of the
          current tool, not a hidden duration field.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">6. Parental Leave Is Cash You Need Soon</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Parental leave is a liquidity problem. It can cut take-home income for a few months. It is not an 18-year
          expense, and it is not a Nest Eggs for a Child input.
        </p>
        <GuideFormula>
          Parental-leave reserve = {formatMoney(F.leaveMonthlyGap)} × {F.leaveMonths} = {formatMoney(F.leaveReserve)}
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Hold that in a transition reserve with setup costs. Do not enter it as Child cost / month. In the United
          States, paid-leave rules vary. Eligible employees may receive job-protected unpaid leave under federal FMLA,
          while paid leave can depend on employer benefits, state programs, or other eligibility. Use the income you
          actually expect to receive.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">7. University Is a Separate Multi-Year Nest Egg</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          University is a second pot so the raising nest egg is not treated as college money. The calculator does not
          collapse college into one inflated lump at age 18.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Each university year costs today’s annual university amount grown at education inflation for that many years
          from now. Yearly adds to the university pot stop when university starts. The university nest egg needed today
          is the starting balance that pays every university year without going negative.
        </p>
        <GuideFormula>
          University cost that year = university cost today × (1 + education inflation)^t
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          With {formatMoney(F.universityAnnualToday)} a year today, {F.universityYears} years starting at age{" "}
          {F.universityStartAge}, {formatPercent(F.educationInflationRate, 0)} education inflation, and{" "}
          {formatPercent(F.returnRate, 0)} return, the first university year is about {formatMoney(F.uniFirstYear)} and
          the fourth is about {formatMoney(F.uniLastYear)}. The university nest egg needed today, with nothing saved and
          no yearly add, is {formatMoney(F.uniEgg)} — not {formatMoney(F.universityAnnualToday)}.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">8. What You Already Have, and What You Keep Adding</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Each pot has its own already-saved amount and its own yearly add. The yearly add continues until university
          starts. Because those deposits are inside the year-by-year path, they cut the nest egg needed today. They are
          not a separate pile that ignores costs.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          On the {formatMoney(F.monthly)} / month living path, {formatMoney(F.raisingSavings)} already in the raising
          pot and a {formatMoney(F.raisingAnnualSave)} yearly add change the raising nest egg needed today to{" "}
          {formatMoney(F.raisingEggWithSave)}. That is {formatMoney(F.additionalEggWithSave)} more than the{" "}
          {formatMoney(F.raisingSavings)} already saved, or about {formatMoney(F.extraAnnualWithSave)} extra per year
          until university on top of the add already entered.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">9. Turn That Into a Readiness Date</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The calculator also asks when the raising path is funded if you wait before the baby. It does not wait until a
          lump target is hit and then stop. It tests each possible delay: save during the wait, then pay living (and
          school, if entered) while the yearly add continues until university.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          In the {formatMoney(F.raisingSavings)} plus {formatMoney(F.raisingAnnualSave)} / year illustration, the
          raising present value is funded in {F.yearsUntilReady} years. If the baby is now, that is later than the
          planned arrival. That is a planning result, not an approval to become a parent.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">10. Stress-Test the Result</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          A path through 18 is a scenario, not a prediction. Change the fields the calculator actually has.
        </p>
        <GuideTable
          caption="What to change in Nest Eggs for a Child"
          headers={["Input", "Base case", "Harder case"]}
          rows={[
            ["Child cost / month", "Local living and care you expect", "Higher care inside the same monthly field"],
            ["School and co-curricular", "What you will actually pay", "Higher tuition or extras"],
            ["Inflation and age-related increase", "The living defaults", "Faster living growth"],
            ["Education inflation", "School and university default", "Faster education costs"],
            ["Return on these pots", "A conservative invested rate", "A lower return"],
            ["Yearly add / years until the baby", "What you can sustain", "A smaller add or a shorter wait"],
          ]}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          If a small change moves the nest egg or the ready year a long way, the plan is sensitive to that input. That
          is useful.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">So How Much Should You Save Before Having a Baby?</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          There is no defensible universal answer such as {formatMoney(10_000)}, {formatMoney(25_000)}, or{" "}
          {formatMoney(50_000)}. Your number is the raising nest egg, the university nest egg, the yearly adds you can
          keep making, and the cash reserve for setup and leave.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A household with modest savings but a strong yearly add can have a very different path from a household with
          more cash and little capacity to keep contributing. The better questions are: What starting balance does each
          pot need? How much do we already have in that pot? How quickly does the yearly add close the gap? Which
          assumption moves the answer?
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Run Your Own Child Nest-Egg Calculation</h2>
        <GuideCta>
          <p>Use the Runaway Finance Nest Eggs for a Child Calculator.</p>
          <p>
            Enter what you already have in each pot, the yearly add until university, Child cost / month, school and
            extras, university cost and years, inflation, the age-related increase, education inflation, and return.
            Then change the assumptions. A useful model is not one that gives you a reassuring number. It is one that
            shows you why the number changes.
          </p>
          <Link href="/child" className={ctaButton}>
            Open Nest Eggs for a Child
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">Frequently Asked Questions</h2>
        {BABY_SAVE_FAQS.map((faq) => (
          <div key={faq.question}>
            <h3 className="mt-6 font-serif text-xl text-pine">{faq.question}</h3>
            <p className="mt-3 text-base leading-relaxed text-ink">{faq.answer}</p>
          </div>
        ))}

        <h2 className="mt-10 font-serif text-2xl text-pine">The Bottom Line</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The amount you should have saved before having a baby is not one universal number because the financial
          problem has time built into it.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Some cash is needed immediately for setup and leave. Living costs run through the year before university and
          grow with inflation and age. School and extras join that same raising pot. University is a second multi-year
          stream. Yearly adds cut what you must have on hand today.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Once the problem is framed that way, preparing for a baby is not only a monthly budget. It is two nest eggs,
          plus the cash you need before those pots have time to work.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Sources and Methodology</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          U.S. Department of Agriculture, Expenditures on Children by Families, 2015 (published 2017): projected{" "}
          {formatMoney(233_610)} to raise a child born in 2015 through age 17. USDA states this is its most recent
          report and that the methodology is being reevaluated. It is included here as historical context, not as a 2026
          cost estimate.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Child Care Aware of America, Child Care in America: 2024 Price &amp; Supply (published May 2025): national
          average child-care price of {formatMoney(13_128)} for 2024, with substantial state and local variation.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          U.S. Department of Labor: federal FMLA can provide eligible employees job-protected leave; paid parental leave
          under FEPLA applies to covered federal employees. Private-sector paid leave depends on employer benefits,
          state programs and eligibility. Leave cash is discussed here as a household reserve, not as a calculator
          field.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Worked figures in this guide were produced with Nest Eggs for a Child. Living in year t is first-year living
          times inflation to the power of years from now times the age-related increase to the power of the child’s age.
          Each year a pot does start × (1 + return) + yearly add − cost. Nest egg needed today is the smallest starting
          balance that never goes negative, rounded up to the next {formatMoney(100)}. University is each of the
          university years, inflated at education inflation. Examples are illustrations, not a forecast of what a
          household will spend. Returns are not guaranteed.
        </p>
        <p className="mt-6 text-sm text-muted">Last reviewed: {BABY_SAVE_GUIDE.reviewed}</p>
      </article>

      <nav className="mt-12 max-w-3xl border-t border-pine/15 pt-8" aria-label="Growing a Family calculators">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Growing a Family</p>
        <p className="mt-2 font-serif text-xl text-pine">Continue with the Growing a Family calculators</p>
        <p className="mt-3 text-base leading-relaxed text-ink">
          This guide is the nest-egg companion to the family tools. Use them to test living, school and university pots
          against the rest of the household plan.
        </p>
        <ul className="mt-4 space-y-2">
          <li>
            <Link href="/family" className={pineLink}>
              See the Growing a Family calculators
            </Link>
          </li>
          <li>
            <Link href="/child" className={pineLink}>
              Open Nest Eggs for a Child
            </Link>
          </li>
          <li>
            <Link href={BABY_AFFORD_PATH} className={pineLink}>
              Read Can I Afford to Have a Baby?
            </Link>
          </li>
          <li>
            <Link href="/guides/family" className={pineLink}>
              More Family &amp; Children guides
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
