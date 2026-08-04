export type Paper = {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  link: string;
  abstract: string;
  tags: string[];
  arxivId?: string;
  /** Set for first-party papers hosted on this site. */
  slug?: string;
  pdf?: string;
};

export const papers: Paper[] = [
  {
    title: "Source-Bounded Exact Recovery over Docker's Logs API",
    authors: ['Kelvin Amoaba'],
    venue: 'Preprint',
    year: 2026,
    arxivId: '2608.01564',
    slug: 'source-bounded-exact-recovery',
    link: '/research/source-bounded-exact-recovery',
    pdf: '/research/source-bounded-exact-recovery.pdf',
    abstract:
      'Defines source-bounded exactness — every retained, distinguishable Docker source record eventually appears exactly once in durable collector output — with a generation-aware multiset oracle that separates source truncation from collector omission. Across 120 collector-runs, a fixed LogDeck revision was exact in 60/60 trials while unmodified Grafana Alloy 1.18.0 was exact in 20/60, showing that lifecycle reacquisition, not a persisted read position alone, determines exact recovery within the retained-source horizon.',
    tags: ['Systems', 'Docker', 'Observability', 'Fault Tolerance'],
  },
  {
    title: 'CoFEE: Reasoning Control for LLM-Based Feature Discovery',
    authors: [
      'Maximilian Westermann',
      'Ben Griffin',
      'Aaron Ontoyin Yin',
      'Zakari Salifu',
      'Yagiz Ihlamur',
      'Kelvin Amoaba',
      'Joseph Ternasky',
      'Fuat Alican',
      'Yigit Ihlamur',
    ],
    venue: 'arXiv',
    year: 2026,
    arxivId: '2604.21584',
    link: 'https://arxiv.org/abs/2604.21584',
    abstract:
      'A framework for automating feature discovery from unstructured data using LLMs with cognitive constraints, inducing reasoning behaviors like backward chaining from outcomes and verification against data leakage criteria. Achieves 15.2% higher success rate, 29% fewer features generated, and 53.3% cost reduction over vanilla LLM approaches.',
    tags: ['Artificial Intelligence', 'LLM', 'Feature Discovery', 'Machine Learning'],
  },
  {
    title: 'VCBench: Benchmarking LLMs in Venture Capital',
    authors: [
      'Rick Chen',
      'Joseph Ternasky',
      'Afriyie Samuel Kwesi',
      'Ben Griffin',
      'Aaron Ontoyin Yin',
      'Zakari Salifu',
      'Kelvin Amoaba',
      'Xianling Mu',
      'Fuat Alican',
      'Yigit Ihlamur',
    ],
    venue: 'arXiv',
    year: 2025,
    arxivId: '2509.14448',
    link: 'https://arxiv.org/abs/2509.14448',
    abstract:
      'The first benchmark for predicting founder success in venture capital, providing 9,000 anonymized founder profiles. State-of-the-art LLMs like DeepSeek-V3 deliver over 6x baseline precision, with most models surpassing human benchmarks.',
    tags: ['Artificial Intelligence', 'LLM', 'Benchmark', 'Venture Capital'],
  },
  {
    title:
      'From Limited Data to Rare-event Prediction: LLM-powered Feature Engineering and Multi-model Learning in Venture Capital',
    authors: [
      'Mihir Kumar',
      'Aaron Ontoyin Yin',
      'Zakari Salifu',
      'Kelvin Amoaba',
      'Afriyie Kwesi Samuel',
      'Fuat Alican',
      'Yigit Ihlamur',
    ],
    venue: 'arXiv',
    year: 2025,
    arxivId: '2509.08140',
    link: 'https://arxiv.org/abs/2509.08140',
    abstract:
      'A framework for predicting rare, high-impact outcomes by integrating large language models with a multi-model machine learning architecture for venture capital decision-making.',
    tags: ['Machine Learning', 'LLM', 'Venture Capital', 'Feature Engineering'],
  },
];
