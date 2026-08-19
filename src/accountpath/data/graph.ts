import type { AccountGraph, EdgeType, GraphEdge, GraphNode, Segment } from '../types'

/**
 * Seed dataset: Cognition mapping into 50 New York City financial services and
 * fintech accounts. Swap this file (keeping the exports) to re-point the app at a
 * different company and account list.
 *
 * Sources used for "verified" edges:
 */
const SERIES_D = 'https://cognition.com/blog/series-d'
const LONDON = 'https://cognition.com/blog/cognition-london'
const CHENAULT = 'https://www.generalcatalyst.com/team/ken-chenault'
const CONVERSION = 'https://conversioncapital.com/people/'
const RAMP_SERIES_F =
  'https://www.prnewswire.com/news-releases/ramp-raises-series-f-at-44-billion-valuation-302791103.html'
const BILT_2025 =
  'https://newsroom.biltrewards.com/bilt-raises-250-million-at-over-10-billion-valuation'
const LEMONADE_SERIES_B =
  'https://www.prnewswire.com/news-releases/lemonade-closes-34-million-round-and-is-poised-for-growth-as-company-files-in-california-604773836.html'
const JUSTWORKS_SERIES_B =
  'https://www.justworks.com/blog/justworks-raises-its-series-b-from-bain-capital-ventures-thrive-capital-and-index-ventures'
const PAXOS_SERIES_D =
  'https://www.paxos.com/newsroom/paxos-adds-bank-of-america-coinbase-ventures-founders-fund-ftx-to-series-d-funding-round'
const CHAINALYSIS_SERIES_D = 'https://www.chainalysis.com/blog/series-d-announcement/'
const GC_CIRCLE = 'https://www.generalcatalyst.com/companies/circle'
const CIRCLE_2015 =
  'https://www.circle.com/blog/new-circle-investors-new-us-dollar-account-features-china-horizons'

const NYC = 'New York, NY'

type NodeInit = Omit<GraphNode, 'type'>

const person = (init: NodeInit): GraphNode => ({ ...init, type: 'person' })
const firm = (init: NodeInit): GraphNode => ({ segment: 'investor', ...init, type: 'firm' })
const company = (init: NodeInit): GraphNode => ({ ...init, type: 'company' })

const account = (
  id: string,
  name: string,
  segment: Segment,
  isExistingCustomer = false,
): GraphNode =>
  company({ id, name, segment, hq: NYC, isTargetAccount: true, isExistingCustomer })

type EdgeInit = {
  id: string
  source: string
  target: string
  type: EdgeType
  startDate?: string
  endDate?: string
}

/** An edge backed by a public source URL. */
const verified = (init: EdgeInit, sourceUrl: string, note?: string): GraphEdge => ({
  ...init,
  current: init.endDate === undefined,
  confidence: 'verified',
  sourceUrl,
  note,
})

/** An edge asserted by the seed brief with no citable public URL attached. */
const inferred = (init: EdgeInit, note: string): GraphEdge => ({
  ...init,
  current: init.endDate === undefined,
  confidence: 'inferred',
  note,
})

const BRIEF_ONLY = 'Stated in the seed brief; no public source URL attached, so left inferred.'

const cognitionNode = company({
  id: 'cognition',
  name: 'Cognition',
  segment: 'vendor',
  hq: 'San Francisco, CA',
  notes:
    'AI lab behind Devin. Founded Aug 2023. Offices in SF, NYC, London, Singapore, Tokyo. ~350 people. $492M run-rate revenue at the May 2026 Series D.',
})

const internalPeople: GraphNode[] = [
  person({ id: 'scott-wu', name: 'Scott Wu', segment: 'internal', role: 'CEO and co-founder' }),
  person({ id: 'steven-hao', name: 'Steven Hao', segment: 'internal', role: 'CTO and co-founder' }),
  person({ id: 'walden-yan', name: 'Walden Yan', segment: 'internal', role: 'CPO and co-founder' }),
  person({ id: 'russell-kaplan', name: 'Russell Kaplan', segment: 'internal', role: 'President' }),
  person({
    id: 'jeff-wang',
    name: 'Jeff Wang',
    segment: 'internal',
    role: 'Head of Windsurf / Devin Desktop division',
  }),
  person({
    id: 'theodor-marcu',
    name: 'Theodor Marcu',
    segment: 'internal',
    role: 'Head of Product Growth',
  }),
  person({
    id: 'takumi-masai',
    name: 'Takumi Masai',
    segment: 'internal',
    role: 'President and GM, Japan',
    hq: 'Tokyo, Japan',
  }),
  person({
    id: 'richard-spence',
    name: 'Richard Spence',
    segment: 'internal',
    role: 'VP and GM, APAC',
    hq: 'Singapore',
  }),
  person({
    id: 'christian-lawless',
    name: 'Christian Lawless',
    segment: 'internal',
    role: 'Managing Director, Cognition; founder and General Partner, Conversion Capital',
    notes: 'Forbes 2026 Midas List #95. Prior sell-side MD roles at Lehman Brothers, Nomura, Barclays.',
  }),
  person({ id: 'emily-cohen', name: 'Emily Cohen', segment: 'internal', role: 'Cognition (since Sep 2025)' }),
]

