import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { findLatestFiling } from './parseSubmissions'
import { parseCohnGoldmanEmployment, parseDef14aRoles } from './parseDef14a'
import { edgarCollector } from './index'

const fixtures = resolve(dirname(fileURLToPath(import.meta.url)), '../__fixtures__')

function readFixture(name: string): string {
  return readFileSync(resolve(fixtures, name), 'utf-8')
}

describe('findLatestFiling', () => {
  it('returns the newest DEF 14A from the SEI submissions fixture', () => {
    const submissions = JSON.parse(readFixture('edgar/sei-investments-submissions.sample.json'))
    const filing = findLatestFiling(submissions, ['DEF 14A'])
    expect(filing).not.toBeNull()
    expect(filing?.form).toBe('DEF 14A')
    expect(filing?.documentUrl).toContain('/seic-20260414.htm')
  })
})

describe('parseDef14aRoles', () => {
  it('finds Ryan Hicke as CEO in the SEI snippet', () => {
    const html = readFixture('edgar/sei-investments-def14a.snippet.html')
    const hits = parseDef14aRoles(html)
    expect(hits.some((hit) => hit.name === 'Ryan Hicke' && hit.role === 'ceo')).toBe(true)
  })

  it('finds Marc Rowan and Gary Cohn in the Apollo snippet', () => {
    const html = readFixture('edgar/apollo-global-def14a.snippet.html')
    const hits = parseDef14aRoles(html)
    expect(hits.some((hit) => hit.name === 'Marc Rowan' && hit.role === 'ceo')).toBe(true)
    expect(hits.some((hit) => hit.name === 'Gary Cohn' && hit.role === 'lead_independent_director')).toBe(
      true,
    )
  })
})

describe('parseCohnGoldmanEmployment', () => {
  it('extracts 2006–2016 Goldman presidency from Apollo proxy language', () => {
    const html = readFixture('edgar/apollo-global-def14a.snippet.html')
    const employment = parseCohnGoldmanEmployment(html)
    expect(employment).toEqual({
      companyName: 'The Goldman Sachs Group, Inc.',
      title: 'President and Chief Operating Officer',
      startYear: '2006',
      endYear: '2016',
      evidence: expect.stringContaining('Goldman Sachs'),
    })
  })
})

describe('edgarCollector', () => {
  it('emits sourced edges from fixtures without network I/O', () => {
    const fragment = edgarCollector.collect(
      [
        {
          companyId: 'company:sei-investments',
          name: 'SEI Investments',
          ticker: 'SEIC',
          cik: '350894',
        },
        {
          companyId: 'company:apollo-global',
          name: 'Apollo Global Management',
          ticker: 'APO',
          cik: '1858681',
        },
      ],
      {
        accessedOn: '2026-08-22',
        readFixture,
      },
    )

    expect(fragment.edges.length).toBeGreaterThan(0)
    expect(fragment.edges.every((edge) => edge.source_url.startsWith('https://'))).toBe(true)
    expect(fragment.edges.some((edge) => edge.id.includes('cohn-goldman'))).toBe(true)
  })
})
