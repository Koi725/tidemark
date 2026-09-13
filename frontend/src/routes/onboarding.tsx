import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Button, Input } from '@/components/primitives'
import { WizardStepper } from '@/components/wizard/WizardStepper'
import { StatusDot } from '@/components/status/StatusDot'
import { TidemarkMark } from '@/components/brand/TidemarkMark'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { easeTuples, useReducedMotion } from '@/lib/motion'
import { formatCount } from '@/lib/format'
import { DATASETS } from '@/mocks'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoute,
})

/* ── Tide → sparkline morph paths (§5.1 beat 2), authored as 16 cubic segments. */
const W = 1440
const N = 16
const SEG = W / N

function cubicPath(ys: number[]): string {
  let d = `M0 ${ys[0]}`
  for (let i = 0; i < N; i += 1) {
    const x0 = i * SEG
    const x1 = (i + 1) * SEG
    const c = (x1 - x0) / 3
    d += ` C${x0 + c} ${ys[i]} ${x1 - c} ${ys[i + 1]} ${x1} ${ys[i + 1]}`
  }
  return d
}

const WAVE_YS = Array.from({ length: N + 1 }, (_, i) => 60 - 40 * Math.sin((i / N) * Math.PI * 2 * 3))
const JAGGED_AMPS = [0, 22, 12, 40, 18, 46, 10, 34, 24, 44, 14, 38, 20, 30, 16, 28, 6]
const JAGGED_YS = JAGGED_AMPS.map((amp, i) => (i === 0 ? 60 : i === N ? 54 : 60 - (i % 2 === 0 ? -amp * 0.4 : amp)))
const WAVE_PATH = cubicPath(WAVE_YS)
const JAGGED_PATH = cubicPath(JAGGED_YS)

const STEP_LABELS = ['Admin', 'Source', 'Datasets']
const FOUND = DATASETS.slice(0, 8)

const SCHEMES = ['postgres', 'mysql', 'clickhouse', 'trino', 'duckdb']

