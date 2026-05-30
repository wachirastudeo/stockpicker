"use client";

import { useEffect, useMemo, useState } from "react";

type Stock = {
  sym: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: "tech" | "finance" | "health" | "energy";
  high?: number;
  low?: number;
};

type MarketIndex = {
  label: string;
  value: string;
  change: number;
  changePercent: number;
};

const NEWS = [
  { tag: "Market", color: "#534AB7", bg: "#EEEDFE", title: "ตลาดหุ้นสหรัฐเปิดแนวขึ้น วันนี้เช้า", time: "15 นาที" },
  { tag: "AI", color: "#185FA5", bg: "#E6F1FB", title: "ข่าว AI และเทคโนโลยีใหม่อัปเดตลงทะเบียน", time: "42 นาที" },
  { tag: "Earnings", color: "#0F6E56", bg: "#E1F5EE", title: "บริษัทใหญ่ประกาศผลประกอบการไตรมาส", time: "1 ชม." },
];

const CAT_LABEL: Record<string, string> = {
  tech: "Tech",
  finance: "Finance",
  health: "Healthcare",
  energy: "Energy",
};

const CAT_COLOR: Record<string, { c: string; bg: string; border: string }> = {
  tech: { c: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
  finance: { c: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  health: { c: "#059669", bg: "#ECFDF5", border: "#BBECBE" },
  energy: { c: "#D97706", bg: "#FEF3C7", border: "#FDE68A" },
};

const TABS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "tech", label: "Tech" },
  { id: "finance", label: "Finance" },
  { id: "health", label: "Healthcare" },
  { id: "energy", label: "Energy" },
];

