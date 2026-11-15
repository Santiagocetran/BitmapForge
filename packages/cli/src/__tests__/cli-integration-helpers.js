/* global process */
import { spawn } from 'node:child_process'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function groupAlive(pid) {
  if (!pid) return false
  try {
    process.kill(-pid, 0)
    return true
  } catch (error) {
    if (error.code === 'ESRCH') return false
    throw error
  }
}
function signalGroup(pid, signal) {
  try {
    process.kill(-pid, signal)
  } catch (error) {
    if (error.code !== 'ESRCH') throw error
  }
}

// Conservative additive envelope: descendant grace + TERM grace + KILL/close wait + final group poll.
export const CONTAINMENT_BUDGET = Object.freeze({
  descendantGraceMs: 5000,
  termGraceMs: 5000,
  closeWaitMs: 1000,
  postKillPollMs: 5000,
  teardownMs: 16000
})
export const LEGACY_CHILD_DEADLINE_MS = 40000
export const LEGACY_TEST_TIMEOUT_MS = 60000
export const LEGACY_FINALIZATION_MARGIN_MS = 4000

// Linux-only test containment, not production cancellation. Emergency reap always fails.
// Callers must budget deadlineMs + teardownMs + their own assertions/finally margin.
export async function runChild(command, args, { deadlineMs = 60000, outputCap = 1048576, ...options } = {}) {
  const started = Date.now()
  let failure = null,
    stdout = '',
    stderr = '',
    stdoutBytes = 0,
    stderrBytes = 0
  let emergency,
    timer,
    closeTimer,
    closeObserved = false
  const containmentErrors = []
  let resolveCloseTimeout
  const closeTimeout = new Promise((resolve) => {
    resolveCloseTimeout = resolve
  })
  const child = spawn(command, args, { ...options, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  const reap = (reason) => {
    failure ||= reason
    if (!emergency && child.pid) {
      emergency = (async () => {
        try {
          signalGroup(child.pid, 'SIGTERM')
          const until = Date.now() + CONTAINMENT_BUDGET.termGraceMs
          while (groupAlive(child.pid) && Date.now() < until) await sleep(25)
          if (groupAlive(child.pid)) signalGroup(child.pid, 'SIGKILL')
        } catch (error) {
          containmentErrors.push(`reap: ${error.message}`)
        } finally {
          // Escaped/inherited pipe holders must not leave the caller awaiting close forever.
          if (!closeObserved)
            closeTimer = setTimeout(() => {
              containmentErrors.push('child close not observed after emergency reap')
              child.stdout.destroy()
              child.stderr.destroy()
              child.unref()
              resolveCloseTimeout({ code: null, signal: null })
            }, CONTAINMENT_BUDGET.closeWaitMs)
        }
      })()
    }
  }
  child.stdout.on('data', (data) => {
    stdoutBytes += data.length
    if (stdoutBytes <= outputCap) stdout += data.toString()
    else reap('stdout overflow')
  })
  child.stderr.on('data', (data) => {
    stderrBytes += data.length
    if (stderrBytes <= outputCap) stderr += data.toString()
    else reap('stderr overflow')
  })
  const closed = new Promise((resolve) => {
    child.once('error', (error) => {
      failure ||= `spawn: ${error.message}`
    })
    child.once('close', (code, signal) => {
      closeObserved = true
      clearTimeout(closeTimer)
      resolve({ code, signal })
    })
  })
  timer = setTimeout(() => reap('deadline exceeded'), deadlineMs)
  const status = await Promise.race([closed, closeTimeout])
  clearTimeout(timer)
  clearTimeout(closeTimer)
  // An ordinary child may settle shortly before its descendants exit. Never reap unrelated groups.
  const until = Date.now() + CONTAINMENT_BUDGET.descendantGraceMs
  while (!emergency && groupAlive(child.pid) && Date.now() < until) await sleep(25)
  if (!emergency && groupAlive(child.pid)) reap('owned descendants survived child close')
  if (emergency) await emergency
  clearTimeout(closeTimer)
  const cleanupUntil = Date.now() + CONTAINMENT_BUDGET.postKillPollMs
  while (groupAlive(child.pid) && Date.now() < cleanupUntil) await sleep(25)
  return {
    command,
    args,
    pid: child.pid ?? null,
    ...status,
    failure,
    closeObserved,
    containmentErrors,
    stdout,
    stderr,
    stdoutBytes,
    stderrBytes,
    elapsedMs: Date.now() - started,
    emergencyReap: Boolean(emergency),
    groupAlive: groupAlive(child.pid)
  }
}
