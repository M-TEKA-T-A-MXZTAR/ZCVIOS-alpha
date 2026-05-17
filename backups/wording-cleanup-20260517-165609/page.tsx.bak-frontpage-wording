import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100 md:px-12">
      <main className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[1.5fr_1fr]">
        <section className="border border-zinc-800 bg-zinc-950/95 p-8 md:p-12" data-testid="landing-hero-panel">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500" data-testid="landing-version-label">
            ZC-VIOS Core v1.1.0-alpha
          </p>
          <p className="mt-3 border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400" data-testid="landing-alpha-disclaimer">
            Alpha disclaimer: this template is focused on core engine behavior for local dev and iterative testing.
          </p>
          <h1 className="font-heading mt-5 text-4xl font-black tracking-tight md:text-6xl" data-testid="landing-main-heading">
            Revenue-per-hour acceleration for real operator days.
          </h1>
          <p className="mt-6 max-w-2xl text-sm text-zinc-300 md:text-base" data-testid="landing-description-text">
            Convert weekly intent into one weekly lever and one daily mission. Measure progress against your own 4-week EHR
            slope, not market noise.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              data-testid="landing-create-account-link"
              style={{ color: "#09090b" }}
              className="border border-zinc-200 bg-zinc-100 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-colors duration-200 hover:bg-white"
            >
              Create account
            </Link>
            <Link
              href="/login"
              data-testid="landing-login-link"
              className="border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-zinc-100 transition-colors duration-200 hover:bg-zinc-800"
            >
              Login
            </Link>
          </div>
        </section>

        <aside className="grid gap-6" data-testid="landing-principles-grid">
          {[
            "Central metric: Effective Hourly Rate (EHR)",
            "Exactly one weekly lever",
            "Neutral language, no gamification",
            "Pause mode and reset mission built in",
          ].map((item) => (
            <div key={item} className="border border-zinc-800 bg-zinc-900/80 p-6" data-testid="landing-principle-card">
              <p className="text-sm text-zinc-200">{item}</p>
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}
