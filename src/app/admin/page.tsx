import { redirect } from "next/navigation";
import { AdminActions } from "@/components/AdminActions";
import { AdminPasswordForm } from "@/components/AdminPasswordForm";
import { PATH_LABELS, TOOL_LABELS } from "@/lib/admin/constants";
import { adminSessionFromCookies } from "@/lib/admin/request";
import { readAnalyticsSnapshot } from "@/lib/admin/store";
import { authStatus, needsSetup } from "@/lib/admin/credentials";

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
  const adsLive = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
  const auth = await authStatus();

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-pine">Overview</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Visitors are unique browsers that loaded a public page. Site users are visitors who ran a calculator.
            Savings and personal plan numbers are never stored.
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
          <h2 className="font-serif text-xl text-pine">Pages</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.byPath.length === 0 ? (
              <li className="text-muted">No page views yet.</li>
            ) : (
              stats.byPath.map((row) => (
                <li key={row.path} className="flex justify-between gap-4">
                  <span>{PATH_LABELS[row.path] ?? row.path}</span>
                  <span className="font-medium text-ink">{formatCount(row.pageviews)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-serif text-xl text-pine">Calculator runs</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.byTool.length === 0 ? (
              <li className="text-muted">No calculator runs yet.</li>
            ) : (
              stats.byTool.map((row) => (
                <li key={row.tool} className="flex justify-between gap-4">
                  <span>{TOOL_LABELS[row.tool]}</span>
                  <span className="font-medium text-ink">{formatCount(row.runs)}</span>
                </li>
              ))
            )}
          </ul>
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
            <dt className="text-xs uppercase tracking-wide text-muted">Ads</dt>
            <dd className="mt-1 text-ink">{adsLive ? "AdSense client is set" : "Placeholder slots (no AdSense client)"}</dd>
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
