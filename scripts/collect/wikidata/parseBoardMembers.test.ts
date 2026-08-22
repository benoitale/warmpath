import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { boardMembersQuery, parseWikidataBoardMembers } from './parseBoardMembers'
import { wikidataCollector } from './index'

const fixtures = resolve(dirname(fileURLToPath(import.meta.url)), '../__fixtures__')

function readFixture(name: string): string {
  return readFileSync(resolve(fixtures, name), 'utf-8')
}

describe('boardMembersQuery', () => {
  it('embeds a valid QID and rejects garbage', () => {
    expect(boardMembersQuery('Q285329')).toContain('wd:Q285329')
    expect(() => boardMembersQuery('apollo')).toThrow(/Invalid Wikidata QID/)
  })
})

describe('parseWikidataBoardMembers', () => {
  it('parses the Apollo board fixture', () => {
    const response = JSON.parse(readFixture('wikidata/apollo-global-board.sparql.json'))
    const members = parseWikidataBoardMembers(response)
    expect(members.map((member) => member.name).sort()).toEqual(['Gary Cohn', 'Marc Rowan'])
    expect(members.every((member) => member.endDate === null)).toBe(true)
  })
})

describe('wikidataCollector', () => {
  it('emits board_seat edges from the SPARQL fixture', () => {
    const fragment = wikidataCollector.collect(
      [
        {
          companyId: 'company:apollo-global',
          name: 'Apollo Global Management',
          wikidataId: 'Q618751',
        },
      ],
      { accessedOn: '2026-08-22', readFixture },
    )

    expect(fragment.edges).toHaveLength(2)
    expect(fragment.edges.every((edge) => edge.type === 'board_seat')).toBe(true)
    expect(fragment.edges.every((edge) => edge.source_url.includes('wikidata.org'))).toBe(true)
  })
})
