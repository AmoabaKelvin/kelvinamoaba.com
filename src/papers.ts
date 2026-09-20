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
    venue: 'Computing Conference, Springer LNNS',
    year: 2026,
    arxivId: '2509.14448',
    link: 'https://link.springer.com/chapter/10.1007/978-3-032-24804-6_10',
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
      'A framework for predicting rare, high-impact outcomes from limited, noisy early-stage data. LLMs turn unstructured founder profiles into 63 trainable features (skill relevance, domain expertise, education level, text embeddings); a layered ensemble of XGBoost, Random Forest, and a Linear Regression meta-model predicts total funding, which a thresholded logistic regression maps to a binary success call. On 10,825 founders with an 8.5% success rate, the pipeline reaches 9.8x-11.1x the random-baseline precision across three held-out subsets at 36% recall, with funding MAPE under 4%. Ablations show LLM-derived features matter most: removing them drops precision from 10.4x to 4.6x. Feature sensitivity puts the startup category list (15.6%) and number of founders as the strongest drivers.',
    tags: ['Machine Learning', 'LLM', 'Venture Capital', 'Feature Engineering'],
  },
];
