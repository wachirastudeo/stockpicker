// API route to fetch real stock data from Finnhub
// Environment Variables needed:
// FINNHUB_API_KEY - Get free key from https://finnhub.io

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY || '';

const STOCKS_TO_FETCH = [
  'NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'TSLA', // Tech
  'JPM', 'V', 'MA', 'WFC', 'BAC', // Finance
  'LLY', 'UNH', 'JNJ', 'MRK', 'PFE', // Health
  'XOM', 'CVX', 'COP', 'MPC', // Energy
];

interface StockQuote {
  c: number; // current price
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
}

interface StockData {
  sym: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  category: 'tech' | 'finance' | 'health' | 'energy';
}

// Cache to avoid hitting rate limit
const cache: Map<string, { data: StockData; timestamp: number }> = new Map();
const CACHE_DURATION = 60000; // 1 minute

export async function GET(request: Request) {
  try {
    if (!API_KEY) {
      return Response.json(
        {
          error: 'API key not configured',
          message: 'Please set FINNHUB_API_KEY environment variable',
          stocks: [], // Return empty array so app doesn't crash
        },
        { status: 200 } // Return 200 to prevent app error
      );
    }

    const stocks: StockData[] = [];

    for (const symbol of STOCKS_TO_FETCH) {
      // Check cache first
      const cached = cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        stocks.push(cached.data);
        continue;
      }

      try {
        const response = await fetch(
          `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`,
          { next: { revalidate: 60 } }
        );

        if (!response.ok) continue;

        const quote: StockQuote = await response.json();

        if (quote.c && quote.pc) {
          const change = quote.c - quote.pc;
          const changePercent = (change / quote.pc) * 100;

          // Get company profile for name
          const profileRes = await fetch(
            `${FINNHUB_BASE_URL}/company-profile2?symbol=${symbol}&token=${API_KEY}`,
            { next: { revalidate: 3600 } }
          );

          let name = symbol;
          if (profileRes.ok) {
            const profile = await profileRes.json();
            name = profile.name || symbol;
          }

          const stockData: StockData = {
            sym: symbol,
            name,
            price: parseFloat(quote.c.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            high: quote.h,
            low: quote.l,
            category: getCategoryBySymbol(symbol),
          };

          stocks.push(stockData);
          cache.set(symbol, { data: stockData, timestamp: Date.now() });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        continue;
      }
    }

    return Response.json({ stocks });
  } catch (error) {
    console.error('Stock API error:', error);
    return Response.json(
      { error: 'Failed to fetch stocks', stocks: [] },
      { status: 500 }
    );
  }
}

function getCategoryBySymbol(symbol: string): 'tech' | 'finance' | 'health' | 'energy' {
  const techStocks = ['NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'TSLA'];
  const financeStocks = ['JPM', 'V', 'MA', 'WFC', 'BAC'];
  const healthStocks = ['LLY', 'UNH', 'JNJ', 'MRK', 'PFE'];
  const energyStocks = ['XOM', 'CVX', 'COP', 'MPC'];

  if (techStocks.includes(symbol)) return 'tech';
  if (financeStocks.includes(symbol)) return 'finance';
  if (healthStocks.includes(symbol)) return 'health';
  if (energyStocks.includes(symbol)) return 'energy';

  return 'tech';
}
