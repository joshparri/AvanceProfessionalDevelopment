import { useEffect, useMemo, useState } from 'react'
import { onsitePhases } from '../data/onsiteChecklist'
import { loadLocal, saveLocal } from '../lib/storage'

const STORAGE_KEY = 'avance.onsiteChecklist.v1'

function defaultState() {
  return {
    checked: {},
    reflections: '',
    updatedAt: null,
  }
}

export default function OnsiteChecklist() {
  const [state, setState] = useState(() => loadLocal(STORAGE_KEY, defaultState()))

  useEffect(() => {
    saveLocal(STORAGE_KEY, state)
  }, [state])

  const allSteps = useMemo(() => onsitePhases.flatMap((phase) => phase.steps), [])
  const completedCount = allSteps.filter((step) => state.checked[step.id]).length
  const progress = Math.round((completedCount / allSteps.length) * 100)

  function toggleStep(stepId) {
    setState((current) => ({
      ...current,
      checked: {
        ...current.checked,
        [stepId]: !current.checked[stepId],
      },
      updatedAt: Date.now(),
    }))
  }

  function updateReflections(value) {
    setState((current) => ({
      ...current,
      reflections: value,
      updatedAt: Date.now(),
    }))
  }

  function resetChecklist() {
    setState(defaultState())
  }

  return (
    <section className="rounded-lg border border-cyan-400/20 bg-slate-950/70 p-4 shadow-2xl shadow-cyan-950/20">
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Onsite Checklist</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Three-phase visit control</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Tick off the critical pre-visit, onsite, and closure checks. Progress and local reflections stay in this browser only.
          </p>
        </div>
        <div className="min-w-40 rounded-md border border-cyan-400/30 bg-cyan-400/10 p-3 text-right">
          <p className="text-3xl font-bold text-cyan-200">{progress}%</p>
          <p className="text-xs text-slate-300">{completedCount} of {allSteps.length} complete</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {onsitePhases.map((phase) => {
          const phaseDone = phase.steps.filter((step) => state.checked[step.id]).length
          return (
            <div key={phase.id} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{phase.subtitle}</p>
                <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                <p className="mt-1 text-xs text-cyan-200">{phaseDone}/{phase.steps.length} complete</p>
              </div>

              <div className="space-y-2">
                {phase.steps.map((step) => {
                  const checked = Boolean(state.checked[step.id])
                  return (
                    <label
                      key={step.id}
                      className={`block cursor-pointer rounded-md border p-3 transition ${
                        checked
                          ? 'border-cyan-400/50 bg-cyan-400/10'
                          : step.critical
                            ? 'border-amber-400/40 bg-amber-400/10'
                            : 'border-slate-800 bg-slate-950/60 hover:border-cyan-400/40'
                      }`}
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStep(step.id)}
                          className="mt-1 h-5 w-5 accent-cyan-400"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            {step.critical && <span className="mr-2 text-amber-300">CRITICAL</span>}
                            {step.text}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{step.detail}</p>
                          {step.integration && (
                            <span className="mt-2 inline-flex rounded border border-cyan-400/30 px-2 py-1 text-[11px] text-cyan-200">
                              References {step.integration}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,280px]">
        <div>
          <label className="text-sm font-medium text-slate-200" htmlFor="onsite-reflections">
            Local reflection / non-sensitive reminder
          </label>
          <textarea
            id="onsite-reflections"
            value={state.reflections}
            onChange={(event) => updateReflections(event.target.value)}
            placeholder="Example: bring spare HDMI next time. Do not enter client names, ticket notes, URLs, or passwords."
            className="mt-2 min-h-28 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-cyan-400/40 placeholder:text-slate-500 focus:ring-2"
          />
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-300">
          <p className="font-semibold text-white">Privacy guardrail</p>
          <p className="mt-2 leading-5">
            Store only generic workflow reminders here. Client names, internal URLs, credentials, and ticket notes belong in approved systems.
          </p>
          <button
            type="button"
            onClick={resetChecklist}
            className="mt-4 w-full rounded-md border border-slate-700 px-3 py-2 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-100"
          >
            Reset checklist
          </button>
        </div>
      </div>
    </section>
  )
}
