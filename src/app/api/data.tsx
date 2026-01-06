export const footerlabels: { label: string; herf: string }[] = [
  { label: "Terms", herf: "/developer-disclaimer" },
  { label: "Disclosures", herf: "/developer-disclaimer" },
  { label: "Disclaimer", herf: "/developer-disclaimer" },
  { label: "Documentation", herf: "/developer-disclaimer" },
];

export const perksData: {
  icon: string;
  label: string;
  title: string;
  text: string;
  space: string;
}[] = [
  {
    icon: "/images/perks/peak-icon-1.svg",
    label: "Get started in seconds",
    title: "Deposit USDT without friction",
    text: "Whether you are a beginner or an expert, onboard with zero paperwork delays and start selling USDT immediately.",
    space: "lg:mt-8",
  },
  {
    icon: "/images/perks/peak-icon-2.svg",
    label: "Boost your yields",
    title: "Lock in INR spreads",
    text: "Every transaction taps into deep INR liquidity so you can maximise returns while the platform hedges volatility for you.",
    space: "lg:mt-14",
  },
  {
    icon: "/images/perks/peak-icon-3.svg",
    label: "Access expert knowledge",
    title: "Trade with guidance",
    text: "Leverage our treasury desk, tutorials, and alerts to stay profitable regardless of how much capital you deploy onboard with zero paperwork delays + 24x7 support.",
    space: "lg:mt-4",
  },
];

export const timelineData: {
  icon: string;
  title: string;
  text: string;
  position: string;
}[] = [
  {
    icon: "/images/timeline/icon-planning.svg",
    title: "Deposit USDT",
    text: "Send USDT to your dedicated wallet address and see confirmations in real time inside the dashboard.",
    position: "md:top-0 md:left-0",
  },
  {
    icon: "/images/timeline/icon-refinement.svg",
    title: "Sell for INR",
    text: "Match with INR buyers instantly and convert USDT with locked spreads and transparent fees.",
    position: "md:top-0 md:right-0",
  },
  {
    icon: "/images/timeline/icon-prototype.svg",
    title: "Transfer to bank",
    text: "Push INR to your bank in minutes with automated compliance checks handled in the background.",
    position: "md:bottom-0 md:left-0",
  },
  {
    icon: "/images/timeline/icon-support.svg",
    title: "Withdraw USDT",
    text: "Need to move back on-chain? Initiate USDT withdrawals at any time with network-level monitoring.",
    position: "md:bottom-0 md:right-0",
  },
];

export const featureTiles: {
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    icon: "/images/chooseus/chooseus-icon-1.svg",
    title: "24/7 Support",
    description: "Got a problem? Just get in touch. Our customer service support team is available 24/7.",
  },
  {
    icon: "/images/chooseus/chooseus-icon-2.svg",
    title: "Transaction free",
    description: "Use a variety of payment methods to trade cryptocurrency, free, safe and fast.",
  },
  {
    icon: "/images/chooseus/chooseus-icon-3.svg",
    title: "Rich information",
    description: "Gather a wealth of information, let you know the industry dynamics in first time.",
  },
  {
    icon: "/images/work/icon-support.svg",
    title: "Reliable security",
    description: "Our sophisticated security measures protect your cryptocurrency from all risks.",
  },
];

export const upgradeData: { title: string }[] = [
  { title: "Bank-grade INR settlements" },
  { title: "Dedicated USDT treasury desk" },
  { title: "Regulatory-first compliance" },
  { title: "Realtime price-lock engine" },
  { title: "Automated P&L reporting" },
  { title: "Multi-network withdrawal support" },
  { title: "Enterprise-grade APIs" },
  { title: "Instant INR reconciliations" },
];

export const conversionPairs: {
  name: string;
  rate: number;
  settlement: string;
}[] = [
  {
    name: "Sell USDT → INR | Instant UPI",
    rate: 99,
    settlement: "Settled in under 5 minutes",
  },
  {
    name: "Sell USDT → INR | Same-day NEFT",
    rate: 98.7,
    settlement: "Guaranteed before banking cut-off",
  },
  {
    name: "Buy USDT ← INR | On-chain withdrawal",
    rate: 99.4,
    settlement: "USDT arrives on preferred network",
  },
];

export const platformPrice = {
  title: "Platform price",
  refreshInterval: 60,
  baseRate: 99,
  basePair: "1 USDT = ₹99",
  movement: "+0.45%",
};

export const pricingTiers: { range: string; markup: string }[] = [
  { range: ">=1000.01 and <2000.01", markup: "+ 0.25" },
  { range: ">=2000.01 and <3000.01", markup: "+ 0.50" },
  { range: ">=3000.01 and <5000.01", markup: "+ 1.00" },
  { range: ">=5000.01", markup: "+ 1.50" },
];

