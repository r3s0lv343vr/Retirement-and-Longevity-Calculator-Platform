import Link from "next/link";
import { GuideCta, GuideFormula, GuideTable } from "@/components/GuideChrome";
import { EXTRA_VS_SAVINGS_FAQS, EXTRA_VS_SAVINGS_GUIDE, TRUE_COST_PATH } from "@/lib/guides";
import { formatMoney, formatPercent } from "@/lib/format";
import { EXTRA_VS_SAVINGS_FIGURES as F } from "@/lib/mortgage/payoff/extraVsSavingsGuideFigures";

const pineLink = "font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine";
const ctaButton =
  "mt-4 inline-flex h-12 items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2";

function formatSpan(periods: number): string {
  const years = Math.floor(periods / 12);
  const months = periods % 12;
  if (years > 0 && months > 0) return `${years} years and ${months} months`;
  if (years > 0) return years === 1 ? "1 year" : `${years} years`;
  return months === 1 ? "1 month" : `${months} months`;
}

export function ShouldIPayExtraOnMyMortgage() {
  return (
    <>
      <article className="max-w-3xl">
        <p className="text-base leading-relaxed text-ink">
          There is no universal winner. Extra mortgage principal gives a predictable reduction in future interest and
          can shorten the loan. Savings preserves liquidity — the ability to handle a job loss, home repair, medical
          bill, childcare change or another near-term need without borrowing again.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The better use of the next dollar depends on your mortgage rate, emergency reserves, other debt, job
          stability, near-term family costs, tax position and what the money would otherwise earn.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The real decision is not “debt or savings?” It is a choice between two different forms of financial strength.
          Paying extra on the mortgage increases home equity and reduces a contractual liability. Keeping cash
          increases liquidity and optionality. A household can be wealthy on paper and still be financially fragile if
          too much of its money is locked inside the house.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          That is why this decision should be made in sequence. First protect the household against shocks. Then
          compare the economic return from prepaying the mortgage with the value and expected return of the
          alternative use of the money.
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

        <h2 className="mt-10 font-serif text-2xl text-pine">1. What an extra mortgage payment actually earns</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Mortgage interest is calculated on the outstanding principal. When an extra payment is applied to principal,
          the balance falls sooner. That reduces future interest and can bring the payoff date forward. Fannie Mae and
          Freddie Mac both describe extra principal payments as a way to reduce total interest and shorten the
          mortgage term.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A useful first approximation is to think of mortgage prepayment as producing a return related to the
          mortgage rate, because each dollar of principal removed no longer accrues mortgage interest. The exact
          lifetime benefit depends on when the payment is made, the remaining term, loan structure, and any tax
          effects. Mortgage Payoff reports interest avoided and time reclaimed. It does not recast the scheduled
          payment after an extra, and it does not turn that interest avoided into an investment-return percentage.
        </p>
        <GuideFormula>
          Monthly P&amp;I = P × r × (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          P is the remaining balance. r is the annual rate divided by 12. n is the remaining term in months. Extra
          monthly, yearly, or one-time amounts then go to principal on top of that payment.
        </p>

        <h3 className="mt-8 font-serif text-xl text-pine">Worked example: {formatMoney(F.extraMonthly)} extra each month</h3>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Suppose a household has a {formatMoney(F.balance)} remaining mortgage, a {formatPercent(F.annualRate)} fixed
          rate and {F.remainingYears} years remaining. The scheduled principal-and-interest payment is{" "}
          {formatMoney(F.scheduledPayment)} a month — the same amortization formula Mortgage Payoff uses.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          If the household adds {formatMoney(F.extraMonthly)} to principal every month and the lender applies it
          correctly, the first extra month pays {formatMoney(F.firstInterest)} in interest,{" "}
          {formatMoney(F.firstScheduledPrincipal)} in scheduled principal, and {formatMoney(F.firstExtra)} extra. The
          required payment stays {formatMoney(F.scheduledPayment)}. The loan is gone in {formatSpan(F.extraPeriods)}{" "}
          instead of {formatSpan(F.baselinePeriods)} — {formatSpan(F.periodsSaved)} sooner — and total interest falls
          from {formatMoney(F.baselineInterest)} to {formatMoney(F.extraInterest)}, a saving of{" "}
          {formatMoney(F.interestAvoided)}.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Those figures are one path. Change the balance, rate, remaining term or extra and the story changes. The
          mechanism does not: extra principal reduces the balance on which future interest is calculated.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">2. Why cash in savings can be more valuable than the interest it earns</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          A savings account may earn less than a mortgage rate, but that comparison is incomplete. Cash can be spent
          immediately. Home equity generally cannot be accessed without selling, refinancing or borrowing against the
          property.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          That liquidity has insurance-like value. A household facing unemployment, an urgent roof repair or a sudden
          childcare expense can use cash without creating new debt. FDIC consumer guidance notes that emergency
          savings can help households absorb income loss and major unexpected home or car repairs; it cites a commonly
          recommended benchmark of at least six months of living expenses.
        </p>
        <p className="mt-4 font-medium text-ink">Liquidity test</p>
        <p className="mt-3 text-base leading-relaxed text-ink">Before making a large mortgage prepayment, ask:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink">
          <li>If income stopped next month, how many months of essential expenses could we cover without using credit?</li>
          <li>Are major home repairs, insurance deductibles, medical expenses or vehicle replacement plausible in the next year?</li>
          <li>Are childcare, school, parental-leave or elder-care costs likely to rise?</li>
          <li>Would making this prepayment leave us unable to meet a planned expense without borrowing?</li>
          <li>If we needed the money back, how difficult and expensive would it be to access home equity?</li>
        </ul>

        <h2 className="mt-10 font-serif text-2xl text-pine">3. Mortgage rate: the first economic hurdle</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The mortgage rate is the clearest starting point. The higher the rate, the more interest an extra principal
          payment can avoid. A very low fixed-rate mortgage makes the case for preserving cash or investing more
          competitive; a high-rate mortgage makes guaranteed debt reduction more attractive.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          But do not compare the mortgage rate with an investment’s headline expected return as though they are
          identical. Mortgage interest avoided is comparatively predictable. Investment returns are uncertain, can be
          negative over meaningful periods, and may be taxable. Cash savings may have a lower return but much lower
          volatility and much greater accessibility.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">4. Investment opportunity: compare like with like</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          If the alternative is investing, compare expected after-tax return, risk, time horizon and liquidity — not
          just the advertised historical average. A long-horizon retirement investor may reasonably tolerate market
          volatility that would be unacceptable for money needed for a house repair next year.
        </p>
        <GuideTable
          caption="How the next dollar behaves under three uses"
          headers={["Use of $1", "Return characteristic", "Liquidity", "Main risk"]}
          rows={[
            ["Extra mortgage principal", "Predictable interest avoided", "Low", "Cash becomes home equity"],
            ["Insured savings / cash", "Lower but relatively stable interest", "High", "Return may trail inflation or the mortgage rate"],
            ["Market investment", "Potentially higher long-run return", "Moderate", "Market loss, timing and tax risk"],
          ]}
        />

        <h2 className="mt-10 font-serif text-2xl text-pine">5. Job stability changes the answer</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Two households with the same mortgage rate can rationally make different choices. A household with two
          stable incomes, strong insurance coverage and a large cash reserve may be comfortable directing more surplus
          to principal. A household dependent on one volatile income, commissions, contract work or a business may
          place a much higher value on liquidity.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          The relevant question is not whether you expect to lose your job. It is whether your financial plan can
          survive a meaningful interruption in income without forcing you to borrow at a much higher rate than the
          mortgage you just prepaid.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">6. Near-term family costs can outweigh a mathematically attractive prepayment</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Family finance rarely presents one decision at a time. A mortgage prepayment may look attractive in isolation
          but become less attractive when a household expects parental leave, childcare, tuition, a vehicle
          replacement, a move, medical treatment or major home maintenance.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Money sent to principal cannot ordinarily be redirected to these expenses next month. For a household
          entering an expensive life stage, preserving a larger cash buffer can be rational even when the savings rate
          is below the mortgage rate.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">7. Do not ignore other debt</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Before accelerating a mortgage, examine higher-cost debt. Paying extra on a 6% mortgage while carrying
          revolving debt at a much higher rate can leave the household worse positioned. The mortgage decision belongs
          inside the full household balance sheet, not in isolation.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">8. Taxes can change the effective comparison</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          For U.S. taxpayers, qualified mortgage interest may be deductible only when the applicable requirements are
          met, including itemizing deductions. IRS Publication 936 explains the rules and debt limits. A deduction can
          reduce the effective after-tax cost of mortgage interest for some households, but many households receive no
          incremental mortgage-interest tax benefit because they do not itemize or because other limitations apply.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Do not assume that a {formatPercent(F.annualRate)} mortgage automatically costs {formatPercent(F.annualRate)}{" "}
          after tax, or that the interest is automatically deductible. Tax circumstances differ and rules change.
          Mortgage Payoff does not apply a tax deduction to interest avoided.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">9. Check the mortgage contract before paying extra</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Confirm that extra payments are applied to principal. Fannie Mae specifically advises borrowers to tell the
          lender that extra payments should reduce principal rather than simply prepay interest. Also check for any
          prepayment restrictions or penalties. They are not common on every mortgage, but they can materially alter
          the economics. The calculator can model extras the servicer may refuse.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">10. A practical decision sequence</h2>
        <ol className="mt-3 list-decimal space-y-3 pl-5 text-base leading-relaxed text-ink">
          <li>
            <span className="font-medium">Protect the floor.</span> Maintain enough liquid emergency savings for your
            household’s actual risks. Six months of living expenses is a common benchmark, but the appropriate amount
            can be higher or lower depending on income stability and obligations.
          </li>
          <li>
            <span className="font-medium">Clear urgent high-cost debt.</span> Compare the mortgage with credit cards and
            other expensive liabilities before directing surplus cash to the home loan.
          </li>
          <li>
            <span className="font-medium">Fund known near-term needs.</span> Set aside money for costs likely to occur
            before you could comfortably rebuild savings.
          </li>
          <li>
            <span className="font-medium">Capture important benefits.</span> Do not sacrifice valuable employer
            retirement matches or other benefits merely to prepay the mortgage without comparing them.
          </li>
          <li>
            <span className="font-medium">Compare rates and risk.</span> Compare the mortgage interest avoided with the
            after-tax, risk-adjusted return and liquidity of the alternative.
          </li>
          <li>
            <span className="font-medium">Choose a split if uncertainty is high.</span> The decision does not have to be
            all-or-nothing. A household can keep part of the monthly surplus in savings and send part to principal.
          </li>
          <li>
            <span className="font-medium">Reassess periodically.</span> A job change, new child, refinance, rate change,
            inheritance or stronger emergency fund can change the answer.
          </li>
        </ol>

        <h3 className="mt-8 font-serif text-xl text-pine">Three household scenarios</h3>
        <GuideTable
          caption="Same 6.5% rate, three different priorities"
          headers={["Household", "Situation", "Planning interpretation"]}
          rows={[
            [
              "A — cash-poor, stable mortgage",
              "Mortgage 6.5%. Emergency savings: one month. One income. Baby expected within a year.",
              "Priority is likely liquidity first. A thin cash reserve plus an imminent family cost makes a large irreversible prepayment risky.",
            ],
            [
              "B — strong reserve, no expensive debt",
              "Mortgage 6.5%. Emergency savings: eight months. Two stable incomes. No high-rate debt. Near-term expenses funded.",
              "Extra principal becomes much easier to justify. The household can compare prepayment with investing or other goals.",
            ],
            [
              "C — low fixed mortgage, long horizon",
              "Mortgage 3.0%. Emergency savings: six months. Stable income. Long investment horizon.",
              "The opportunity cost of aggressive prepayment is more significant. Preserving liquidity or investing may be more competitive.",
            ],
          ]}
        />

        <h2 className="mt-10 font-serif text-2xl text-pine">A useful compromise: split the surplus</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Households often frame this as a binary decision when a blended strategy may fit better. If {formatMoney(600)}{" "}
          per month is available, for example, a household might direct {formatMoney(300)} to cash reserves and{" "}
          {formatMoney(300)} to mortgage principal until the emergency fund reaches its target. After that, the full{" "}
          {formatMoney(600)} can be reconsidered.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          This approach preserves progress on the mortgage while preventing the household from becoming equity-rich
          and cash-poor.
        </p>

        <GuideCta>
          <p>
            <span className="font-semibold text-pine">See how much time and interest an extra payment could save. </span>
            Enter the current balance, rate, remaining term and proposed extra on Mortgage Payoff. Then compare that
            result with the cash reserve you would give up.
          </p>
          <Link href="/mortgage/payoff" className={ctaButton}>
            Test an extra payment
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">Decision checklist</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink">
          <li>Emergency fund is adequate for my household.</li>
          <li>Known near-term family expenses are funded.</li>
          <li>I have checked for higher-cost debt.</li>
          <li>I know my mortgage rate and remaining term.</li>
          <li>I understand whether mortgage interest produces a real tax benefit for me.</li>
          <li>I have checked the loan for prepayment rules or penalties.</li>
          <li>I know what the money would otherwise earn and what risk that alternative carries.</li>
          <li>I have considered whether I may need this cash before the mortgage ends.</li>
          <li>I have tested the actual payoff and interest savings rather than relying on intuition.</li>
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
          Fannie Mae, “Should I Make Extra Payments On My Mortgage?” — explains principal prepayment, savings
          considerations and possible prepayment penalties.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Freddie Mac, “Is There a Faster Way to Be Mortgage-Free?” — explains how extra principal reduces interest
          and loan duration.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          FDIC Consumer News, “Saving for the Unexpected and Your Future” (January 2025) — emergency-savings guidance
          and the role of liquid reserves.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Internal Revenue Service, Publication 936 (2025), Home Mortgage Interest Deduction, and Publication 530
          (2025), Tax Information for Homeowners.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Worked figures were produced with Mortgage Payoff: remaining balance {formatMoney(F.balance)},{" "}
          {formatPercent(F.annualRate)}, {F.remainingYears} years remaining, and {formatMoney(F.extraMonthly)} extra
          each month. Extra amounts are applied to principal in the month they fall. A lump sum does not recast the
          scheduled payment. The calculator does not model a mortgage-interest tax deduction, utilities, or the return
          on the cash you kept. Examples are illustrations, not a servicer payoff quote.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          This guide is educational and is not individualized financial, investment, tax, legal or lending advice.
          Mortgage contracts, tax treatment and household circumstances differ. Verify loan terms with the lender and
          consult an appropriate professional where the decision depends on tax, legal or investment circumstances.
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