const investorFirms: GraphNode[] = [
  firm({ id: 'founders-fund', name: 'Founders Fund' }),
  firm({ id: '8vc', name: '8VC' }),
  firm({ id: 'lux-capital', name: 'Lux Capital', hq: NYC, notes: '~$7B AUM.' }),
  firm({ id: 'general-catalyst', name: 'General Catalyst' }),
  firm({ id: 'khosla-ventures', name: 'Khosla Ventures' }),
  firm({ id: 'conviction', name: 'Conviction' }),
  firm({ id: 'neo', name: 'Neo' }),
  firm({ id: 'ribbit-capital', name: 'Ribbit Capital' }),
  firm({ id: 'atreides', name: 'Atreides Management' }),
  firm({ id: 'layer-global', name: 'Layer Global' }),
  firm({ id: 'bain-capital-ventures', name: 'Bain Capital Ventures' }),
  firm({ id: 'pear-vc', name: 'Pear VC' }),
  firm({ id: 'conversion-capital', name: 'Conversion Capital' }),
]

const investorPeople: GraphNode[] = [
  person({ id: 'elad-gil', name: 'Elad Gil', segment: 'investor', role: 'Angel investor' }),
  person({
    id: 'ken-chenault',
    name: 'Kenneth I. Chenault',
    segment: 'investor',
    role: 'Chairman and Managing Director, General Catalyst',
  }),
  person({ id: 'joe-lonsdale', name: 'Joe Lonsdale', segment: 'investor', role: 'Founder, 8VC' }),
  person({ id: 'josh-wolfe', name: 'Josh Wolfe', segment: 'investor', role: 'Co-founder, Lux Capital' }),
  person({ id: 'peter-hebert', name: 'Peter Hébert', segment: 'investor', role: 'Co-founder, Lux Capital' }),
  person({ id: 'micky-malka', name: 'Micky Malka', segment: 'investor', role: 'Founder, Ribbit Capital' }),
  person({
    id: 'brian-singerman',
    name: 'Brian Singerman',
    segment: 'investor',
    role: 'Partner emeritus, Founders Fund',
  }),
]

const targetAccounts: GraphNode[] = [
  account('jpmorgan-chase', 'JPMorgan Chase', 'money-center-bank'),
  account('goldman-sachs', 'Goldman Sachs', 'money-center-bank', true),
  account('citigroup', 'Citigroup', 'money-center-bank', true),
  account('morgan-stanley', 'Morgan Stanley', 'money-center-bank'),
  account('american-express', 'American Express', 'money-center-bank'),
  account('bny', 'BNY', 'money-center-bank', true),
  account('jefferies', 'Jefferies', 'money-center-bank'),
  account('cantor-fitzgerald', 'Cantor Fitzgerald', 'money-center-bank'),
  account('blackrock', 'BlackRock', 'asset-management'),
  account('blackstone', 'Blackstone', 'asset-management'),
  account('kkr', 'KKR', 'asset-management'),
  account('apollo-global', 'Apollo Global Management', 'asset-management'),
  account('blue-owl', 'Blue Owl Capital', 'asset-management'),
  account('neuberger-berman', 'Neuberger Berman', 'asset-management'),
  account('tiaa', 'TIAA', 'asset-management'),
  account('two-sigma', 'Two Sigma', 'asset-management'),
  account('millennium-management', 'Millennium Management', 'asset-management'),
  account('de-shaw', 'D. E. Shaw & Co.', 'asset-management'),
  account('jane-street', 'Jane Street', 'trading'),
  account('hudson-river-trading', 'Hudson River Trading', 'trading'),
  account('virtu-financial', 'Virtu Financial', 'trading'),
  account('tower-research', 'Tower Research Capital', 'trading'),
  account('schonfeld', 'Schonfeld Strategic Advisors', 'trading'),
  account('nasdaq', 'Nasdaq', 'market-infrastructure'),
  account('sp-global', 'S&P Global', 'market-infrastructure'),
  account('moodys', "Moody's", 'market-infrastructure'),
  account('msci', 'MSCI', 'market-infrastructure'),
  account('bloomberg-lp', 'Bloomberg L.P.', 'market-infrastructure'),
  account('tradeweb', 'Tradeweb Markets', 'market-infrastructure'),
  account('marketaxess', 'MarketAxess', 'market-infrastructure'),
  account('metlife', 'MetLife', 'insurance'),
  account('new-york-life', 'New York Life', 'insurance'),
  account('aig', 'AIG', 'insurance'),
  account('guardian-life', 'Guardian Life', 'insurance'),
  account('equitable-holdings', 'Equitable Holdings', 'insurance'),
  account('marsh-mclennan', 'Marsh McLennan', 'insurance'),
  account('lemonade', 'Lemonade', 'insurance'),
  account('ramp', 'Ramp', 'fintech', true),
  account('kalshi', 'Kalshi', 'fintech'),
  account('icapital', 'iCapital', 'fintech'),
  account('payoneer', 'Payoneer', 'fintech'),
  account('betterment', 'Betterment', 'fintech'),
  account('justworks', 'Justworks', 'fintech'),
  account('bilt-rewards', 'Bilt Rewards', 'fintech'),
  account('circle', 'Circle', 'crypto'),
  account('galaxy-digital', 'Galaxy Digital', 'crypto'),
  account('chainalysis', 'Chainalysis', 'crypto'),
  account('fireblocks', 'Fireblocks', 'crypto'),
  account('paxos', 'Paxos', 'crypto'),
  account('gemini', 'Gemini', 'crypto'),
]