export const exchangeComparisons: {
  name: string;
  pillar: string;
  average: string;
  currency: string;
  pair: string;
  min: string;
  max: string;
  logo: string;
  logoAlt: string;
}[] = [
  {
    name: "WazirX",
    pillar: "Pillar 1",
    average: "92.16",
    currency: "₹",
    pair: "1 USDT = ₹92.16",
    min: "Min 92.10 ₹",
    max: "Max 92.32 ₹",
    logo: "/wazirx.png",
    logoAlt: "WazirX logo",
  },
  {
    name: "Binance",
    pillar: "Pillar 2",
    average: "94.34",
    currency: "₹",
    pair: "1 USDT = ₹94.34",
    min: "Min 94.00 ₹",
    max: "Max 94.50 ₹",
    logo: "/binance.png",
    logoAlt: "Binance logo",
  },
];

export const withdrawNetworks: {
  network: string;
  fee: number;
  eta: string;
  minimum: number;
}[] = [
  {
    network: "TRON (TRC20)",
    fee: 5,
    eta: "Instant after approval",
    minimum: 50,
  },
  {
    network: "Ethereum (ERC20)",
    fee: 15,
    eta: "~5 minutes",
    minimum: 200,
  },
  {
    network: "Polygon (PoS)",
    fee: 3,
    eta: "Under 2 minutes",
    minimum: 30,
  },
];

export const portfolioData: { image: string; title: string; text: string }[] = [
  {
    image: "/images/portfolio/portfolio-icon-1.svg",
    title: "Unified treasury dashboard",
    text: "Monitor bank balances, on-chain holdings, and pending conversions in one real-time view.",
  },
  {
    image: "/images/portfolio/portfolio-icon-2.svg",
    title: "Smart hedging alerts",
    text: "Receive alerts when INR spreads move so you can lock prices before the market shifts.",
  },
  {
    image: "/images/portfolio/portfolio-icon-3.svg",
    title: "Developer-first APIs",
    text: "Automate deposits, conversions, and withdrawals with secure, rate-limited endpoints.",
  },
];

export const marketListings: {
  symbol: string;
  name: string;
  change: string;
  volume: string;
  price: string;
  icon: string;
  color: string;
}[] = [
  {
    symbol: "MATIC",
    name: "MATIC",
    change: "+4.25%",
    volume: "$968,475.1",
    price: "$0.2853",
    icon: "simple-icons:polygon",
    color: "#8247e5",
  },
  {
    symbol: "SHIB",
    name: "SHIB",
    change: "+5.52%",
    volume: "$8,698,736.9",
    price: "$0.00001236",
    icon: "simple-icons:shibainu",
    color: "#f00500",
  },
  {
    symbol: "FIL",
    name: "FIL",
    change: "-2.21%",
    volume: "$27,262,113.3",
    price: "$2.32",
    icon: "simple-icons:filecoin",
    color: "#0090ff",
  },
  {
    symbol: "EOS",
    name: "EOS",
    change: "-2.47%",
    volume: "$7,296,340.7",
    price: "$0.4665",
    icon: "simple-icons:eos",
    color: "#000000",
  },
  {
    symbol: "DOT",
    name: "DOT",
    change: "-1.16%",
    volume: "$7,260,306.3",
    price: "$3.83",
    icon: "simple-icons:polkadot",
    color: "#e6007a",
  },
  {
    symbol: "USDT",
    name: "USDT",
    change: "+0.01%",
    volume: "$304,938,444.8",
    price: "$1.00",
    icon: "simple-icons:tether",
    color: "#26a17b",
  },
  {
    symbol: "DOGE",
    name: "DOGE",
    change: "-8.55%",
    volume: "$69,978,076.9",
    price: "$0.2170",
    icon: "simple-icons:dogecoin",
    color: "#c2a633",
  },
  {
    symbol: "BTC",
    name: "BTC",
    change: "+1.45%",
    volume: "$2,307,709,024.6",
    price: "$112,271.10",
    icon: "simple-icons:bitcoin",
    color: "#f7931a",
  },
  {
    symbol: "SOL",
    name: "SOL",
    change: "+0.55%",
    volume: "$409,006,610.6",
    price: "$206.17",
    icon: "simple-icons:solana",
    color: "#14f195",
  },
  {
    symbol: "TON",
    name: "TON",
    change: "-0.23%",
    volume: "$26,717,494.0",
    price: "$3.13",
    icon: "simple-icons:ton",
    color: "#0098ea",
  },
];
