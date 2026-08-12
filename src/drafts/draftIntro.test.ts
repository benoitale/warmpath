import { describe, expect, it } from 'vitest'
import fixture from '../../data/graph.fixture.json'
import { GraphSchema } from '../schema'
import type { ScoredPath } from '../scoring'
import { draftIntro } from './draftIntro'

describe('draftIntro (stub)', () => {
  it('returns an empty placeholder draft until session 05 implements it', () => {
    const graph = GraphSchema.parse(fixture)
    const path: ScoredPath = {
      targetCompanyId: 'company:stripe',
      steps: [],
      score: 0,
      reasons: [],
    }
    expect(draftIntro(path, graph)).toEqual({ subject: '', body: '', forwardable: '' })
  })
})