const otherCompanies: GraphNode[] = [
  company({ id: 'santander', name: 'Santander', segment: 'money-center-bank', hq: 'Madrid, Spain' }),
  company({ id: 'itau', name: 'Itaú Unibanco', segment: 'money-center-bank', hq: 'São Paulo, Brazil' }),
  company({ id: 'nubank', name: 'Nubank', segment: 'fintech', hq: 'São Paulo, Brazil' }),
  company({ id: 'mizuho-securities', name: 'Mizuho Securities', segment: 'money-center-bank', hq: 'Tokyo, Japan' }),
  company({ id: 'ocbc', name: 'OCBC', segment: 'money-center-bank', hq: 'Singapore' }),
  company({ id: 'mercadolibre', name: 'MercadoLibre', segment: 'fintech', hq: 'Buenos Aires, Argentina' }),
  company({ id: 'palantir', name: 'Palantir Technologies', segment: 'vendor' }),
  company({ id: 'dell', name: 'Dell Technologies', segment: 'vendor' }),
  company({ id: 'cisco', name: 'Cisco', segment: 'vendor' }),
  company({ id: 'mercedes-benz', name: 'Mercedes-Benz', segment: 'vendor', hq: 'Stuttgart, Germany' }),
  company({ id: 'elevance', name: 'Elevance Health', segment: 'insurance' }),
  company({ id: 'us-army', name: 'U.S. Army', segment: 'vendor' }),
  company({ id: 'us-navy', name: 'U.S. Navy', segment: 'vendor' }),
  company({ id: 'exa', name: 'Exa', segment: 'vendor' }),
  company({ id: 'modal', name: 'Modal', segment: 'vendor' }),
  company({ id: 'eight-sleep', name: 'Eight Sleep', segment: 'vendor' }),
  company({ id: 'openrouter', name: 'OpenRouter', segment: 'vendor' }),
  company({ id: 'infosys', name: 'Infosys', segment: 'vendor', hq: 'Bengaluru, India' }),
  company({ id: 'cognizant', name: 'Cognizant', segment: 'vendor' }),
  company({ id: 'ltm', name: 'LTM', segment: 'vendor' }),
  company({ id: 'robinhood', name: 'Robinhood', segment: 'fintech' }),
  company({ id: 'coinbase', name: 'Coinbase', segment: 'crypto' }),
  company({ id: 'figure', name: 'Figure', segment: 'fintech' }),
  company({ id: 'affirm', name: 'Affirm', segment: 'fintech' }),
  company({ id: 'credit-karma', name: 'Credit Karma', segment: 'fintech' }),
  company({ id: 'revolut', name: 'Revolut', segment: 'fintech', hq: 'London, UK' }),
  company({ id: 'brex', name: 'Brex', segment: 'fintech' }),
  company({ id: 'blend', name: 'Blend Labs', segment: 'fintech' }),
  company({ id: 'temporal', name: 'Temporal Technologies', segment: 'vendor' }),
  company({ id: 'addepar', name: 'Addepar', segment: 'fintech' }),
  company({ id: 'lunchclub', name: 'Lunchclub', segment: 'vendor' }),
  company({ id: 'scale-ai', name: 'Scale AI', segment: 'vendor' }),
  company({ id: 'anysphere', name: 'Anysphere', segment: 'vendor' }),
  company({ id: 'tesla', name: 'Tesla', segment: 'vendor' }),
  company({ id: 'windsurf', name: 'Windsurf', segment: 'vendor' }),
  company({ id: 'retool', name: 'Retool', segment: 'vendor' }),
  company({ id: 'datadog', name: 'Datadog', segment: 'vendor', hq: NYC }),
  company({ id: 'ibm', name: 'IBM', segment: 'vendor' }),
  company({ id: 'microsoft', name: 'Microsoft', segment: 'vendor' }),
  company({ id: 'workday', name: 'Workday', segment: 'vendor' }),
  company({ id: 'pivotal', name: 'Pivotal Software', segment: 'vendor' }),
  company({ id: 'lehman-brothers', name: 'Lehman Brothers', segment: 'money-center-bank', hq: NYC }),
  company({ id: 'nomura', name: 'Nomura', segment: 'money-center-bank', hq: 'Tokyo, Japan' }),
  company({ id: 'barclays', name: 'Barclays', segment: 'money-center-bank', hq: 'London, UK' }),
  company({ id: 'berkshire-hathaway', name: 'Berkshire Hathaway', segment: 'insurance' }),
  company({ id: 'airbnb', name: 'Airbnb', segment: 'vendor' }),
  company({ id: 'harvard-corporation', name: 'Harvard Corporation' }),
  company({ id: 'janus-henderson', name: 'Janus Henderson', segment: 'asset-management' }),
]

