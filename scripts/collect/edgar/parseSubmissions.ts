export type EdgarRecentFilings = {
  form: string[]
  filingDate: string[]
  accessionNumber: string[]
  primaryDocument: string[]
}

export type EdgarSubmissions = {
  cik?: string | number
  name?: string
  tickers?: string[]
  filings?: {
    recent?: EdgarRecentFilings
  }
}

export type EdgarFilingRef = {
  form: string
  filingDate: string
  accessionNumber: string
  primaryDocument: string
  /** Direct document URL on sec.gov archives. */
  documentUrl: string
}

function padCik(cik: string | number): string {
  return String(cik).replace(/\D/g, '').padStart(10, '0')
}

function accessionPath(accessionNumber: string): string {
  return accessionNumber.replace(/-/g, '')
}

/**
 * Pick the newest filing of the given form types from an EDGAR submissions payload.
 * Pure: no I/O.
 */
export function findLatestFiling(
  submissions: EdgarSubmissions,
  forms: readonly string[],
): EdgarFilingRef | null {
  const recent = submissions.filings?.recent
  if (!recent) return null

  const cik = submissions.cik
  if (cik === undefined) return null

  const formSet = new Set(forms)
  let best: EdgarFilingRef | null = null

  for (let i = 0; i < recent.form.length; i++) {
    const form = recent.form[i]
    if (!formSet.has(form)) continue
    const filingDate = recent.filingDate[i]
    const accessionNumber = recent.accessionNumber[i]
    const primaryDocument = recent.primaryDocument[i]
    if (!filingDate || !accessionNumber || !primaryDocument) continue

    const documentUrl = `https://www.sec.gov/Archives/edgar/data/${Number(padCik(cik))}/${accessionPath(accessionNumber)}/${primaryDocument}`
    const candidate: EdgarFilingRef = {
      form,
      filingDate,
      accessionNumber,
      primaryDocument,
      documentUrl,
    }
    if (best === null || candidate.filingDate > best.filingDate) {
      best = candidate
    }
  }

  return best
}

export function normalizeCik(cik: string | number): string {
  return padCik(cik)
}
