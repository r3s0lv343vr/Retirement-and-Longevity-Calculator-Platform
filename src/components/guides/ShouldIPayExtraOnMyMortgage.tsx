import Link from "next/link";
import { GuideCta, GuideFormula, GuideTable } from "@/components/GuideChrome";
import { EXTRA_VS_SAVINGS_FAQS, EXTRA_VS_SAVINGS_GUIDE, TRUE_COST_PATH } from "@/lib/guides";
import { formatMoney, formatPercent, formatYearsMonths } from "@/lib/format";
import { EXTRA_VS_SAVINGS_FIGURES as F } from "@/lib/mortgage/payoff/extraVsSavingsGuideFigures";

const pineLink = "font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine";
const ctaButton =
  "mt-4 inline-flex h-12 items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2";

export function ShouldIPayExtraOnMyMortgage() {
  return (
    <>
      <article className="max-w-3xl">
        <p className="text-base leading-relaxed text-ink">
          The answer is not simply “whichever rate is higher.” The better choice depends on what that money needs to
          do for your household before your mortgage is gone.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">The short answer</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Paying extra on your mortgage can produce a predictable benefit: less principal remains outstanding, so less
          interest accrues and the loan can end sooner. Keeping the money in savings does something different. It
          preserves cash you can use immediately if income falls, the roof fails, childcare rises, a medical bill
          arrives or another major expense appears.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          So the decision is not just about return. It is a trade-off between reducing a long-term liability and
          preserving short-term financial flexibility.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A useful rule for thinking — not a universal rule for acting — is: protect the household first, then
          optimize the mortgage.
        </p>

        <GuideCta>
          <p>
            <span className="font-semibold text-pine">Run the mortgage side: </span>
            Mortgage Payoff shows how an extra monthly payment, annual extra, lump sum or temporary acceleration
            changes the payoff date and total interest. The household still has to judge the value of liquidity.
          </p>
          <Link href="/mortgage/payoff" className={ctaButton}>
            Open Mortgage Payoff
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">
          Why this decision is harder than comparing two interest rates
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Imagine your mortgage costs {formatPercent(F.annualRate)} while a savings account earns 4%. At first glance,
          sending every spare dollar to the mortgage appears obvious. But suppose doing that leaves only{" "}
          {formatMoney(2_000)} in cash. A {formatMoney(7_000)} home repair could then force you to use a credit card,
          personal loan or other expensive borrowing. The mathematically attractive mortgage decision may have made
          the household financially weaker.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Now reverse the situation. Suppose the same household already has a well-funded emergency reserve, no
          expensive debt, stable income and no large costs expected soon. Keeping every additional dollar in cash may
          then provide little extra protection, while mortgage prepayments could remove years of interest.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The same mortgage rate can therefore produce two different sensible decisions.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">1. Start with the emergency fund</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Before asking how quickly you can eliminate the mortgage, ask how long the household could function if
          something went wrong.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          FDIC consumer guidance describes emergency savings as protection against events such as income loss and
          major unexpected home or car repairs, and notes that financial experts generally recommend keeping at least
          six months of living expenses in an insured product. That is a benchmark, not a personalized requirement: a
          two-income household with highly stable employment may view the risk differently from a one-income
          household, contractor or business owner.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Your emergency reserve should reflect the consequences of being wrong, not simply an arbitrary percentage.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink">
          <li>How many months of essential spending could we cover if our income suddenly fell?</li>
          <li>What insurance deductibles could we have to pay?</li>
          <li>Could the home need a major repair within the next year?</li>
          <li>Do we have childcare, school, medical or elder-care costs that could rise quickly?</li>
          <li>Would we have to borrow if a {formatMoney(5_000)}–{formatMoney(10_000)} surprise appeared?</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-pine">2. Then look at the mortgage rate</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Once liquidity is reasonably protected, the mortgage rate becomes a much more useful comparison. An extra
          principal payment reduces the balance on which future mortgage interest is calculated. Freddie Mac explains
          that additional principal payments can reduce both total interest and the time required to repay the loan.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          That makes mortgage prepayment unusually easy to understand: unlike an investment return, the interest
          avoided does not depend on the stock market rising next year.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Mortgage Payoff uses the same amortization formula as Can I Get a Mortgage. Extra amounts then go to
          principal on top of that payment. The required payment is not recast.
        </p>
        <GuideFormula>
          Monthly P&amp;I = P × r × (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          P is the remaining balance. r is the annual rate divided by 12. n is the remaining term in months.
        </p>

        <h3 className="mt-8 font-serif text-xl text-pine">
          A {formatMoney(F.extraMonthly)}-a-month example
        </h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Assume a {formatMoney(F.balance)} mortgage balance, a {formatPercent(F.annualRate)} fixed rate and{" "}
          {F.remainingYears} years remaining. The scheduled principal-and-interest payment is{" "}
          {formatMoney(F.scheduledPayment, 2)} a month — about {formatMoney(F.scheduledPayment)}.
        </p>
        <GuideTable
          caption="How $250 extra each month changes payoff time and interest"
          headers={["Scenario", "Approx. payoff time", "Approx. interest"]}
          emphasizeLastRow
          rows={[
            ["Scheduled payment only", formatYearsMonths(F.baselinePeriods), formatMoney(F.baselineInterest)],
            [
              `Add ${formatMoney(F.extraMonthly)}/month`,
              formatYearsMonths(F.extraPeriods),
              formatMoney(F.extraInterest),
            ],
            [
              "Difference",
              `${formatYearsMonths(F.periodsSaved)} sooner`,
              `${formatMoney(F.interestAvoided)} less interest`,
            ],
          ]}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          Illustration assumes the rate remains fixed and every extra payment is applied directly to principal. It
          excludes taxes, insurance, fees and tax effects. The first extra month pays {formatMoney(F.firstInterest)}{" "}
          in interest, {formatMoney(F.firstScheduledPrincipal)} in scheduled principal, and {formatMoney(F.firstExtra)}{" "}
          extra. Use Mortgage Payoff for your own balance, rate, remaining term and extra-payment pattern.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">
          3. Liquidity has a value that an interest-rate comparison misses
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          A dollar in savings and a dollar of home equity are both part of net worth, but they are not
          interchangeable. Cash can usually pay tomorrow’s bill. Equity generally requires a sale, refinance or new
          borrowing before it can be spent.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          That difference matters most when life is changing. A family expecting a baby, moving to one income
          temporarily, preparing for school costs or anticipating a major repair may rationally hold more cash even
          when the mortgage rate exceeds the savings rate.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">
          4. What would the money do if you did not prepay the mortgage?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The alternative matters. “Keep it” can mean very different things: leaving cash idle, earning interest in
          an insured savings product, contributing to retirement, investing for a long-term goal, or holding money
          for a known expense.
        </p>
        <GuideTable
          caption="How the next dollar behaves under four uses"
          headers={["Alternative", "Potential advantage", "Main trade-off", "Best question to ask"]}
          rows={[
            [
              "Extra mortgage principal",
              "Predictable interest avoided",
              "Money becomes less liquid",
              "How much time and interest will this actually save?",
            ],
            [
              "Cash savings",
              "Immediate access and stability",
              "Return may be below mortgage cost or inflation",
              "What risk is this cash protecting us from?",
            ],
            [
              "Long-term investment",
              "Possibility of higher long-run return",
              "Returns are uncertain and can fall",
              "Can we leave this money invested through a downturn?",
            ],
            [
              "Near-term family fund",
              "Protects planned spending",
              "May earn less financially",
              "Will we need this money before we could rebuild it?",
            ],
          ]}
        />

        <h2 className="mt-10 font-serif text-2xl text-pine">
          5. Investment opportunity is not the same as a guaranteed return
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          A common argument is that if investments might return more than the mortgage rate, the money should be
          invested instead. That comparison can be useful, but only if risk, taxes, time horizon and liquidity are
          included.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A 7% expected investment return is not the same thing as avoiding interest on a {formatPercent(F.annualRate)}{" "}
          fixed mortgage. The investment can outperform, underperform or lose money — especially over short periods.
          For money needed next year, that uncertainty may be unacceptable. For money intended for retirement decades
          away, it may be much more tolerable.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">6. Job stability can change the answer completely</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The more uncertain household income is, the more valuable accessible cash can become. A worker paid largely
          through commissions, a contractor, a business owner or a household dependent on one salary may reasonably
          maintain a larger reserve than a household with two stable incomes.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The question is not “Do I think I will lose my job?” The better question is: “If income stopped, would this
          mortgage prepayment leave us needing expensive debt to survive?”
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">
          7. Near-term family costs deserve their own line in the decision
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Runaway Finance is built around the fact that financial decisions collide. The extra {formatMoney(500)}{" "}
          going to a mortgage may also be the {formatMoney(500)} needed for parental leave, daycare, a replacement
          vehicle, tuition, medical treatment or a house repair.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Before accelerating the mortgage, list major expenses that are reasonably foreseeable over the next 12–24
          months. A known expense is not an emergency. If it is likely to occur, funding it separately can prevent
          you from paying down cheap mortgage debt today only to take on expensive consumer debt later.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">
          8. Check higher-cost debt before accelerating the mortgage
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          A mortgage is only one liability on the household balance sheet. If you carry credit-card or other debt at
          a substantially higher rate, directing surplus cash to the mortgage first can be economically inefficient.
          Compare all major debts, minimum obligations and penalties before choosing where the next dollar goes.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">9. Taxes may alter the effective mortgage cost</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          For U.S. households, mortgage interest is not automatically deductible. IRS Publication 936 explains that a
          taxpayer generally must itemize deductions and satisfy the rules for secured debt on a qualified home;
          deduction limits also apply. That means two households with identical mortgage rates can have different
          after-tax mortgage costs.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Do not reduce the mortgage rate for a presumed tax benefit unless that benefit actually applies to your tax
          situation. Mortgage Payoff does not apply a tax deduction to interest avoided.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">10. Confirm how your lender treats extra payments</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Before sending extra money, confirm that the lender will apply it to principal and review the loan for any
          applicable prepayment terms. The objective is to reduce principal sooner — not accidentally advance a
          future scheduled payment without achieving the intended payoff effect. Fannie Mae specifically advises
          borrowers to tell the lender that extra payments should reduce principal. The calculator can model extras
          the servicer may refuse.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">A better decision framework</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-ink">
          <li>
            <span className="font-medium">Protect liquidity first.</span> Keep an emergency reserve appropriate to
            your income stability, obligations and likely shocks.
          </li>
          <li>
            <span className="font-medium">Set aside known near-term costs.</span> Do not treat foreseeable childcare,
            repairs or other planned expenses as emergencies.
          </li>
          <li>
            <span className="font-medium">Check expensive debt.</span> Compare the mortgage with higher-rate
            liabilities.
          </li>
          <li>
            <span className="font-medium">Preserve valuable benefits.</span> Consider employer retirement matches or
            other benefits you would give up by redirecting cash.
          </li>
          <li>
            <span className="font-medium">Measure the mortgage benefit.</span> Calculate the exact payoff-date change
            and interest avoided.
          </li>
          <li>
            <span className="font-medium">Compare the alternative.</span> Ask what the same money would earn, what
            risk it carries and when you may need it.
          </li>
          <li>
            <span className="font-medium">Consider a split.</span> You do not have to choose 100% mortgage or 100%
            savings.
          </li>
          <li>
            <span className="font-medium">Revisit the decision.</span> A larger emergency fund, job change, new
            child, refinance or lower mortgage balance can change the trade-off.
          </li>
        </ol>

        <h3 className="mt-8 font-serif text-xl text-pine">Three households, three different answers</h3>
        <GuideTable
          caption="Same 6.5% rate can still produce different priorities"
          headers={["Household", "Situation", "What changes"]}
          rows={[
            [
              "A — the mortgage rate is high, but cash is thin",
              "6.5% mortgage. One month of emergency savings. One income. Baby expected within 12 months.",
              "Building liquidity may deserve priority before aggressive mortgage prepayment. The household has several ways a cash shortage could become expensive.",
            ],
            [
              "B — the financial floor is already protected",
              "6.5% mortgage. Eight months of emergency savings. Two stable incomes. No high-rate debt. Major near-term costs funded.",
              "Extra principal is much easier to justify. The household can now compare a relatively predictable mortgage benefit with its investment and other goals.",
            ],
            [
              "C — low-rate mortgage, strong liquidity, long horizon",
              "3.0% fixed mortgage. Six months of emergency savings. Stable income. Long investment horizon.",
              "Aggressive prepayment has a larger opportunity cost. Saving or investing may be more competitive, depending on risk tolerance, taxes and goals.",
            ],
          ]}
        />

        <h2 className="mt-10 font-serif text-2xl text-pine">The overlooked option: do both</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The decision is often presented as binary when it does not have to be. Suppose you have {formatMoney(600)}{" "}
          of monthly surplus but your emergency fund is still below target. You might send {formatMoney(300)} to
          savings and {formatMoney(300)} to mortgage principal. When the reserve reaches its target, you can
          reconsider where the full {formatMoney(600)} should go.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A split strategy can reduce the mortgage without turning the household into the uncomfortable position of
          being equity-rich but cash-poor.
        </p>

        <GuideCta>
          <p>
            <span className="font-semibold text-pine">See how much faster you could pay off your mortgage. </span>
            Test an extra monthly payment, annual extra, lump sum or temporary acceleration. Compare the new payoff
            date and interest avoided with the liquidity you would give up.
          </p>
          <Link href="/mortgage/payoff" className={ctaButton}>
            Test an extra payment
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">Quick decision checklist</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink">
          <li>I have enough accessible emergency savings for my household’s actual risks.</li>
          <li>Known expenses over the next 12–24 months are separately funded.</li>
          <li>I have compared the mortgage with any higher-cost debt.</li>
          <li>I know my mortgage rate, balance and remaining term.</li>
          <li>I have checked whether a mortgage-interest tax benefit actually applies to me.</li>
          <li>I understand what the money would do if I kept or invested it instead.</li>
          <li>I have considered job and income stability.</li>
          <li>I have confirmed how the lender applies extra payments.</li>
          <li>I have calculated the actual interest and time saved.</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-pine">Frequently asked questions</h2>
        {EXTRA_VS_SAVINGS_FAQS.map((faq) => (
          <div key={faq.question}>
            <h3 className="mt-6 font-serif text-xl text-pine">{faq.question}</h3>
            <p className="mt-3 text-base leading-relaxed text-ink">{faq.answer}</p>
          </div>
        ))}

        <h2 className="mt-10 font-serif text-2xl text-pine">Sources and methodology</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          This guide uses a household cash-flow framework rather than prescribing a universal mortgage strategy. The
          worked mortgage example uses standard fixed-rate amortization and assumes extra payments are applied
          directly to principal.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Internal Revenue Service, Publication 936 (2025), Home Mortgage Interest Deduction — current rules on
          qualification, itemization and debt limits.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Freddie Mac, “Is There a Faster Way to Be Mortgage-Free?” — consumer guidance on additional principal
          payments and shortening the loan.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Fannie Mae, “Should I Make Extra Payments On My Mortgage?” — principal prepayment, savings considerations
          and possible prepayment penalties.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          FDIC Consumer News, “Saving for the Unexpected and Your Future” (January 2025) — emergency-savings
          guidance and the role of liquid reserves.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Worked figures were produced with Mortgage Payoff: remaining balance {formatMoney(F.balance)},{" "}
          {formatPercent(F.annualRate)}, {F.remainingYears} years remaining, and {formatMoney(F.extraMonthly)} extra
          each month. Extra amounts are applied to principal in the month they fall. A lump sum does not recast the
          scheduled payment. The calculator does not model a mortgage-interest tax deduction, utilities, or the
          return on the cash you kept. Examples are illustrations, not a servicer payoff quote.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Rates, tax rules and individual circumstances change. External rules should be rechecked when this guide is
          reviewed or updated.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          This guide is educational and is not individualized financial, investment, tax, legal or lending advice.
          The appropriate balance between mortgage prepayment, cash savings and investing depends on the household’s
          circumstances, loan contract and goals. Verify loan terms with the lender and consult an appropriate
          professional where the decision depends on tax, legal or investment circumstances.
        </p>
        <p className="mt-6 text-sm text-muted">Last reviewed: {EXTRA_VS_SAVINGS_GUIDE.reviewed}</p>
      </article>

      <nav className="mt-12 max-w-3xl border-t border-pine/15 pt-8" aria-label="Buying a Home calculators">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Buying a Home</p>
        <p className="mt-2 font-serif text-xl text-pine">Continue with the Buying a Home calculators</p>
        <p className="mt-3 text-base leading-relaxed text-ink">
          This guide is the extra-versus-savings companion to the home tools. Use them to test payoff time, then the
          wider cost of owning the house.
        </p>
        <ul className="mt-4 space-y-2">
          <li>
            <Link href="/mortgage/payoff" className={pineLink}>
              Open Mortgage Payoff
            </Link>
          </li>
          <li>
            <Link href="/mortgage" className={pineLink}>
              See what the house actually costs to own
            </Link>
          </li>
          <li>
            <Link href={TRUE_COST_PATH} className={pineLink}>
              Read Mortgage Payment vs. the True Cost of Owning a Home
            </Link>
          </li>
          <li>
            <Link href="/home" className={pineLink}>
              See the Buying a Home calculators
            </Link>
          </li>
          <li>
            <Link href="/guides/home" className={pineLink}>
              More Home &amp; Mortgage guides
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
