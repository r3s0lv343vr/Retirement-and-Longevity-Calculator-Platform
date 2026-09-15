import Link from "next/link";
import { GuideCta, GuideFormula, GuideTable } from "@/components/GuideChrome";
import { BABY_AFFORD_FAQS, BABY_AFFORD_GUIDE } from "@/lib/guides";

const pineLink = "font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine";
const ctaButton =
  "mt-4 inline-flex h-12 items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2";

export function CanIAffordToHaveABaby() {
  return (
    <>
      <article className="max-w-3xl">
        <p className="text-base leading-relaxed text-ink">
          Having a baby isn&apos;t just a question of how much a baby costs. The more useful question is whether your
          household can absorb the new costs, possible changes in income, and longer-term financial commitments without
          putting the rest of your finances under too much pressure.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          For some U.S. households, childcare will be the biggest new expense. For others, the pressure may come from
          unpaid or partially paid parental leave, healthcare costs, moving to a larger home, or adding recurring
          expenses to an already tight budget.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          There is no universal salary or savings balance that determines whether you can afford a baby. A better
          approach is to model what happens to your household before the baby arrives, during parental leave, through
          the childcare years, and as the child grows.
        </p>

        <GuideCta>
          <p>
            <span className="font-semibold text-pine">Run your numbers: </span>
            Use the Runaway Finance Nest Eggs for a Child Calculator to test your own household assumptions.
          </p>
          <Link href="/child" className={ctaButton}>
            Open Nest Eggs for a Child
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">The Short Answer</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          You may be financially ready for a baby when your household can reasonably handle the initial setup, any
          medical costs that apply to you, a temporary reduction in income, recurring child expenses, childcare,
          adequate emergency savings, possible housing or transportation changes, and your existing financial
          commitments.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The important word is together. A household might comfortably afford diapers and baby clothes but struggle
          once childcare begins. Another might have substantial savings but face a large income gap during parental
          leave.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Affordability is therefore both a cash-flow problem and a planning-across-time problem.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">1. Start With Your Finances Before the Baby</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Before estimating what a child will cost, establish what your household finances look like today.
        </p>
        <GuideFormula>Monthly financial surplus = Monthly take-home income - Current monthly expenses</GuideFormula>
        <GuideTable
          caption="Household finances"
          headers={["Household finances", "Monthly amount"]}
          rows={[
            ["Take-home income", "$7,000"],
            ["Housing", "$2,000"],
            ["Food", "$700"],
            ["Transportation", "$600"],
            ["Debt payments", "$500"],
            ["Utilities and household bills", "$500"],
            ["Insurance/healthcare", "$300"],
            ["Other spending", "$900"],
            ["Current expenses", "$5,500"],
            ["Remaining cash flow", "$1,500"],
          ]}
          emphasizeLastRow
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          On the surface, this household has $1,500 available each month. But that does not mean it can automatically
          absorb $1,500 of new child-related expenses. Some of that money may already be funding emergency savings,
          retirement, a home down payment, debt reduction, investments, or another goal.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The real question is how much of the current surplus can be redirected without making the rest of the
          household plan fragile.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">2. Separate the Costs Instead of Using One Baby Number</h2>
        <h3 className="mt-6 font-serif text-xl text-pine">One-time setup costs</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          These can include a crib or bassinet, stroller, car seat, feeding equipment, initial clothing, nursery items
          and other equipment. Some can be reduced through gifts, borrowing, buying used items where appropriate, or
          deciding that certain products are unnecessary.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Recurring child costs</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          These can include diapers, wipes, feeding, clothing, toiletries, healthcare, medicines, additional groceries
          and other supplies. Recurring costs matter because they change household cash flow month after month.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Childcare</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          For households that need paid care, childcare can change the affordability calculation dramatically. It should
          be modeled as its own expense with a start date and an expected duration rather than buried inside one
          permanent monthly estimate.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Child Care Aware of America reported a national average child-care price of $13,128 for 2024, while
          emphasizing that state and local prices vary widely. Use a local quote or state-level estimate whenever
          possible rather than treating the national figure as your expected bill.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Parental leave and income changes</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          A parent may receive full pay, partial pay, employer-provided paid leave, state benefits, or no pay for part
          of the leave period. Federal FMLA can provide eligible workers with job-protected leave, but it does not by
          itself guarantee paid leave for private-sector workers. Model the income you actually expect to receive rather
          than assuming leave is fully paid.
        </p>
        <GuideFormula>
          Parental-leave income gap = Normal take-home income - Expected take-home income during leave
        </GuideFormula>

        <h2 className="mt-10 font-serif text-2xl text-pine">3. Calculate the Real Monthly Impact</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">A useful first-stage calculation is:</p>
        <GuideFormula>
          Baby impact = recurring child expenses + childcare + additional household expenses + lost income
        </GuideFormula>
        <GuideFormula>New monthly surplus = existing monthly surplus - baby impact</GuideFormula>
        <GuideTable
          caption="Change in monthly child costs"
          headers={["Change", "Monthly impact"]}
          rows={[
            ["Diapers and supplies", "$120"],
            ["Feeding", "$150"],
            ["Clothing/toiletries", "$80"],
            ["Healthcare", "$100"],
            ["Other child expenses", "$100"],
            ["Additional household spending", "$100"],
            ["Additional recurring costs", "$650"],
          ]}
          emphasizeLastRow
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          With a starting monthly surplus of $1,500, these recurring costs reduce the household&apos;s surplus to $850.
          If childcare later costs $1,200 per month, the household moves to a $350 monthly deficit: $1,500 - $650 -
          $1,200 = -$350.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          That is why asking only &apos;How much does a baby cost?&apos; can be misleading. The timing and structure of
          the costs matter.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">4. Model Parental Leave Separately</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Suppose household take-home income falls by $2,000 per month for three months during parental leave. The
          near-term income gap is:
        </p>
        <GuideFormula>$2,000 x 3 = $6,000</GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          That $6,000 is not the same kind of problem as a college expense 18 years away. It is a near-term liquidity
          need. A household can be well prepared for long-term child costs and still be short of cash during parental
          leave.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          When the updated Runaway Finance child calculator includes parental leave, enter the expected income reduction
          and duration rather than treating the loss as a permanent monthly expense.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">5. Childcare Can Change the Answer Completely</h2>
        <GuideTable
          caption="Childcare scenarios"
          headers={["Scenario", "Child expenses", "Childcare", "Income reduction", "Monthly amount remaining"]}
          rows={[
            ["Family A", "$650", "$0", "$0", "$850"],
            ["Family B", "$650", "$700", "$0", "$150"],
            ["Family C", "$650", "$1,200", "$0", "-$350"],
          ]}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          The same starting income can therefore produce very different outcomes depending on childcare arrangements.
          Location, working schedules, family support, age of the child and type of care all matter.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          For context, Child Care Aware of America&apos;s 2024 analysis found that the national average price of child
          care was $13,128 and that prices vary substantially by state. Treat that as context, not as your household
          estimate.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">6. How Much Should You Have Saved Before the Baby?</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          There is no single savings balance that makes someone financially ready. Instead, separate the money by
          purpose.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Baby setup fund</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">Money for known pre-birth and initial expenses.</p>
        <h3 className="mt-6 font-serif text-xl text-pine">Parental-leave reserve</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Money to cover a predictable temporary income gap. If income falls by $1,500 per month for four months, the
          gap is $6,000 before additional child expenses.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Emergency fund</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Money for genuinely unexpected events such as job loss, major repairs or unexpected medical bills. Avoid
          counting the same dollars simultaneously as your baby fund and your emergency reserve.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Longer-term child funding</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          This is where the Runaway Finance nest-egg logic becomes useful: future costs occur over many years, so they
          should not automatically be treated as if every future dollar must be in cash before the baby arrives.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">7. The First Year Is Not the Whole Story</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The first year contains visible purchases, but different expenses emerge as children grow: childcare,
          preschool, school expenses, food, clothing, activities, technology, transportation, healthcare and possibly
          larger housing needs.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Some baby expenses disappear while others replace them. The question is not simply whether you can pay for
          year one, but whether your finances can adapt as the type and size of expenses change.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">8. Will Having a Baby Mean Moving to a Bigger Home?</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Not necessarily. But housing is one of the largest ways a child can indirectly affect household finances. A
          family may eventually choose another bedroom, more storage, proximity to childcare or schools, or a larger
          rental or purchased home.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          If a move increases housing costs by $700 per month, that is $8,400 per year. Unlike a stroller, the expense
          repeats. This is why Runaway Finance treats family decisions as connected: a child can change the house you
          can afford, and a house can change how comfortably you can absorb the cost of a child.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">9. Treat College as a Separate Future Funding Problem</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          College is a legitimate long-term consideration, but it should not be treated as though the entire future cost
          must be available before having a child.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          If parents want to build a $75,000 education fund over 18 years, a simple no-return illustration is $75,000 /
          18 / 12, or about $347 per month. Once investment growth and education-cost inflation are introduced, the
          required contribution changes.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The Runaway Finance child calculator therefore treats the raising-the-child pot and the college pot
          separately.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">10. A More Complete Baby Affordability Test</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink">
          <li>Can we cover the initial setup without draining the emergency reserve?</li>
          <li>What happens to household income during parental leave?</li>
          <li>What will recurring monthly child expenses become?</li>
          <li>When does childcare begin, how much will it cost, and for how long?</li>
          <li>Do we remain cash-flow positive after the new costs?</li>
          <li>What happens to retirement, home, debt-repayment and other savings goals?</li>
          <li>What happens if childcare, healthcare or other costs are higher than expected?</li>
        </ul>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Affordability looks very different when a plan only works under perfect assumptions. Stress-test the variables
          that could realistically move.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">11. Example: Can This Household Afford a Baby?</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Consider a couple with $7,500 of monthly take-home income, $5,400 of existing expenses, $1,000 of monthly
          savings contributions and $1,100 of other discretionary cash.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          They expect a $4,500 initial setup, $600 per month of recurring child expenses, $1,000 per month of childcare
          beginning in month five, and an $800 monthly income reduction for three months.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          From month five, before other changes: $7,500 - $5,400 - $600 - $1,000 = $500 remaining.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          If they insist on continuing the full $1,000 monthly contribution to their other savings goals, they would
          create a $500 monthly deficit. The model does not tell them whether they should have a child. It shows what
          would need to change for the plan to work.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">
          12. Think in Terms of Financial Resilience, Not a Pass/Fail Score
        </h2>
        <h3 className="mt-6 font-serif text-xl text-pine">Comfortable</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Expected costs can be absorbed while maintaining emergency reserves and reasonable progress toward important
          goals.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Tight but manageable</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Cash flow remains workable, but savings rates, discretionary spending or the timing of other goals may need to
          change.
        </p>
        <h3 className="mt-6 font-serif text-xl text-pine">Financially vulnerable</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Expected costs create persistent deficits, consume emergency reserves, depend heavily on debt or leave very
          little room for unexpected expenses.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          These are planning interpretations, not approvals or personalized financial advice.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Run Your Numbers</h2>
        <GuideCta>
          <p>
            Use the Runaway Finance Nest Eggs for a Child Calculator to model your household.
          </p>
          <p>
            Test current income, existing expenses, savings, expected child costs, childcare, parental-leave income
            changes, childhood expenses, education goals and the financial buffer you want to preserve. Then change the
            assumptions. The goal is not simply to ask &apos;How much does a baby cost?&apos; but &apos;What happens to
            the rest of our finances if we have a child?&apos;
          </p>
          <Link href="/child" className={ctaButton}>
            Open Nest Eggs for a Child
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">Frequently Asked Questions</h2>
        {BABY_AFFORD_FAQS.map((faq) => (
          <div key={faq.question}>
            <h3 className="mt-6 font-serif text-xl text-pine">{faq.question}</h3>
            <p className="mt-3 text-base leading-relaxed text-ink">{faq.answer}</p>
          </div>
        ))}

        <h2 className="mt-10 font-serif text-2xl text-pine">The Bottom Line</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Affording a baby is not about reaching one magic salary or savings number. It is about whether your household
          can absorb new expenses, temporary income changes and longer-term commitments while remaining financially
          resilient.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Start with today&apos;s finances. Add setup and recurring costs. Model childcare and parental leave separately.
          Protect an emergency reserve. Then examine what happens to housing, savings, debt and long-term goals.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A good affordability calculation does not decide whether you should have a child. It shows what the decision
          could require financially and where your household may need to adapt.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Sources and Methodology</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Child Care Aware of America, Child Care in America: 2024 Price &amp; Supply (published May 2025): national
          average child-care price of $13,128 for 2024; state and local variation is substantial.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          U.S. Department of Labor, Family and Medical Leave Act / Paid Parental Leave guidance: FMLA provides eligible
          employees with job-protected leave; federal paid parental leave provisions cited by DOL apply specifically to
          covered federal employees. Employer and state programs can differ.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Examples in this guide are illustrative and are not estimates of what a particular household will spend. Costs
          vary by state, metro area, healthcare coverage, childcare arrangement, family support and household choices.
          Investment outcomes and future costs are uncertain.
        </p>
        <p className="mt-6 text-sm text-muted">Last reviewed: {BABY_AFFORD_GUIDE.reviewed}</p>
      </article>

      <nav className="mt-12 max-w-3xl border-t border-pine/15 pt-8" aria-label="Growing a Family calculators">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Growing a Family</p>
        <p className="mt-2 font-serif text-xl text-pine">Continue with the Growing a Family calculators</p>
        <p className="mt-3 text-base leading-relaxed text-ink">
          This guide sits with the family tools. Use them to test living, school and university nest eggs against the
          rest of the household plan.
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
            <Link href="/guides/family" className={pineLink}>
              More Family &amp; Children guides
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
