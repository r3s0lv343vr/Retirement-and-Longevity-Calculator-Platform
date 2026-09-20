import Link from "next/link";
import { GuideCta, GuideFormula, GuideTable } from "@/components/GuideChrome";
import { EXTRA_VS_SAVINGS_PATH, TRUE_COST_FAQS, TRUE_COST_GUIDE } from "@/lib/guides";
import { formatMoney, formatPercent } from "@/lib/format";
import { TRUE_COST_GUIDE_FIGURES as F } from "@/lib/mortgage/trueCostGuideFigures";

const pineLink = "font-medium text-pine underline decoration-pine/30 underline-offset-2 hover:decoration-pine";
const ctaButton =
  "mt-4 inline-flex h-12 items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-paper shadow-sm transition hover:bg-pine-2";

export function MortgagePaymentVsTrueCost() {
  return (
    <>
      <article className="max-w-3xl">
        <p className="text-base leading-relaxed text-ink">
          The number your lender quotes is usually principal and interest. That is the loan payment. It is not the cost
          of owning the house.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Can I Get a Mortgage on Runaway Finance splits those two ideas on purpose. Principal and interest sit on one
          line. Tax, insurance, PMI, HOA, and upkeep sit beside them as housing cost. Closing cash, moving, and repairs
          or furnishing are cash to buy — money you need before the first payment, not part of the loan.
        </p>

        <GuideCta>
          <p>
            <span className="font-semibold text-pine">Run the numbers: </span>
            The figures below come from the calculator’s default first-home path: a {formatMoney(F.homePrice)} house,{" "}
            {formatMoney(F.downPayment)} down (20%), {formatPercent(F.annualRate)} interest, and {F.termYears} years.
            Change the inputs and the story changes. The math does not.
          </p>
          <Link href="/mortgage" className={ctaButton}>
            Open Can I Get a Mortgage
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">The payment is not the house</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          A fixed-rate mortgage payment is the amount that retires the loan if you pay it every month for the full
          term. The calculator uses the standard amortization formula:
        </p>
        <GuideFormula>
          Monthly P&amp;I = P × r × (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)
        </GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          P is the loan (price minus down payment). r is the annual rate divided by 12. n is the term in months. If the
          rate is zero, the payment is simply the loan divided by n.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          On the default path the loan is {formatMoney(F.loanAmount)}. Monthly principal and interest is{" "}
          {formatMoney(F.monthlyPI)}. The first payment is {formatMoney(F.firstInterest)} interest and only{" "}
          {formatMoney(F.firstPrincipal)} principal. Most of an early payment is the lender’s money, not equity.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Each month the model charges interest on the remaining balance, applies the scheduled principal, then any
          extra you entered. Extra monthly, yearly, or one-time amounts go to principal. They do not recast the
          required payment. When more of a year’s scheduled pay goes to principal than interest, that is the crossover
          year — year {F.crossoverYear ?? "—"} on this path.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">What sits beside P&amp;I</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Year-one housing cost is principal and interest plus tax, insurance, PMI, HOA, and upkeep, each expressed as
          a monthly amount. That is the number the calculator labels estimated housing cost —{" "}
          {formatMoney(F.firstHousingMonthly)} on the default path, not {formatMoney(F.monthlyPI)}.
        </p>
        <GuideTable
          caption="How Can I Get a Mortgage builds estimated housing cost"
          headers={["Piece", "How the calculator treats it", "Default / month"]}
          rows={[
            ["Principal + interest", "Amortizing loan payment", formatMoney(F.breakdown.pi)],
            ["Property tax", "Annual tax ÷ 12. Grows at tax growth.", formatMoney(F.breakdown.tax)],
            ["Home insurance", "Annual premium ÷ 12. Grows at insurance growth.", formatMoney(F.breakdown.insurance)],
            ["PMI", "Charged only while loan-to-value is above 80%.", formatMoney(F.breakdown.pmi)],
            ["HOA", "Monthly dues × 12, then ÷ 12. Grows at HOA growth.", formatMoney(F.breakdown.hoa)],
            [
              "Upkeep",
              "Repairs and replacements. Default is 1% of price. Grows with inflation.",
              formatMoney(F.breakdown.maintenance),
            ],
          ]}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          Add those pieces and you get housing cost. The {formatMoney(F.housingGap)} gap between P&amp;I and housing
          cost on this path is tax, insurance, and upkeep. HOA and PMI are {formatMoney(0)} because the default has no
          association and a 20% down payment.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Taxes, insurance, HOA, and upkeep grow</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The loan payment stays level on a fixed rate. Ownership costs do not. Each year the calculator inflates
          property tax at the tax-growth rate, home insurance at the insurance-growth rate, HOA at the HOA-growth
          rate, and upkeep at ordinary inflation. Defaults use {formatPercent(F.taxGrowth)} for all four. Year one tax
          is still {formatMoney(F.yearOneTax)}, insurance {formatMoney(F.yearOneInsurance)}, and upkeep{" "}
          {formatMoney(F.yearOneMaintenance)}. Later years are higher.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          That is why a payment that fits in year one can get tight later even if your income also inflates. Income,
          upkeep, and the living costs beside the house grow at inflation. Tax and insurance can grow on their own
          rates.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">PMI is temporary. The loan is not.</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Private mortgage insurance is usually charged when you put down less than 20%. The calculator turns PMI off
          the month loan-to-value hits 80% of the purchase price — not a later appraisal. If down payment is under 20%
          and PMI is left at {formatMoney(0)}, it warns you. Lenders usually charge it until that 80% line.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          A 10% down path on the same {formatMoney(F.homePrice)} house, with {formatMoney(F.tenPmiMonthly)} a month of
          PMI, borrows {formatMoney(F.tenLoan)}. Monthly P&amp;I rises to {formatMoney(F.tenMonthlyPI)}. Housing cost
          becomes {formatMoney(F.tenHousing)}. PMI drops in year {F.tenPmiDropYear ?? "—"} on that run. Cash to buy
          falls to {formatMoney(F.tenCashToBuy)} because less cash went to the down payment — closing, moving, and
          repairs still sit on top.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Closing costs, repairs, and the cash to buy</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Cash to buy is not the monthly payment. It is the check you write to get the keys:
        </p>
        <GuideFormula>Cash to buy = down payment + closing costs + moving + repairs / furnishing</GuideFormula>
        <p className="mt-4 text-base leading-relaxed text-ink">
          On the default path that is {formatMoney(F.downPayment)} + {formatMoney(F.closingCost)} +{" "}
          {formatMoney(F.movingCost)} + {formatMoney(F.furnishingCost)} = {formatMoney(F.cashToBuy)}. Closing costs are
          an editable estimate, not a universal percent. Moving is optional. Repairs / furnishing is optional cash
          after closing — paint, a water heater, a sofa — not the yearly upkeep line.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Yearly upkeep is the ongoing repair budget. The default is 1% of price ({formatMoney(F.maintenanceAnnual)} a
          year, about {formatMoney(F.breakdown.maintenance)} a month). That stream is inside housing cost and grows
          with inflation. A roof in year 12 is why that line exists.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Utilities are not a housing-cost field</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Electric, gas, water, trash, and internet are real ownership costs. Can I Get a Mortgage does not give them
          their own box. They are not inside estimated housing cost. If you want them in the outlook, fold a monthly
          stand-in into the life-cost fields that sit beside the house — or raise upkeep if you treat them as part of
          keeping the place running. Do not assume the calculator added a utility bill you never entered.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Life still sits beside the house</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Housing cost is not the whole budget. Each year the model also subtracts inflated food, school, travel,
          extras, dependents, and health, plus flat car and other loans until those terms end. Leftover is take-home
          minus housing minus life minus those loans. A surplus goes into the investment pile. A shortfall draws the
          pile. The pile then grows at the return you entered.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          On the default path, year-one take-home is {formatMoney(F.yearOneIncome)}. Housing is{" "}
          {formatMoney(F.yearOneHousing)}. Life is {formatMoney(F.yearOneLife)}. Car and other loans are{" "}
          {formatMoney(F.yearOneLoans)}. Leftover is {formatMoney(F.yearOneLeftover)}. Housing is{" "}
          {formatPercent(F.housingRatio, 0)} of take-home; adding those loans makes {formatPercent(F.obligationRatio, 0)}.
          Those are household shares, not a lender approval.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">What you may spend owning it</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Over the loan the calculator totals three buckets. Financing is principal, interest, and extras. Ownership is
          tax, insurance, HOA, upkeep, and PMI. Cash to buy sits outside both.
        </p>
        <GuideTable
          caption="Default-path totals from Can I Get a Mortgage"
          headers={["Bucket", "Default path"]}
          rows={[
            ["Purchase price", formatMoney(F.homePrice)],
            ["Mortgage borrowed", formatMoney(F.loanAmount)],
            ["Total interest", formatMoney(F.totalInterest)],
            ["Financing (P + I + extras)", formatMoney(F.totalFinancing)],
            ["Ownership costs", formatMoney(F.totalOwnership)],
            ["Housing cash outflow", formatMoney(F.totalHousingOutflow)],
            ["Cash to buy", formatMoney(F.cashToBuy)],
            ["Outflow plus cash to buy", formatMoney(F.outflowPlusCash)],
          ]}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">Where the money goes on this path:</p>
        <GuideTable
          caption="Lifetime buckets on the default path"
          headers={["Goes to", "Amount"]}
          rows={F.moneyGoes.map((row) => [row.label, formatMoney(row.amount)])}
        />
        <p className="mt-4 text-base leading-relaxed text-ink">
          The house costs {formatMoney(F.homePrice)}. Owning it on this path may take about{" "}
          {formatMoney(F.outflowPlusCash)} — purchase cash, then mortgage and housing costs over the loan. Projected
          ownership expenses are not part of the loan.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">A 15-year compare is a different loan, not a cheaper house</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          The calculator can hold a second path: same house or another listing, another down payment, rate, and term.
          The default compare is a {F.compareTerm}-year quote at {formatPercent(F.compareRate)} on the same{" "}
          {formatMoney(F.homePrice)} price. That changes the payment and the interest, not the tax bill. Use it to see
          which lever moves the outcome — rate, term, or cash down — instead of treating P&amp;I as the whole story.
        </p>

        <GuideCta>
          <p>
            <span className="font-semibold text-pine">See what this house actually costs. </span>
            Enter your tax, insurance, HOA, PMI, and upkeep. Then change the rate, the down payment, and a 15-year
            compare.
          </p>
          <Link href="/mortgage" className={ctaButton}>
            Open Can I Get a Mortgage
          </Link>
        </GuideCta>

        <h2 className="mt-10 font-serif text-2xl text-pine">Run your own house</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          These defaults are a first-home illustration, not a quote. Your tax, insurance, HOA, PMI, and upkeep will
          differ by state, carrier, and the house itself. Enter them.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          Can I Get a Mortgage is an educational projection. It is not a pre-approval, a rate lock, or tax advice.
          Lenders use their own rules. Compare the outlook with a lender before you offer.
        </p>

        <h2 className="mt-10 font-serif text-2xl text-pine">Frequently asked questions</h2>
        {TRUE_COST_FAQS.map((faq) => (
          <div key={faq.question}>
            <h3 className="mt-6 font-serif text-xl text-pine">{faq.question}</h3>
            <p className="mt-3 text-base leading-relaxed text-ink">{faq.answer}</p>
          </div>
        ))}

        <h2 className="mt-10 font-serif text-2xl text-pine">Sources and methodology</h2>
        <p className="mt-3 text-base leading-relaxed text-ink">
          Worked figures were produced with Can I Get a Mortgage using the calculator’s default first-home path. Monthly
          P&amp;I uses the standard amortization formula. Estimated housing cost is P&amp;I plus tax, insurance, PMI,
          HOA, and upkeep. Cash to buy is down payment plus closing, moving, and repairs or furnishing. PMI turns off
          when loan-to-value reaches 80% of purchase price. Utilities are not a housing-cost field. Extras go to
          principal and do not recast the payment.
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink">
          This guide is educational and is not a pre-approval, a rate lock, or tax advice. Mortgage contracts and
          household costs differ. Compare the outlook with a lender before you offer.
        </p>
        <p className="mt-6 text-sm text-muted">Last reviewed: {TRUE_COST_GUIDE.reviewed}</p>
      </article>

      <nav className="mt-12 max-w-3xl border-t border-pine/15 pt-8" aria-label="Buying a Home calculators">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">Buying a Home</p>
        <p className="mt-2 font-serif text-xl text-pine">Continue with the Buying a Home calculators</p>
        <p className="mt-3 text-base leading-relaxed text-ink">
          This guide is the ownership-cost companion to the home tools. Use them to see housing cost beside the payment,
          then whether extra principal or cash is the better next dollar.
        </p>
        <ul className="mt-4 space-y-2">
          <li>
            <Link href="/mortgage" className={pineLink}>
              Open Can I Get a Mortgage
            </Link>
          </li>
          <li>
            <Link href="/mortgage/payoff" className={pineLink}>
              See how much faster extra payments retire the loan
            </Link>
          </li>
          <li>
            <Link href={EXTRA_VS_SAVINGS_PATH} className={pineLink}>
              Read Should I Pay Extra on My Mortgage or Keep the Money in Savings?
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
