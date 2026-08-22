import type { CollectedEdge, CollectedNode, Collector, GraphFragment } from '../types'

const COLLECTOR = 'curated' as const

/**
 * Hand-checked Cognition × FinServ East demo fragment.
 * Every edge cites a public URL. Candidates without a source were dropped (see `dropped`).
 */
export function buildCognitionFinservFragment(accessedOn: string): GraphFragment {
  const nodes: CollectedNode[] = [
    {
      collector: COLLECTOR,
      id: 'company:cognition',
      type: 'company',
      name: 'Cognition',
      aliases: ['Cognition AI', 'Cognition Labs', 'Devin'],
      is_target: false,
      is_customer: false,
      tier: 1,
      industry: 'AI software engineering',
      employee_band: '201-500',
    },
    {
      collector: COLLECTOR,
      id: 'company:sei-investments',
      type: 'company',
      name: 'SEI Investments',
      aliases: ['SEI Investments Company', 'SEIC'],
      is_target: true,
      is_customer: false,
      tier: 1,
      industry: 'Asset management technology',
      employee_band: '5001-10000',
    },
    {
      collector: COLLECTOR,
      id: 'company:apollo-global',
      type: 'company',
      name: 'Apollo Global Management',
      aliases: ['Apollo', 'APO'],
      is_target: true,
      is_customer: false,
      tier: 1,
      industry: 'Alternative asset management',
      employee_band: '5001-10000',
    },
    {
      collector: COLLECTOR,
      id: 'company:cantor-fitzgerald',
      type: 'company',
      name: 'Cantor Fitzgerald',
      aliases: ['Cantor Fitzgerald, L.P.', 'Cantor'],
      is_target: true,
      is_customer: false,
      tier: 1,
      industry: 'Investment banking',
      employee_band: '5001-10000',
    },
    {
      collector: COLLECTOR,
      id: 'company:oppenheimer-holdings',
      type: 'company',
      name: 'Oppenheimer Holdings',
      aliases: ['Oppenheimer', 'OPY', 'Oppenheimer & Co.'],
      is_target: true,
      is_customer: false,
      tier: 1,
      industry: 'Investment banking',
      employee_band: '1001-5000',
    },
    {
      collector: COLLECTOR,
      id: 'company:bgc-group',
      type: 'company',
      name: 'BGC Group',
      aliases: ['BGC', 'BGC Partners'],
      is_target: false,
      is_customer: false,
      tier: 2,
      industry: 'Financial brokerage and fintech',
      employee_band: '5001-10000',
    },
    {
      collector: COLLECTOR,
      id: 'company:goldman-sachs',
      type: 'company',
      name: 'Goldman Sachs',
      aliases: ['The Goldman Sachs Group, Inc.', 'GS'],
      is_target: false,
      is_customer: true,
      tier: 1,
      industry: 'Investment banking',
      employee_band: '10000+',
    },
    {
      collector: COLLECTOR,
      id: 'company:citi',
      type: 'company',
      name: 'Citi',
      aliases: ['Citigroup', 'Citibank'],
      is_target: false,
      is_customer: true,
      tier: 1,
      industry: 'Banking',
      employee_band: '10000+',
    },
    {
      collector: COLLECTOR,
      id: 'company:santander',
      type: 'company',
      name: 'Santander',
      aliases: ['Banco Santander'],
      is_target: false,
      is_customer: true,
      tier: 1,
      industry: 'Banking',
      employee_band: '10000+',
    },
    {
      collector: COLLECTOR,
      id: 'fund:founders-fund',
      type: 'fund',
      name: 'Founders Fund',
      aliases: ["Peter Thiel's Founders Fund"],
    },
    {
      collector: COLLECTOR,
      id: 'fund:8vc',
      type: 'fund',
      name: '8VC',
      aliases: ['EightVC'],
    },
    {
      collector: COLLECTOR,
      id: 'fund:lux-capital',
      type: 'fund',
      name: 'Lux Capital',
      aliases: [],
    },
    {
      collector: COLLECTOR,
      id: 'fund:general-catalyst',
      type: 'fund',
      name: 'General Catalyst',
      aliases: [],
    },
    {
      collector: COLLECTOR,
      id: 'fund:bain-capital-ventures',
      type: 'fund',
      name: 'Bain Capital Ventures',
      aliases: ['BCV'],
    },
    {
      collector: COLLECTOR,
      id: 'fund:ribbbit-capital',
      type: 'fund',
      name: 'Ribbit Capital',
      aliases: ['Ribbit'],
    },
    person({
      id: 'person:scott-wu',
      name: 'Scott Wu',
      public_role: 'Co-founder and CEO, Cognition',
      current_org_id: 'company:cognition',
      is_connector: true,
      intro_budget_quarterly: 6,
      intros_used_this_quarter: 1,
    }),
    person({
      id: 'person:steven-hao',
      name: 'Steven Hao',
      public_role: 'Co-founder and CTO, Cognition',
      current_org_id: 'company:cognition',
      is_connector: true,
      intro_budget_quarterly: 4,
      intros_used_this_quarter: 0,
    }),
    person({
      id: 'person:walden-yan',
      name: 'Walden Yan',
      public_role: 'Co-founder and CPO, Cognition',
      current_org_id: 'company:cognition',
      is_connector: true,
      intro_budget_quarterly: 4,
      intros_used_this_quarter: 0,
    }),
    person({
      id: 'person:ryan-hicke',
      name: 'Ryan Hicke',
      public_role: 'Chief Executive Officer, SEI Investments (former CIO)',
      current_org_id: 'company:sei-investments',
      is_connector: false,
      intro_budget_quarterly: 0,
      intros_used_this_quarter: 0,
    }),
    person({
      id: 'person:marc-rowan',
      name: 'Marc Rowan',
      public_role: 'Co-founder, CEO and Chair, Apollo Global Management',
      current_org_id: 'company:apollo-global',
      is_connector: false,
      intro_budget_quarterly: 0,
      intros_used_this_quarter: 0,
    }),
    person({
      id: 'person:gary-cohn',
      name: 'Gary Cohn',
      public_role: 'Lead Independent Director, Apollo Global Management; former President & COO, Goldman Sachs',
      current_org_id: 'company:apollo-global',
      is_connector: false,
      intro_budget_quarterly: 0,
      intros_used_this_quarter: 0,
    }),
    person({
      id: 'person:james-zelter',
      name: 'James Zelter',
      public_role: 'President and Director, Apollo Global Management',
      current_org_id: 'company:apollo-global',
      is_connector: false,
      intro_budget_quarterly: 0,
      intros_used_this_quarter: 0,
    }),
    person({
      id: 'person:robert-lowenthal',
      name: 'Robert S. Lowenthal',
      public_role: 'Chairman and CEO, Oppenheimer Holdings',
      current_org_id: 'company:oppenheimer-holdings',
      is_connector: false,
      intro_budget_quarterly: 0,
      intros_used_this_quarter: 0,
    }),
    person({
      id: 'person:brandon-lutnick',
      name: 'Brandon Lutnick',
      public_role: 'Chairman and CEO, Cantor Fitzgerald, L.P.; Director, BGC Group',
      current_org_id: 'company:cantor-fitzgerald',
      is_connector: false,
      intro_budget_quarterly: 0,
      intros_used_this_quarter: 0,
    }),
  ]

  const edges: CollectedEdge[] = [
    // Cognition leadership
    edge({
      id: 'edge:wu-cognition-ceo',
      from: 'person:scott-wu',
      to: 'company:cognition',
      type: 'exec_employment',
      start_date: '2023-11',
      end_date: null,
      source_url: 'https://en.wikipedia.org/wiki/Cognition_AI',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: 'Wikipedia lists Scott Wu as co-founder and CEO of Cognition AI.',
    }),
    edge({
      id: 'edge:hao-cognition-cto',
      from: 'person:steven-hao',
      to: 'company:cognition',
      type: 'exec_employment',
      start_date: '2023-11',
      end_date: null,
      source_url: 'https://en.wikipedia.org/wiki/Cognition_AI',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: 'Wikipedia lists Steven Hao as co-founder and CTO of Cognition AI.',
    }),
    edge({
      id: 'edge:yan-cognition-cpo',
      from: 'person:walden-yan',
      to: 'company:cognition',
      type: 'exec_employment',
      start_date: '2023-11',
      end_date: null,
      source_url: 'https://en.wikipedia.org/wiki/Cognition_AI',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: 'Wikipedia lists Walden Yan as co-founder and CPO of Cognition AI.',
    }),

    // Cognition investors (company About + Series D post)
    invest('edge:founders-fund-cognition', 'fund:founders-fund', '2024-01', 'Founders Fund named as Cognition investor on cognition.ai/about.'),
    invest('edge:lux-cognition', 'fund:lux-capital', '2024-01', 'Lux Capital named as Cognition investor on cognition.ai/about.'),
    invest('edge:8vc-cognition', 'fund:8vc', '2025-03', '8VC named as Cognition investor on cognition.ai/about and Series D post.'),
    invest('edge:bcv-cognition', 'fund:bain-capital-ventures', '2024-01', 'Bain Capital Ventures named as Cognition investor on cognition.ai/about.'),
    invest('edge:gc-cognition', 'fund:general-catalyst', '2026-05', 'General Catalyst named as Series D co-lead on cognition.ai/blog/series-d.'),
    invest('edge:ribbbit-cognition', 'fund:ribbbit-capital', '2026-05', 'Ribbit Capital named as new Series D investor on cognition.ai/blog/series-d.'),

    // FinServ customers named by Cognition
    customer('edge:goldman-cognition-customer', 'company:goldman-sachs'),
    customer('edge:citi-cognition-customer', 'company:citi'),
    customer('edge:santander-cognition-customer', 'company:santander'),

    // SEI leadership from DEF 14A
    edge({
      id: 'edge:hicke-sei-ceo',
      from: 'person:ryan-hicke',
      to: 'company:sei-investments',
      type: 'exec_employment',
      start_date: '2022-06',
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/350894/000035089426000021/seic-20260414.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes:
        'SEI 2026 DEF 14A describes Ryan Hicke as CEO and notes prior service as Chief Information Officer.',
    }),

    // Apollo leadership + Cohn bridge from DEF 14A
    edge({
      id: 'edge:rowan-apollo-ceo',
      from: 'person:marc-rowan',
      to: 'company:apollo-global',
      type: 'exec_employment',
      start_date: '2021-01',
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/1858681/000119312526177321/d948913ddef14a.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: 'Apollo 2026 DEF 14A lists Marc Rowan as Co-Founder, CEO and Chair of AGM.',
    }),
    edge({
      id: 'edge:rowan-apollo-board',
      from: 'person:marc-rowan',
      to: 'company:apollo-global',
      type: 'board_seat',
      start_date: '2021-01',
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/1858681/000119312526177321/d948913ddef14a.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: 'Apollo 2026 DEF 14A lists Marc Rowan as Chair of the board of directors.',
    }),
    edge({
      id: 'edge:cohn-apollo-board',
      from: 'person:gary-cohn',
      to: 'company:apollo-global',
      type: 'board_seat',
      start_date: null,
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/1858681/000119312526177321/d948913ddef14a.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: 'Apollo 2026 DEF 14A lists Gary Cohn as Lead Independent Director.',
    }),
    edge({
      id: 'edge:zelter-apollo-president',
      from: 'person:james-zelter',
      to: 'company:apollo-global',
      type: 'exec_employment',
      start_date: null,
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/1858681/000119312526177321/d948913ddef14a.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: 'Apollo 2026 DEF 14A lists James Zelter as President and Director.',
    }),
    edge({
      id: 'edge:cohn-goldman-exec',
      from: 'person:gary-cohn',
      to: 'company:goldman-sachs',
      type: 'exec_employment',
      start_date: '2006-01',
      end_date: '2016-12',
      source_url:
        'https://www.sec.gov/Archives/edgar/data/1858681/000119312526177321/d948913ddef14a.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes:
        'Apollo 2026 DEF 14A states Cohn was President and COO of Goldman Sachs from 2006 to 2016 (alumni bridge into Apollo).',
    }),

    // Oppenheimer leadership from DEF 14A / company disclosures mirrored in Wikipedia + proxy
    edge({
      id: 'edge:lowenthal-opy-ceo',
      from: 'person:robert-lowenthal',
      to: 'company:oppenheimer-holdings',
      type: 'exec_employment',
      start_date: '2025-05',
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/791963/000110465926027365/tm261410-3_def14a.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes:
        'Oppenheimer 2026 DEF 14A covers Robert S. Lowenthal as director/executive leadership following the 2025 CEO transition.',
    }),

    // Cantor × BGC from BGC DEF 14A (Cantor is private; BGC filing states Brandon Lutnick roles)
    edge({
      id: 'edge:lutnick-cantor-ceo',
      from: 'person:brandon-lutnick',
      to: 'company:cantor-fitzgerald',
      type: 'exec_employment',
      start_date: '2025-02',
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/1094831/000121390025093426/ea0258456-01.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes:
        'BGC Group 2025 DEF 14A states Brandon Lutnick is Chief Executive Officer and Chairman of Cantor Fitzgerald, L.P.',
    }),
    edge({
      id: 'edge:lutnick-bgc-board',
      from: 'person:brandon-lutnick',
      to: 'company:bgc-group',
      type: 'board_seat',
      start_date: '2025-02',
      end_date: null,
      source_url:
        'https://www.sec.gov/Archives/edgar/data/1094831/000121390025093426/ea0258456-01.htm',
      source_accessed: accessedOn,
      confidence: 'high',
      notes:
        'BGC Group 2025 DEF 14A identifies Brandon Lutnick among directors/control persons tied to Cantor Fitzgerald.',
    }),
  ]

  const dropped = [
    'No public sourced edge found linking Founders Fund / 8VC / Lux / Ribbit / BCV portfolio pages directly to SEI, Apollo, Cantor, or Oppenheimer leadership — not invented.',
    'Cantor Fitzgerald corporate site blocked automated fetch; used BGC Group DEF 14A statements about Cantor roles instead.',
    'Did not add email/phone enrichment or LinkedIn alumni edges.',
    'Did not treat Bain Capital private-equity deals as Bain Capital Ventures edges without a primary source.',
    'Mercedes-Benz / Itaú / federal customers named by Cognition were omitted to keep the demo graph FinServ-East focused.',
  ]

  return { collector: COLLECTOR, nodes, edges, dropped }

  function person(
    input: Omit<Extract<CollectedNode, { type: 'person' }>, 'collector' | 'type' | 'aliases'> & {
      aliases?: string[]
    },
  ): CollectedNode {
    return {
      collector: COLLECTOR,
      type: 'person',
      ...input,
      aliases: input.aliases ?? [],
    }
  }

  function edge(input: Omit<CollectedEdge, 'collector'>): CollectedEdge {
    return { collector: COLLECTOR, ...input }
  }

  function invest(id: string, fundId: `fund:${string}`, start: string, notes: string): CollectedEdge {
    return edge({
      id,
      from: fundId,
      to: 'company:cognition',
      type: 'investor_portfolio',
      start_date: start,
      end_date: null,
      source_url: notes.includes('Series D')
        ? 'https://cognition.ai/blog/series-d'
        : 'https://cognition.ai/about',
      source_accessed: accessedOn,
      confidence: 'high',
      notes,
    })
  }

  function customer(id: string, fromId: `company:${string}`): CollectedEdge {
    return edge({
      id,
      from: fromId,
      to: 'company:cognition',
      type: 'customer_reference',
      start_date: null,
      end_date: null,
      source_url: 'https://cognition.ai/blog/series-d',
      source_accessed: accessedOn,
      confidence: 'high',
      notes: `${fromId} is named as a Cognition / Devin customer on the Series D announcement.`,
    })
  }
}

export const curatedCognitionFinservCollector: Collector = {
  id: 'curated',
  collect: (_targets, ctx) => buildCognitionFinservFragment(ctx.accessedOn),
}