function OnboardingRoute() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)

  const emailValid = /.+@.+\..+/.test(email)
  const passwordValid = password.length >= 12

  const submitAdmin = (): void => {
    if (emailValid && passwordValid) setStep(1)
  }

  const connect = (): void => {
    const scheme = url.split('://')[0]?.toLowerCase()
    if (!scheme || !SCHEMES.includes(scheme)) {
      setUrlError('Not a connection URL I recognise. Supported schemes: postgres, mysql, clickhouse, trino, duckdb.')
      return
    }
    setUrlError(null)
    setStep(2)
  }

  const openOverview = (): void => {
    setLeaving(true)
    window.setTimeout(() => void navigate({ to: '/' }), reduced ? 0 : 240)
  }

  const fade = (delay: number) =>
    reduced
      ? { initial: false as const }
      : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1.4, ease: easeTuples.out, delay } }

  return (
    <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* HERO */}
      <motion.div
        data-theme="dark"
        animate={leaving && !reduced ? { opacity: 0, x: -24 } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.24, ease: easeTuples.out }}
        className="relative flex min-h-[240px] flex-col justify-between overflow-hidden bg-canvas p-10 text-ink lg:min-h-svh"
      >
        <motion.div {...fade(0)} className="flex items-center gap-2.5">
          <TidemarkMark size={26} className="text-tide" />
          <span className="font-display text-h2 tracking-[.02em] text-ink">tidemark</span>
        </motion.div>

        {/* tide line → sparkline morph */}
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 h-[120px] -translate-y-1/2 text-tide"
        >
          <motion.path
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ d: reduced ? JAGGED_PATH : WAVE_PATH }}
            animate={reduced ? undefined : { d: [WAVE_PATH, WAVE_PATH, JAGGED_PATH, JAGGED_PATH] }}
            transition={reduced ? undefined : { duration: 7, ease: 'easeInOut', times: [0, 0.45, 0.7, 1] }}
          />
        </svg>

        <div className="relative flex flex-col gap-3">
          <motion.h1 {...fade(0.3)} className="font-display text-[32px] leading-[1.02] text-ink lg:text-display">
            Know when your data
            <br />
            stops arriving.
          </motion.h1>
          <motion.p
            {...(reduced ? { initial: false as const } : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8, delay: 0.7 } })}
            className="max-w-[520px] text-[16px] text-ink-muted"
          >
            Uptime Kuma for your data. One container, read-only toward your systems, zero telemetry.
          </motion.p>
          <motion.code
            {...(reduced ? { initial: false as const } : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8, delay: 0.7 } })}
            className="font-mono text-mono-sm text-ink-muted max-lg:hidden"
          >
            docker run -p 3080:3080 ghcr.io/tidewatch/tidewatch
          </motion.code>
        </div>
      </motion.div>

      {/* FORM PANEL */}
      <div className="flex items-center justify-center bg-canvas p-5 lg:p-12">
        <div className="flex w-full max-w-[520px] flex-col gap-6">
          <motion.div {...(reduced ? { initial: false as const } : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.4, delay: 0.2 } })}>
            <WizardStepper steps={STEP_LABELS} current={step} variant="labelled" />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: easeTuples.out }}
              className="flex flex-col gap-4"
            >
              {step === 0 ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="font-display text-h2 text-ink">Create the admin account</h2>
                    <p className="text-body-sm text-ink-muted">
                      Stored locally in the container's volume. No account with us — there is no us.
                    </p>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Email</span>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.dev" aria-label="Email" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Password</span>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" />
                    <span className="text-[11px] text-ink-muted">At least 12 characters. A passphrase is fine.</span>
                  </label>
                  <Button variant="primary" className="w-fit" disabled={!emailValid || !passwordValid} onClick={submitAdmin}>
                    Continue
                  </Button>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="font-display text-h2 text-ink">Add your first source</h2>
                    <p className="text-body-sm text-ink-muted">Paste a connection URL. tidemark only needs a read-only role.</p>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-label font-display uppercase tracking-[.1em] text-ink-muted">Connection URL</span>
                    <Input
                      mono
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      invalid={urlError !== null}
                      placeholder="postgres://user:pass@host:5432/db?sslmode=require"
                      aria-label="Connection URL"
                    />
                    <span className="text-[11px] text-ink-muted">
                      Postgres, MySQL, ClickHouse, Trino, DuckDB — or{' '}
                      <button type="button" onClick={() => setStep(1)} className="text-tide hover:underline">
                        switch to the full form
                      </button>
                      .
                    </span>
                  </label>
                  {urlError ? <ErrorState headline="Couldn't parse URL" raw={urlError} onRetry={() => setUrlError(null)} /> : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="primary" onClick={connect}>
                      Connect &amp; discover
                    </Button>
                    <Button variant="secondary" onClick={() => setStep(2)}>
                      Try the demo dataset
                      <span className="ml-1.5 text-[11px] text-ink-muted">no credentials</span>
                    </Button>
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <h2 className="font-display text-h2 text-ink">Found {FOUND.length} datasets</h2>
                    <p className="text-body-sm text-ink-muted">
                      Found {FOUND.length} in warehouse-pg. Baselines learn over the first 24h.
                    </p>
                  </div>
                  {FOUND.length === 0 ? (
                    <EmptyState
                      title="Nothing to discover"
                      body="The role can see the server but no tables in the allowed schemas. Check the role's grants."
                      action={{ label: 'Back to the source', onClick: () => setStep(1) }}
                    />
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {FOUND.slice(0, 6).map((d, i) => (
                        <motion.div
                          key={d.id}
                          initial={reduced ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, ease: easeTuples.out, delay: reduced ? 0 : i * 0.09 }}
                          className="flex items-center gap-2.5"
                        >
                          <StatusDot state="ok" />
                          <span className="min-w-0 flex-1 truncate font-mono text-mono-sm text-ink">{d.key}</span>
                          <span className="font-mono text-mono-sm text-ink-muted">
                            {d.rowsWindow === null ? '—' : `${formatCount(d.rowsWindow)} rows`}
                          </span>
                        </motion.div>
                      ))}
                      {FOUND.length > 6 ? (
                        <span className="text-body-sm text-ink-muted">+{FOUND.length - 6} more</span>
                      ) : null}
                    </div>
                  )}
                  <Button variant="primary" className="w-fit" onClick={openOverview}>
                    Open overview
                  </Button>
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
