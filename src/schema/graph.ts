import { z } from 'zod'

const isPrefixedId = (prefix: string) => (value: unknown): boolean =>
  typeof value === 'string' && value.startsWith(`${prefix}:`) && value.length > prefix.length + 1

export const FundIdSchema = z.custom<`fund:${string}`>(isPrefixedId('fund'), {
  message: 'Expected id of the form "fund:<slug>"',
})

export const CompanyIdSchema = z.custom<`company:${string}`>(isPrefixedId('company'), {
  message: 'Expected id of the form "company:<slug>"',
})

export const PersonIdSchema = z.custom<`person:${string}`>(isPrefixedId('person'), {
  message: 'Expected id of the form "person:<slug>"',
})

export const FundNodeSchema = z.object({
  id: FundIdSchema,
  type: z.literal('fund'),
  name: z.string(),
  aliases: z.array(z.string()),
})

export const CompanyNodeSchema = z.object({
  id: CompanyIdSchema,
  type: z.literal('company'),
  name: z.string(),
  aliases: z.array(z.string()),
  is_target: z.boolean(),
  is_customer: z.boolean(),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  industry: z.string(),
  employee_band: z.string(),
})

export const PersonNodeSchema = z.object({
  id: PersonIdSchema,
  type: z.literal('person'),
  name: z.string(),
  aliases: z.array(z.string()),
  public_role: z.string(),
  current_org_id: z.string().nullable(),
  is_connector: z.boolean(),
  intro_budget_quarterly: z.number(),
  intros_used_this_quarter: z.number(),
})

export const NodeSchema = z.discriminatedUnion('type', [
  FundNodeSchema,
  CompanyNodeSchema,
  PersonNodeSchema,
])

export const EdgeTypeSchema = z.enum([
  'board_seat',
  'investor_portfolio',
  'exec_employment',
  'co_investor',
  'customer_reference',
  'cohort',
])

const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const YEAR_MONTH_DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

export const EdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  type: EdgeTypeSchema,
  start_date: z.string().regex(YEAR_MONTH, 'Expected "YYYY-MM"').nullable(),
  end_date: z.string().regex(YEAR_MONTH, 'Expected "YYYY-MM"').nullable(),
  source_url: z.string().refine(
    (value) => {
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    },
    { message: 'source_url must be a well-formed http(s) URL' },
  ),
  source_accessed: z.string().regex(YEAR_MONTH_DAY, 'Expected "YYYY-MM-DD"'),
  confidence: z.enum(['high', 'medium', 'low']),
  notes: z.string(),
})

export const GraphSchema = z.object({
  version: z.string(),
  generated_at: z.string().datetime({ offset: true }),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
})

export type FundNode = z.infer<typeof FundNodeSchema>
export type CompanyNode = z.infer<typeof CompanyNodeSchema>
export type PersonNode = z.infer<typeof PersonNodeSchema>
export type Node = z.infer<typeof NodeSchema>
export type EdgeType = z.infer<typeof EdgeTypeSchema>
export type Edge = z.infer<typeof EdgeSchema>
export type Graph = z.infer<typeof GraphSchema>
