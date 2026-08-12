import { describe, expect, it } from 'vitest'
import fixture from '../../data/graph.fixture.json'
import { GraphSchema } from '../schema'
import { scorePaths } from './score'

describe('scorePaths (stub)', () => {
  it('returns an empty array until session 02 implements it', () => {
    const graph = GraphSchema.parse(fixture)
    const result = scorePaths(graph, 'company:stripe', new Date('2026-08-12T00:00:00Z'))
    expect(result).toEqual([])
  })
})
