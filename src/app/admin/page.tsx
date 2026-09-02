import { redirect } from "next/navigation";
import { AdminActions } from "@/components/AdminActions";
import { AdminPasswordForm } from "@/components/AdminPasswordForm";
import { clusterPageGroups, toolsWithCounts } from "@/lib/admin/constants";
import { adminSessionFromCookies } from "@/lib/admin/request";
import { readAnalyticsSnapshot } from "@/lib/admin/store";
import { authStatus, needsSetup } from "@/lib/admin/credentials";
import { AD_SLOT_USAGE, AD_SLOTS, adsensePublisherId, adsenseSlotId } from "@/lib/ads";
import { HUB_TITLE } from "@/lib/brand";

export const dynamic = "force-dynamic";

function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function AdminPage() {
  if (await needsSetup()) {
    redirect("/admin/setup");
  }
  if (!(await adminSessionFromCookies())) {
    redirect("/admin/login");
  }

  const stats = await readAnalyticsSnapshot();
  const maxBar = Math.max(1, ...stats.series.map((row) => row.pageviews));
  const adsClient = adsensePublisherId();
  const adsSlot = adsenseSlotId();
  const auth = await authStatus();
  const pageGroups = clusterPageGroups(stats.byPath);
  const toolRows = toolsWithCounts(stats.byTool);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-pine">Overview</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {HUB_TITLE}: the hub plus seven calculators. Visitors are unique browsers that loaded a public page. Site
            users are visitors who ran a calculator. Savings and personal plan numbers are never stored.
          </p>
        </div>
        <AdminActions />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Visitors" value={formatCount(stats.lifetime.visitors)} note="All time, unique" />
        <Metric label="Site users" value={formatCount(stats.lifetime.users)} note="Ran a calculator" />
        <Metric label="Page views" value={formatCount(stats.lifetime.pageviews)} note="All public pages" />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Today" value={formatCount(stats.today.visitors)} note={`${formatCount(stats.today.users)} users · ${formatCount(stats.today.pageviews)} views`} />
        <Metric label="Last 7 days" value={formatCount(stats.last7.visitors)} note={`${formatCount(stats.last7.users)} users · ${formatCount(stats.last7.pageviews)} views`} />
        <Metric label="Last 30 days" value={formatCount(stats.last30.visitors)} note={`${formatCount(stats.last30.users)} users · ${formatCount(stats.last30.pageviews)} views`} />
      </section>

      <section className="card">
        <h2 className="font-serif text-xl text-pine">Last 30 days</h2>
        <p className="mt-1 text-sm text-muted">Page views per day. Unique visitors and users are in the table below the bars.</p>
        <div className="mt-5 flex h-40 items-end gap-1">
          {stats.series.map((row) => (
            <div key={row.date} className="flex min-w-0 flex-1 flex-col justify-end" title={`${row.date}: ${row.pageviews} views`}>
              <div
                className="w-full rounded-t bg-pine/80"
                style={{ height: `${Math.max(row.pageviews > 0 ? 8 : 2, (row.pageviews / maxBar) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>{stats.series[0]?.date}</span>
          <span>{stats.series[stats.series.length - 1]?.date}</span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Views</th>
                <th className="pb-2 font-medium">Visitors</th>
                <th className="pb-2 font-medium">Users</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.series].reverse().slice(0, 14).map((row) => (
                <tr key={row.date} className="border-t border-pine/10">
                  <td className="py-2">{row.date}</td>
                  <td>{formatCount(row.pageviews)}</td>
                  <td>{formatCount(row.visitors)}</td>
                  <td>{formatCount(row.users)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-serif text-xl text-pine">Public pages</h2>
          <p className="mt-1 text-sm text-muted">Same names and clusters as the hub. Views stay 0 until someone opens the page.</p>
          <div className="mt-4 space-y-5">
            {pageGroups.map((group) => (
              <div key={group.id}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{group.title}</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {group.rows.map((row) => (
                    <li key={row.path} className="flex justify-between gap-4">
                      <span>{row.label}</span>
                      <span className="font-medium text-ink">{formatCount(row.pageviews)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-serif text-xl text-pine">Calculator runs</h2>
          <p className="mt-1 text-sm text-muted">One count each time a visitor runs that tool. All seven stay listed.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {toolRows.map((row) => (
              <li key={row.tool} className="flex justify-between gap-4">
                <span>{row.label}</span>
                <span className="font-medium text-ink">{formatCount(row.runs)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card">
        <h2 className="font-serif text-xl text-pine">Google AdSense</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          You do not attach AdSense from this dashboard. The public pages already have the slots. Live ads turn on when
          the host has a publisher id. Set <code className="text-ink">NEXT_PUBLIC_ADSENSE_CLIENT</code> (format{" "}
          <code className="text-ink">ca-pub-…</code>) on Vercel or Hostinger and redeploy. An optional{" "}
          <code className="text-ink">NEXT_PUBLIC_ADSENSE_SLOT</code> (digits only) is the display unit those slots use.
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Status</dt>
            <dd className="mt-1 text-ink">
              {adsClient
                ? adsSlot
                  ? `Live — ${adsClient}, unit ${adsSlot}`
                  : `Publisher set — ${adsClient}. Add NEXT_PUBLIC_ADSENSE_SLOT for display units, or use Auto ads.`
                : "Placeholder slots. No publisher id on this host."}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">ads.txt</dt>
            <dd className="mt-1 text-ink">
              {adsClient ? "Served at /ads.txt from the publisher id." : "Not published until the publisher id is set."}
            </dd>
          </div>
        </dl>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">Slot</th>
                <th className="pb-2 font-medium">Size</th>
                <th className="pb-2 font-medium">On the site</th>
              </tr>
            </thead>
            <tbody>
              {AD_SLOT_USAGE.map((row) => (
                <tr key={row.placement} className="border-t border-pine/10">
                  <td className="py-2 pr-3">{AD_SLOTS[row.placement].label}</td>
                  <td className="py-2 pr-3">{AD_SLOTS[row.placement].size}</td>
                  <td className="py-2">{row.where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="font-serif text-xl text-pine">System</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Traffic storage</dt>
            <dd className="mt-1 text-ink">
              {stats.persistence === "redis"
                ? "Redis (Upstash / Vercel KV)"
                : stats.persistence === "file"
                  ? "File on this server (.data/analytics.json)"
                  : "Memory only — counts reset when the server sleeps. Set Upstash Redis for production."}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Admin password</dt>
            <dd className="mt-1 text-ink">
              {auth.mode === "env"
                ? "Optional ADMIN_PASSWORD environment variable is set"
                : auth.persistence === "file"
                  ? "Stored hashed on this server (.data/admin.json)"
                  : auth.persistence === "redis"
                    ? "Stored hashed in Redis"
                    : auth.persistence === "browser"
                      ? "Hashed verifier in this browser for 7 days — not the password, and unused once the server file exists"
                      : "Stored in memory until this server process restarts"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Snapshot</dt>
            <dd className="mt-1 text-ink">{new Date(stats.generatedAt).toISOString()}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2 className="font-serif text-xl text-pine">Change password</h2>
        <p className="mt-1 text-sm text-muted">
          On a normal server this stays in <code className="text-ink">.data/admin.json</code>. Copy that file when you
          move hosts if you want the same password. The browser copy is not used when that file exists.
        </p>
        <AdminPasswordForm envLocked={auth.mode === "env"} />
      </section>
    </main>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine">{label}</p>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}
