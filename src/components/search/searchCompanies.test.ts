import { describe, expect, it } from 'vitest'
import fixture from '../../../data/graph.fixture.json'
import { GraphSchema } from '../../schema'
import { searchCompanies } from './searchCompanies'

const graph = GraphSchema.parse(fixture)

describe('searchCompanies', () => {
  it('returns all companies for an empty query', () => {
    const companies = graph.nodes.filter((node) => node.type === 'company')
    expect(searchCompanies(graph, '')).toHaveLength(companies.length)
  })

  it('matches by name, case-insensitively', () => {
    const results = searchCompanies(graph, 'STRIPE')
    expect(results.map((company) => company.id)).toEqual(['company:stripe'])
  })

  it('matches by alias', () => {
    const results = searchCompanies(graph, 'maplebear')
    expect(results.map((company) => company.id)).toEqual(['company:instacart'])
  })

  it('never returns funds or people', () => {
    for (const result of searchCompanies(graph, 'a')) {
      expect(result.type).toBe('company')
    }
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchCompanies(graph, 'zzz-no-such-company')).toEqual([])
  })
})
