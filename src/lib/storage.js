export function loadLocal(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export function saveLocal(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