const nodes: GraphNode[] = [
  cognitionNode,
  ...internalPeople,
  ...investorFirms,
  ...investorPeople,
  ...targetAccounts,
  ...otherCompanies,
]

const internalEmploymentEdges: GraphEdge[] = [
  inferred({ id: 'e-scott-wu-cognition', source: 'scott-wu', target: 'cognition', type: 'founded', startDate: '2023-08' }, BRIEF_ONLY),
  inferred({ id: 'e-scott-wu-cognition-emp', source: 'scott-wu', target: 'cognition', type: 'employed_at', startDate: '2023-08' }, BRIEF_ONLY),
  inferred({ id: 'e-scott-wu-addepar', source: 'scott-wu', target: 'addepar', type: 'employed_at', endDate: '2017' }, `Software engineer. ${BRIEF_ONLY}`),
  inferred({ id: 'e-scott-wu-lunchclub', source: 'scott-wu', target: 'lunchclub', type: 'founded', startDate: '2017', endDate: '2022' }, `CTO. ${BRIEF_ONLY}`),
  inferred({ id: 'e-steven-hao-cognition', source: 'steven-hao', target: 'cognition', type: 'founded', startDate: '2023-08' }, BRIEF_ONLY),
  inferred({ id: 'e-steven-hao-cognition-emp', source: 'steven-hao', target: 'cognition', type: 'employed_at', startDate: '2023-08' }, BRIEF_ONLY),
  inferred({ id: 'e-steven-hao-scale', source: 'steven-hao', target: 'scale-ai', type: 'employed_at', startDate: '2018', endDate: '2023' }, `Core engineer. ${BRIEF_ONLY}`),
  inferred({ id: 'e-walden-yan-cognition', source: 'walden-yan', target: 'cognition', type: 'founded', startDate: '2023-08' }, BRIEF_ONLY),
  inferred({ id: 'e-walden-yan-cognition-emp', source: 'walden-yan', target: 'cognition', type: 'employed_at', startDate: '2023-08' }, BRIEF_ONLY),
  inferred({ id: 'e-walden-yan-anysphere', source: 'walden-yan', target: 'anysphere', type: 'employed_at', endDate: '2023' }, BRIEF_ONLY),
  inferred({ id: 'e-russell-kaplan-cognition', source: 'russell-kaplan', target: 'cognition', type: 'employed_at', startDate: '2024-05' }, `President. ${BRIEF_ONLY}`),
  inferred({ id: 'e-russell-kaplan-scale', source: 'russell-kaplan', target: 'scale-ai', type: 'employed_at', endDate: '2024-05' }, `Led ML and ML infra. ${BRIEF_ONLY}`),
  inferred({ id: 'e-russell-kaplan-tesla', source: 'russell-kaplan', target: 'tesla', type: 'employed_at', endDate: '2020' }, `Autopilot. ${BRIEF_ONLY}`),
  inferred({ id: 'e-jeff-wang-cognition', source: 'jeff-wang', target: 'cognition', type: 'employed_at', startDate: '2025-07' }, `Leads the Windsurf / Devin Desktop division. ${BRIEF_ONLY}`),
  inferred({ id: 'e-jeff-wang-windsurf', source: 'jeff-wang', target: 'windsurf', type: 'employed_at', endDate: '2025-07' }, `Interim CEO. ${BRIEF_ONLY}`),
  inferred({ id: 'e-theodor-marcu-cognition', source: 'theodor-marcu', target: 'cognition', type: 'employed_at', startDate: '2025-06' }, `Head of Product Growth. ${BRIEF_ONLY}`),
  inferred({ id: 'e-theodor-marcu-retool', source: 'theodor-marcu', target: 'retool', type: 'employed_at', endDate: '2025-06' }, BRIEF_ONLY),
  inferred({ id: 'e-takumi-masai-cognition', source: 'takumi-masai', target: 'cognition', type: 'employed_at', startDate: '2026-04' }, `President and GM Japan. ${BRIEF_ONLY}`),
  inferred({ id: 'e-takumi-masai-datadog', source: 'takumi-masai', target: 'datadog', type: 'employed_at', endDate: '2026-04' }, `President, Datadog Japan. ${BRIEF_ONLY}`),
  inferred({ id: 'e-takumi-masai-ibm', source: 'takumi-masai', target: 'ibm', type: 'employed_at', endDate: '2020' }, BRIEF_ONLY),
  inferred({ id: 'e-takumi-masai-microsoft', source: 'takumi-masai', target: 'microsoft', type: 'employed_at', endDate: '2015' }, BRIEF_ONLY),
  inferred({ id: 'e-takumi-masai-workday', source: 'takumi-masai', target: 'workday', type: 'employed_at', endDate: '2018' }, BRIEF_ONLY),
  inferred({ id: 'e-takumi-masai-pivotal', source: 'takumi-masai', target: 'pivotal', type: 'employed_at', endDate: '2019' }, BRIEF_ONLY),
  inferred({ id: 'e-richard-spence-cognition', source: 'richard-spence', target: 'cognition', type: 'employed_at', startDate: '2026-04' }, `VP and GM APAC, Singapore. ${BRIEF_ONLY}`),
  verified({ id: 'e-christian-lawless-cognition', source: 'christian-lawless', target: 'cognition', type: 'employed_at' }, CONVERSION, 'Managing Director at Cognition.'),
  verified({ id: 'e-christian-lawless-conversion', source: 'christian-lawless', target: 'conversion-capital', type: 'founded' }, CONVERSION, 'Founder and General Partner.'),
  inferred({ id: 'e-christian-lawless-lehman', source: 'christian-lawless', target: 'lehman-brothers', type: 'employed_at', endDate: '2008' }, 'Managing Director, sales and trading. Brief cites conversioncapital.com/people, which blocks non-browser clients, so prior sell-side roles are left inferred.'),
  inferred({ id: 'e-christian-lawless-nomura', source: 'christian-lawless', target: 'nomura', type: 'employed_at', endDate: '2012' }, 'Managing Director, sales and trading. Left inferred for the same reason as the Lehman Brothers edge.'),
  inferred({ id: 'e-christian-lawless-barclays', source: 'christian-lawless', target: 'barclays', type: 'employed_at', endDate: '2015' }, 'Managing Director, sales and trading. Left inferred for the same reason as the Lehman Brothers edge.'),
  inferred({ id: 'e-emily-cohen-cognition', source: 'emily-cohen', target: 'cognition', type: 'employed_at', startDate: '2025-09' }, BRIEF_ONLY),
  inferred({ id: 'e-emily-cohen-neo', source: 'emily-cohen', target: 'neo', type: 'employed_at', endDate: '2025-09' }, `Partner. ${BRIEF_ONLY}`),
]