export default function Page() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("all");
  const [sort, setSort] = useState<"price" | "change">("price");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Stock | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  // Fetch real stock data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/stocks");
        const data = await res.json();

        if (data.stocks && data.stocks.length > 0) {
          setStocks(data.stocks);
        } else if (data.error) {
          setError("API key not configured. Please set FINNHUB_API_KEY. Showing demo data instead.");
          // Use fallback demo data
          setStocks(getDemoStocks());
        } else {
          setStocks(getDemoStocks());
        }
      } catch (err) {
        console.error("Error fetching stocks:", err);
        setError("Failed to load stock data");
        setStocks(getDemoStocks());
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 60000); // Refresh every 1 minute
    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (sym: string) => {
    const newList = watchlist.includes(sym)
      ? watchlist.filter((s) => s !== sym)
      : [...watchlist, sym];
    setWatchlist(newList);
    localStorage.setItem("watchlist", JSON.stringify(newList));
  };

  const list = useMemo(() => {
    let arr = stocks.filter((s) => tab === "all" ? true : s.category === tab);
    arr = arr.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.sym.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === "price") {
      arr.sort((a, b) => b.price - a.price);
    } else {
      arr.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }

    return arr;
  }, [stocks, tab, sort, search]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-neutral-900/70 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                Stock Picker 📈
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live US Market Data
                </span>
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 dark:hover:bg-indigo-600/30 border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 font-medium transition-all hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-3 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search stocks... (e.g., AAPL, Microsoft)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
            />
          </div>
        </div>
      </header>

      {/* Market Summary Cards */}
      {!loading && !error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "S&P 500", value: "5,892.00", change: 40.3, changePercent: 0.68 },
              { label: "Nasdaq 100", value: "19,218.00", change: 213.8, changePercent: 1.12 },
              { label: "Dow Jones", value: "43,012.00", change: -91.2, changePercent: -0.21 },
              { label: "VIX Volatility", value: "14.2", change: -0.8, changePercent: -5.3 },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-white dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200/60 dark:border-neutral-700/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">{m.label}</div>
                <div className="text-2xl font-bold mt-2 dark:text-white">{m.value}</div>
                <div
                  className={`text-sm font-semibold mt-1 flex items-center gap-1 ${
                    m.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <svg className={`w-4 h-4 transition-transform ${m.change >= 0 ? "" : "rotate-180"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z" clipRule="evenodd" />
                  </svg>
                  {Math.abs(m.change).toFixed(2)} ({Math.abs(m.changePercent).toFixed(2)}%)
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* News Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-white dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
            </svg>
            <span className="text-sm font-semibold dark:text-white">Trending News</span>
          </div>
          <div className="space-y-3">
            {NEWS.map((n, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-neutral-200/50 dark:border-neutral-700/50 last:border-b-0 last:pb-0">
                <span
                  className="text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0"
                  style={{ background: n.bg, color: n.color }}
                >
                  {n.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium dark:text-white line-clamp-2">{n.title}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{n.time} ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-12">
        {/* Tabs and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  tab === t.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-white dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300/80 dark:hover:border-neutral-600/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "price" | "change")}
              className="px-3 py-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 bg-white dark:bg-neutral-800/50 text-sm font-medium dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="price">Highest Price</option>
              <option value="change">Most Changed</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mb-6 text-sm text-amber-800 dark:text-amber-300">
            ℹ️ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading live stock data...</p>
            </div>
          </div>
        )}

        {/* Stock Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((s) => {
              const col = CAT_COLOR[s.category];
              const up = s.change >= 0;
              const isWatched = watchlist.includes(s.sym);

              return (
                <div
                  key={s.sym}
                  onClick={() => setSelected(s)}
                  className="bg-white dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-indigo-300/80 dark:hover:border-indigo-700/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold dark:text-white">{s.sym}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(s.sym);
                          }}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-colors ${
                              isWatched ? "fill-amber-400 text-amber-400" : "text-neutral-400"
                            }`}
                            fill={isWatched ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{s.name}</p>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                      style={{
                        background: col.bg,
                        color: col.c,
                        border: `1px solid ${col.border}`,
                      }}
                    >
                      {CAT_LABEL[s.category]}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-2xl font-bold dark:text-white">${s.price.toFixed(2)}</span>
                    <span
                      className={`text-sm font-bold flex items-center gap-1 ${
                        up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${up ? "" : "rotate-180"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {Math.abs(s.changePercent).toFixed(2)}%
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
                    <span>
                      <span className="font-medium">Change:</span> ${Math.abs(s.change).toFixed(2)}
                    </span>
                    {s.high && <span>H: ${s.high.toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && list.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">No stocks found</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div
            className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 border border-neutral-200/60 dark:border-neutral-700/60 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-bold dark:text-white">{selected.sym}</h2>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">{selected.name}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold dark:text-white">${selected.price.toFixed(2)}</span>
              <span
                className={`text-lg font-bold flex items-center gap-1 ${
                  selected.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <svg
                  className={`w-5 h-5 transition-transform ${selected.change >= 0 ? "" : "rotate-180"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 7H12z" clipRule="evenodd" />
                </svg>
                {Math.abs(selected.changePercent).toFixed(2)}%
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase">Change</div>
                <div className="text-lg font-bold dark:text-white mt-1">${Math.abs(selected.change).toFixed(2)}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase">52W High</div>
                <div className="text-lg font-bold dark:text-white mt-1">${(selected.price * 1.15).toFixed(2)}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => toggleWatchlist(selected.sym)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  watchlist.includes(selected.sym)
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : "bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
                }`}
              >
                {watchlist.includes(selected.sym) ? "★ Watchlisted" : "☆ Add to Watchlist"}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Fallback demo data when API is not configured
function getDemoStocks(): Stock[] {
  return [
    { sym: "NVDA", name: "NVIDIA", category: "tech", price: 142.8, change: 4.56, changePercent: 3.3, high: 145.2 },
    { sym: "MSFT", name: "Microsoft", category: "tech", price: 438.1, change: 6.12, changePercent: 1.4, high: 442.5 },
    { sym: "AAPL", name: "Apple", category: "tech", price: 228.4, change: 1.82, changePercent: 0.8, high: 230.0 },
    { sym: "GOOGL", name: "Alphabet", category: "tech", price: 178.3, change: 3.38, changePercent: 1.9, high: 180.2 },
    { sym: "JPM", name: "JPMorgan Chase", category: "finance", price: 248.6, change: 1.24, changePercent: 0.5, high: 250.5 },
    { sym: "V", name: "Visa", category: "finance", price: 308.2, change: 0.92, changePercent: 0.3, high: 310.0 },
    { sym: "LLY", name: "Eli Lilly", category: "health", price: 782.5, change: 16.43, changePercent: 2.1, high: 795.0 },
    { sym: "UNH", name: "UnitedHealth", category: "health", price: 582.4, change: -3.49, changePercent: -0.6, high: 586.0 },
    { sym: "XOM", name: "ExxonMobil", category: "energy", price: 118.7, change: 1.42, changePercent: 1.2, high: 120.0 },
  ];
}