const NOT_IN_SERIES_D_POST =
  'Round detail per the seed brief. The Series D post confirms the investor relationship but does not document this round.'

const cognitionInvestorEdges: GraphEdge[] = [
  inferred({ id: 'e-ff-cognition-seed', source: 'founders-fund', target: 'cognition', type: 'led_round', startDate: '2024-03' }, `$21M seed. ${NOT_IN_SERIES_D_POST}`),
  inferred({ id: 'e-ff-cognition-a', source: 'founders-fund', target: 'cognition', type: 'led_round', startDate: '2024-04' }, `$175M Series A at $2B. ${NOT_IN_SERIES_D_POST}`),
  inferred({ id: 'e-ff-cognition-c', source: 'founders-fund', target: 'cognition', type: 'led_round', startDate: '2025-09' }, `$400M+ Series C at $10.2B. ${NOT_IN_SERIES_D_POST}`),
  verified({ id: 'e-ff-cognition', source: 'founders-fund', target: 'cognition', type: 'invested_in' }, SERIES_D, 'Listed as an existing investor in the Series D announcement.'),
  inferred({ id: 'e-8vc-cognition-b', source: '8vc', target: 'cognition', type: 'led_round', startDate: '2025-03' }, `Series B at $4B. ${NOT_IN_SERIES_D_POST}`),
  verified({ id: 'e-8vc-cognition-d', source: '8vc', target: 'cognition', type: 'led_round', startDate: '2026-05' }, SERIES_D, 'Co-led the $1B+ Series D at a $26B valuation.'),
  inferred({ id: 'e-lux-cognition-b', source: 'lux-capital', target: 'cognition', type: 'led_round', startDate: '2025-03' }, `Series B. ${NOT_IN_SERIES_D_POST}`),
  verified({ id: 'e-lux-cognition-d', source: 'lux-capital', target: 'cognition', type: 'led_round', startDate: '2026-05' }, SERIES_D, 'Co-led the $1B+ Series D at a $26B valuation.'),
  verified({ id: 'e-gc-cognition-d', source: 'general-catalyst', target: 'cognition', type: 'led_round', startDate: '2026-05' }, SERIES_D, 'Co-led the $1B+ Series D announced 27 May 2026.'),
  verified({ id: 'e-ribbit-cognition', source: 'ribbit-capital', target: 'cognition', type: 'invested_in', startDate: '2026-05' }, SERIES_D, 'Named as a new investor in the Series D.'),
  verified({ id: 'e-atreides-cognition', source: 'atreides', target: 'cognition', type: 'invested_in', startDate: '2026-05' }, SERIES_D, 'Named as a new investor in the Series D.'),
  verified({ id: 'e-layer-cognition', source: 'layer-global', target: 'cognition', type: 'invested_in', startDate: '2026-05' }, SERIES_D, 'Named as a new investor in the Series D.'),
  verified({ id: 'e-bcv-cognition', source: 'bain-capital-ventures', target: 'cognition', type: 'invested_in' }, SERIES_D, 'Listed as an existing investor in the Series D.'),
  verified({ id: 'e-conversion-cognition', source: 'conversion-capital', target: 'cognition', type: 'invested_in' }, SERIES_D, 'Listed as an existing investor in the Series D.'),
  verified({ id: 'e-elad-gil-cognition', source: 'elad-gil', target: 'cognition', type: 'invested_in' }, SERIES_D, 'Listed as an existing investor in the Series D.'),
  inferred({ id: 'e-khosla-cognition', source: 'khosla-ventures', target: 'cognition', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-conviction-cognition', source: 'conviction', target: 'cognition', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-neo-cognition', source: 'neo', target: 'cognition', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-pear-cognition', source: 'pear-vc', target: 'cognition', type: 'invested_in' }, BRIEF_ONLY),
]

const investorPeopleEdges: GraphEdge[] = [
  verified({ id: 'e-chenault-gc-chair', source: 'ken-chenault', target: 'general-catalyst', type: 'chairman_of', startDate: '2018' }, CHENAULT, 'Chairman and Managing Director since 2018.'),
  verified({ id: 'e-chenault-gc-emp', source: 'ken-chenault', target: 'general-catalyst', type: 'employed_at', startDate: '2018' }, CHENAULT, 'Chairman and Managing Director.'),
  verified({ id: 'e-chenault-amex', source: 'ken-chenault', target: 'american-express', type: 'employed_at', startDate: '1981', endDate: '2018' }, CHENAULT, 'Chairman and CEO 2001-2018; joined American Express in 1981.'),
  verified({ id: 'e-chenault-bilt', source: 'ken-chenault', target: 'bilt-rewards', type: 'chairman_of', startDate: '2024-01' }, CHENAULT, 'Board chair since Jan 2024.'),
  verified({ id: 'e-chenault-berkshire', source: 'ken-chenault', target: 'berkshire-hathaway', type: 'board_seat' }, CHENAULT),
  verified({ id: 'e-chenault-airbnb', source: 'ken-chenault', target: 'airbnb', type: 'board_seat' }, CHENAULT),
  verified({ id: 'e-chenault-harvard', source: 'ken-chenault', target: 'harvard-corporation', type: 'board_seat' }, CHENAULT),
  inferred({ id: 'e-lonsdale-8vc', source: 'joe-lonsdale', target: '8vc', type: 'founded' }, BRIEF_ONLY),
  inferred({ id: 'e-lonsdale-palantir', source: 'joe-lonsdale', target: 'palantir', type: 'founded', startDate: '2003' }, BRIEF_ONLY),
  inferred({ id: 'e-lonsdale-addepar', source: 'joe-lonsdale', target: 'addepar', type: 'founded', startDate: '2009' }, BRIEF_ONLY),
  inferred({ id: 'e-wolfe-lux', source: 'josh-wolfe', target: 'lux-capital', type: 'founded', startDate: '2000' }, BRIEF_ONLY),
  inferred({ id: 'e-hebert-lux', source: 'peter-hebert', target: 'lux-capital', type: 'founded', startDate: '2000' }, BRIEF_ONLY),
  inferred({ id: 'e-hebert-lehman', source: 'peter-hebert', target: 'lehman-brothers', type: 'employed_at', endDate: '2000' }, BRIEF_ONLY),
  inferred({ id: 'e-malka-ribbit', source: 'micky-malka', target: 'ribbit-capital', type: 'founded', startDate: '2012' }, BRIEF_ONLY),
  inferred({ id: 'e-malka-robinhood', source: 'micky-malka', target: 'robinhood', type: 'board_seat' }, BRIEF_ONLY),
  inferred({ id: 'e-malka-mercadolibre', source: 'micky-malka', target: 'mercadolibre', type: 'board_seat' }, BRIEF_ONLY),
  inferred({ id: 'e-singerman-ff', source: 'brian-singerman', target: 'founders-fund', type: 'employed_at', endDate: '2025' }, `Partner emeritus. ${BRIEF_ONLY}`),
  inferred({ id: 'e-singerman-cognition', source: 'brian-singerman', target: 'cognition', type: 'board_seat' }, 'Board association asserted in the seed brief and explicitly flagged there as inferred.'),
]

const customerEdges: GraphEdge[] = [
  verified({ id: 'e-citi-cognition', source: 'citigroup', target: 'cognition', type: 'customer_of' }, SERIES_D, 'Named customer. Brief adds: rollout across ~40,000 developers, CTO David Griffiths.'),
  verified({ id: 'e-gs-cognition', source: 'goldman-sachs', target: 'cognition', type: 'customer_of' }, SERIES_D, 'Named customer. Brief adds: ~12,000 developers, CTO Marco Argenti, 3-4x productivity claim.'),
  verified({ id: 'e-bny-cognition', source: 'bny', target: 'cognition', type: 'customer_of' }, LONDON, 'Named as a Cognition partner in the London office announcement.'),
  verified({ id: 'e-santander-cognition', source: 'santander', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-itau-cognition', source: 'itau', target: 'cognition', type: 'customer_of' }, SERIES_D, 'Fixes 70% of security vulnerabilities automatically with Devin.'),
  verified({ id: 'e-mercedes-cognition', source: 'mercedes-benz', target: 'cognition', type: 'customer_of' }, SERIES_D, 'Cut an eight-month legacy modernization project to eight days.'),
  verified({ id: 'e-elevance-cognition', source: 'elevance', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-dell-cognition', source: 'dell', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-usarmy-cognition', source: 'us-army', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-usnavy-cognition', source: 'us-navy', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-exa-cognition', source: 'exa', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-modal-cognition', source: 'modal', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-eightsleep-cognition', source: 'eight-sleep', target: 'cognition', type: 'customer_of' }, SERIES_D),
  verified({ id: 'e-openrouter-cognition', source: 'openrouter', target: 'cognition', type: 'customer_of' }, SERIES_D),
  inferred({ id: 'e-nubank-cognition', source: 'nubank', target: 'cognition', type: 'customer_of' }, BRIEF_ONLY),
  inferred({ id: 'e-mercadolibre-cognition', source: 'mercadolibre', target: 'cognition', type: 'customer_of' }, BRIEF_ONLY),
  inferred({ id: 'e-mizuho-cognition', source: 'mizuho-securities', target: 'cognition', type: 'customer_of' }, BRIEF_ONLY),
  inferred({ id: 'e-ocbc-cognition', source: 'ocbc', target: 'cognition', type: 'customer_of' }, BRIEF_ONLY),
  inferred({ id: 'e-ramp-cognition', source: 'ramp', target: 'cognition', type: 'customer_of' }, BRIEF_ONLY),
  inferred({ id: 'e-palantir-cognition', source: 'palantir', target: 'cognition', type: 'customer_of' }, BRIEF_ONLY),
  inferred({ id: 'e-cisco-cognition', source: 'cisco', target: 'cognition', type: 'customer_of' }, BRIEF_ONLY),
  verified({ id: 'e-infosys-cognition', source: 'infosys', target: 'cognition', type: 'partner_of' }, SERIES_D, 'Systems integrator that has embedded Devin into delivery.'),
  verified({ id: 'e-cognizant-cognition', source: 'cognizant', target: 'cognition', type: 'partner_of' }, SERIES_D, 'Systems integrator that has embedded Devin into delivery.'),
  inferred({ id: 'e-ltm-cognition', source: 'ltm', target: 'cognition', type: 'partner_of' }, BRIEF_ONLY),
]

const crossEdges: GraphEdge[] = [
  inferred({ id: 'e-ff-ramp', source: 'founders-fund', target: 'ramp', type: 'invested_in', startDate: '2020' }, `Series B. ${BRIEF_ONLY}`),
  inferred({ id: 'e-8vc-ramp', source: '8vc', target: 'ramp', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-khosla-ramp', source: 'khosla-ventures', target: 'ramp', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-gc-ramp', source: 'general-catalyst', target: 'ramp', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-conversion-ramp', source: 'conversion-capital', target: 'ramp', type: 'invested_in' }, BRIEF_ONLY),
  verified({ id: 'e-gs-ramp', source: 'goldman-sachs', target: 'ramp', type: 'invested_in', startDate: '2026-06' }, RAMP_SERIES_F, 'Series F at a $44B valuation, announced 4 Jun 2026.'),
  verified({ id: 'e-ms-ramp', source: 'morgan-stanley', target: 'ramp', type: 'invested_in', startDate: '2026-06' }, RAMP_SERIES_F, 'Via Morgan Stanley Investment Management, Series F.'),
  verified({ id: 'e-deshaw-ramp', source: 'de-shaw', target: 'ramp', type: 'invested_in', startDate: '2026-06' }, RAMP_SERIES_F, 'Series F.'),
  inferred({ id: 'e-neo-kalshi', source: 'neo', target: 'kalshi', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ms-kalshi', source: 'morgan-stanley', target: 'kalshi', type: 'invested_in', startDate: '2026-05' }, `Series F. ${BRIEF_ONLY}`),
  verified({ id: 'e-gc-bilt-2025', source: 'general-catalyst', target: 'bilt-rewards', type: 'led_round', startDate: '2025-07' }, BILT_2025, 'Led the $250M round at a $10.75B valuation.'),
  inferred({ id: 'e-gc-bilt-2024', source: 'general-catalyst', target: 'bilt-rewards', type: 'led_round', startDate: '2024-01' }, `$200M at $3.1B. ${BRIEF_ONLY}`),
  inferred({ id: 'e-conversion-blend', source: 'conversion-capital', target: 'blend', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-conversion-figure', source: 'conversion-capital', target: 'figure', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-conversion-temporal', source: 'conversion-capital', target: 'temporal', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-nubank', source: 'ribbit-capital', target: 'nubank', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-robinhood', source: 'ribbit-capital', target: 'robinhood', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-coinbase', source: 'ribbit-capital', target: 'coinbase', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-figure', source: 'ribbit-capital', target: 'figure', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-affirm', source: 'ribbit-capital', target: 'affirm', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-credit-karma', source: 'ribbit-capital', target: 'credit-karma', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-revolut', source: 'ribbit-capital', target: 'revolut', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-ribbit-brex', source: 'ribbit-capital', target: 'brex', type: 'invested_in' }, BRIEF_ONLY),
  inferred({ id: 'e-gc-janus', source: 'general-catalyst', target: 'janus-henderson', type: 'co_invested_with', startDate: '2026-03' }, 'General Catalyst co-bid for Janus Henderson with Trian in Mar 2026. Flagged inferred in the seed brief.'),
  verified({ id: 'e-gc-lemonade', source: 'general-catalyst', target: 'lemonade', type: 'led_round', startDate: '2016-12' }, LEMONADE_SERIES_B, 'Led the $34M Series B; Joel Cutler joined the board.'),
  verified({ id: 'e-bcv-justworks', source: 'bain-capital-ventures', target: 'justworks', type: 'led_round', startDate: '2015-05' }, JUSTWORKS_SERIES_B, 'Led the $13M Series B; Matt Harris joined the board.'),
  verified({ id: 'e-ff-paxos', source: 'founders-fund', target: 'paxos', type: 'invested_in', startDate: '2021-07' }, PAXOS_SERIES_D, 'Added as a strategic investor to the Series D.'),
  verified({ id: 'e-ribbit-chainalysis', source: 'ribbit-capital', target: 'chainalysis', type: 'invested_in', startDate: '2021-03' }, CHAINALYSIS_SERIES_D, 'Named as a previous investor participating in the Series D.'),
  verified({ id: 'e-gc-circle', source: 'general-catalyst', target: 'circle', type: 'invested_in', startDate: '2013' }, GC_CIRCLE, 'General Catalyst portfolio page: backed since 2013.'),
  verified({ id: 'e-gs-circle', source: 'goldman-sachs', target: 'circle', type: 'invested_in', startDate: '2015-04' }, CIRCLE_2015, 'Co-led Circle’s $50M strategic round with IDG Capital.'),
]

const edges: GraphEdge[] = [
  ...internalEmploymentEdges,
  ...cognitionInvestorEdges,
  ...investorPeopleEdges,
  ...customerEdges,
  ...crossEdges,
]

export const HOME_COMPANY_ID = 'cognition'

export const seedGraph: AccountGraph = { nodes, edges }
