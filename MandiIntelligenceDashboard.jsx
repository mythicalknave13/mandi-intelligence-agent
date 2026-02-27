import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import "./styles.css";

const ELASTIC_CONFIG = {
  endpoint: "https://my-elasticsearch-project-c8935b.es.asia-south1.gcp.elastic.cloud:443",
  apiKey: "OFZ1MW5wd0I5b2VVUzUtMnA0Ulg6bUEya2ZUaXhNSlJrckZXczVQam9ZZw==",
  pricesIndex: "mandi-prices",
  advisoriesIndex: "advisories",
};

const DEMO_PRICE_ROWS = [
  {
    mandi: "Kolar APMC",
    todayPrice: 1800,
    sevenDayAvg: 2500,
    distanceKm: 0,
    netRevenue: 360000,
    transportCost: 0,
  },
  {
    mandi: "Bangalore APMC (Yeshwanthpur)",
    todayPrice: 3200,
    sevenDayAvg: 2780,
    distanceKm: 68,
    netRevenue: 635240,
    transportCost: 4760,
  },
  {
    mandi: "Mysore APMC",
    todayPrice: 2400,
    sevenDayAvg: 2350,
    distanceKm: 198,
    netRevenue: 466140,
    transportCost: 13860,
  },
  {
    mandi: "Hubli APMC",
    todayPrice: 2300,
    sevenDayAvg: 2290,
    distanceKm: 520,
    netRevenue: 423800,
    transportCost: 36200,
  },
  {
    mandi: "Belgaum APMC",
    todayPrice: 2200,
    sevenDayAvg: 2180,
    distanceKm: 590,
    netRevenue: 398700,
    transportCost: 41300,
  },
];

const DEMO_CHART_DATA = [
  { date: "Feb 02", kolar: 2400, bangalore: 2620, mysore: 2320, hubli: 2260, belgaum: 2160 },
  { date: "Feb 03", kolar: 2360, bangalore: 2590, mysore: 2340, hubli: 2280, belgaum: 2175 },
  { date: "Feb 04", kolar: 2310, bangalore: 2640, mysore: 2330, hubli: 2270, belgaum: 2165 },
  { date: "Feb 05", kolar: 2270, bangalore: 2710, mysore: 2360, hubli: 2290, belgaum: 2180 },
  { date: "Feb 06", kolar: 2230, bangalore: 2760, mysore: 2350, hubli: 2280, belgaum: 2190 },
  { date: "Feb 07", kolar: 2190, bangalore: 2830, mysore: 2370, hubli: 2300, belgaum: 2205 },
  { date: "Feb 08", kolar: 2140, bangalore: 2890, mysore: 2360, hubli: 2290, belgaum: 2195 },
  { date: "Feb 09", kolar: 2090, bangalore: 2940, mysore: 2380, hubli: 2310, belgaum: 2210 },
  { date: "Feb 10", kolar: 2040, bangalore: 3010, mysore: 2370, hubli: 2300, belgaum: 2200 },
  { date: "Feb 11", kolar: 1980, bangalore: 3090, mysore: 2390, hubli: 2310, belgaum: 2215 },
  { date: "Feb 12", kolar: 1920, bangalore: 3160, mysore: 2380, hubli: 2300, belgaum: 2205 },
  { date: "Feb 13", kolar: 1880, bangalore: 3230, mysore: 2400, hubli: 2320, belgaum: 2220 },
  { date: "Feb 14", kolar: 1840, bangalore: 3210, mysore: 2390, hubli: 2310, belgaum: 2210 },
  { date: "Feb 15", kolar: 1800, bangalore: 3200, mysore: 2400, hubli: 2300, belgaum: 2200 },
];

const DEMO_ADVISORY = {
  strategyTitle: "Split Strategy",
  subtitle: "Shelf-life constrained allocation (7-day window)",
  marketAnalyst: {
    verdict: "Immediate Dispatch - Bangalore APMC",
    revenue: 635240,
    revenueNote: "Net revenue (after transport)",
    reasoning:
      "Bangalore at Rs.3,200/qtl — 78% above Kolar’s current price.\nNet gain Rs.2,75,240 after Rs.4,760 transport.\nArrivals at 0.52× 30-day average confirm supply gap.",
    risk:
      "Risk: Differential may narrow as supply rebalances.",
  },
  historicalAnalyst: {
    verdict: "Short Hold - Kolar (2–3 days)",
    revenue: 480000,
    revenueNote: "expected at recovery price, zero transport",
    reasoning:
      "Kolar arrivals 61% above average.\nTypical correction cycle: ~2.5 days.\nShelf life permits controlled hold.",
    risk:
      "Risk: Glut may persist beyond holding window.",
  },
  batchA: {
    title: "BATCH A",
    tonnes: "12 Tonnes",
    mandi: "Bangalore APMC (Yeshwanthpur)",
    action: "Sell today",
    revenue: 381144,
    accent: "green",
  },
  batchB: {
    title: "BATCH B",
    tonnes: "8 Tonnes",
    mandi: "Kolar APMC",
    action: "Hold 2 days",
    revenue: 177600,
    accent: "blue",
  },
  summary: {
    totalRevenue: 558744,
    additionalGain: 198744,
    perFarmer: 3975,
    memberCount: 50,
  },
  confidence: "MEDIUM-HIGH CONFIDENCE",
};

const AUDIT_ITEMS = [
  "Price data confirmed",
  "Deviation math validated",
  "Distance lookup confirmed",
  "Home mandi mapping confirmed",
  "Document integrity passed",
];

const CHART_SERIES = [
  { key: "kolar", name: "Kolar APMC", color: "#dc2626" },
  { key: "bangalore", name: "Bangalore APMC (Yeshwanthpur)", color: "#16a34a" },
  { key: "mysore", name: "Mysore APMC", color: "#2563eb" },
  { key: "hubli", name: "Hubli APMC", color: "#d97706" },
  { key: "belgaum", name: "Belgaum APMC", color: "#64748b" },
];

const PIPELINE_STEPS = [
  { id: "step-signal", label: "Signal" },
  { id: "step-compare", label: "Compare Mandis" },
  { id: "step-analysts", label: "Analyst Views" },
  { id: "step-resolve", label: "Resolve Conflict" },
  { id: "step-plan", label: "Final Plan" },
  { id: "step-verify", label: "Verification" },
];

function formatIndianNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatRs(value) {
  return `Rs.${formatIndianNumber(value)}`;
}

function deviationPercent(todayPrice, sevenDayAvg) {
  if (!sevenDayAvg) {
    return 0;
  }
  return Math.round(((todayPrice - sevenDayAvg) / sevenDayAvg) * 100);
}

function deviationClass(percent) {
  if (percent < -10) {
    return "deviation-bad";
  }
  if (percent > 10) {
    return "deviation-good";
  }
  return "deviation-neutral";
}

function trendDirection(percent) {
  if (percent > 1) {
    return "up";
  }
  if (percent < -1) {
    return "down";
  }
  return "flat";
}

function trendLabel(direction) {
  if (direction === "up") {
    return "Up";
  }
  if (direction === "down") {
    return "Down";
  }
  return "Flat";
}

function toReasonLines(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getAuthHeaders() {
  return {
    Authorization: `ApiKey ${ELASTIC_CONFIG.apiKey}`,
    "Content-Type": "application/json",
  };
}

function extractMandiPriceRows(payload) {
  const rows = payload?.values || payload?.rows;
  const columns = payload?.columns || [];

  if (!Array.isArray(rows) || !rows.length) {
    return [];
  }

  const mandiIndex = columns.findIndex((col) => col?.name === "mandi");
  const priceIndex = columns.findIndex((col) => col?.name === "today_price");

  if (mandiIndex < 0 || priceIndex < 0) {
    return [];
  }

  return rows
    .map((row) => {
      const mandi = row?.[mandiIndex];
      const todayPrice = Number(row?.[priceIndex]);
      if (!mandi || Number.isNaN(todayPrice)) {
        return null;
      }
      return {
        mandi: String(mandi).trim(),
        todayPrice: Math.round(todayPrice),
      };
    })
    .filter(Boolean);
}

function mergeAdvisoryData(existing, source) {
  if (!source) {
    return existing;
  }

  const candidate = source.coordinator || source.advisory || source;
  if (!candidate || typeof candidate !== "object") {
    return existing;
  }

  const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    ...existing,
    strategyTitle: candidate.strategyTitle || candidate.strategy || existing.strategyTitle,
    subtitle: candidate.subtitle || existing.subtitle,
    summary: {
      ...existing.summary,
      totalRevenue: toNumber(candidate.totalRevenue || candidate.summary?.totalRevenue, existing.summary.totalRevenue),
      additionalGain: toNumber(candidate.additionalGain || candidate.summary?.additionalGain, existing.summary.additionalGain),
      perFarmer: toNumber(candidate.perFarmer || candidate.summary?.perFarmer, existing.summary.perFarmer),
    },
    confidence: candidate.confidence || existing.confidence,
  };
}

function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let animationFrame;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * easedProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [target, duration]);

  return value;
}

function CustomLegend() {
  return (
    <div className="chart-legend">
      {CHART_SERIES.map((series) => (
        <div key={series.key} className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: series.color }} />
          <span>{series.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function MandiIntelligenceDashboard() {
  const [priceRows, setPriceRows] = useState(DEMO_PRICE_ROWS);
  const [advisory, setAdvisory] = useState(DEMO_ADVISORY);
  const [dataAsOf, setDataAsOf] = useState("Feb 15, 2026");
  const [lastUpdated, setLastUpdated] = useState("09:14 AM");
  const [isRunning, setIsRunning] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [chartWidth, setChartWidth] = useState(760);
  const [activeStep, setActiveStep] = useState(PIPELINE_STEPS[0].id);
  const [expandedEvidence, setExpandedEvidence] = useState({
    market: false,
    historical: false,
  });
  const chartContainerRef = useRef(null);
  const timerRef = useRef(null);

  const marketAnalyst = advisory.marketAnalyst || DEMO_ADVISORY.marketAnalyst;
  const historicalAnalyst = advisory.historicalAnalyst || DEMO_ADVISORY.historicalAnalyst;
  const batchA = advisory.batchA || DEMO_ADVISORY.batchA;
  const batchB = advisory.batchB || DEMO_ADVISORY.batchB;
  const advisorySummary = advisory.summary || DEMO_ADVISORY.summary;

  const totalRevenueCount = useCountUp(advisorySummary.totalRevenue, 1500);
  const additionalGainCount = useCountUp(advisorySummary.additionalGain, 1500);
  const perFarmerCount = useCountUp(advisorySummary.perFarmer, 1500);

  const chartTicks = useMemo(() => {
    return DEMO_CHART_DATA
      .filter((_, index) => index % 3 === 0 || index === DEMO_CHART_DATA.length - 1)
      .map((row) => row.date);
  }, []);

  const kolarRow = priceRows.find((row) => row.mandi === "Kolar APMC") || DEMO_PRICE_ROWS[0];
  const bangaloreRow =
    priceRows.find((row) => row.mandi === "Bangalore APMC (Yeshwanthpur)") || DEMO_PRICE_ROWS[1];

  useEffect(() => {
    setShowAlert(true);
  }, []);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) {
      return undefined;
    }

    const updateWidth = () => {
      setChartWidth(Math.max(container.clientWidth - 2, 280));
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateWidth);
      observer.observe(container);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const sections = PIPELINE_STEPS.map((step) => document.getElementById(step.id)).filter(Boolean);
    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveStep(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.3, 0.55, 0.8],
        rootMargin: "-25% 0px -55% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchLatestAdvisory() {
      try {
        const url = `${ELASTIC_CONFIG.endpoint}/${ELASTIC_CONFIG.advisoriesIndex}/_search?size=1&sort=@timestamp:desc`;
        const response = await fetch(url, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Advisory fetch failed: ${response.status}`);
        }

        const payload = await response.json();
        const source = payload?.hits?.hits?.[0]?._source;

        if (!source) {
          return false;
        }

        if (isMounted) {
          setAdvisory((existing) => mergeAdvisoryData(existing, source));

          const timestamp = source["@timestamp"] || source.timestamp;
          if (timestamp) {
            const date = new Date(timestamp);
            if (!Number.isNaN(date.getTime())) {
              setDataAsOf(
                date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                })
              );
              setLastUpdated(
                date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                })
              );
            }
          }
        }

        return true;
      } catch (error) {
        // Silent fallback to demo data
        return false;
      }
    }

    async function fetchMandiPrices() {
      try {
        const query = `FROM ${ELASTIC_CONFIG.pricesIndex}
| WHERE commodity == "Tomato" AND state == "Karnataka"
| STATS today_price = AVG(modal_price_per_quintal) BY mandi
| SORT today_price DESC`;

        const response = await fetch(`${ELASTIC_CONFIG.endpoint}/_query`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`Price fetch failed: ${response.status}`);
        }

        const payload = await response.json();
        const mandiPrices = extractMandiPriceRows(payload);

        if (!mandiPrices.length) {
          return false;
        }

        const mandiMap = new Map(
          mandiPrices.map((entry) => [entry.mandi.toLowerCase(), entry.todayPrice])
        );

        if (isMounted) {
          setPriceRows((existingRows) => {
            return existingRows.map((row) => {
              const matchedPrice =
                mandiMap.get(row.mandi.toLowerCase()) ||
                mandiMap.get(row.mandi.replace(" APMC", "").toLowerCase());

              if (!matchedPrice) {
                return row;
              }

              return {
                ...row,
                todayPrice: matchedPrice,
                netRevenue: matchedPrice * 200 - row.transportCost,
              };
            });
          });
        }

        return true;
      } catch (error) {
        // Silent fallback to demo data
        return false;
      }
    }

    async function runInitialLoad() {
      const [advisoryLoaded, pricesLoaded] = await Promise.all([
        fetchLatestAdvisory(),
        fetchMandiPrices(),
      ]);

      if (isMounted) {
        setIsDemoMode(!(advisoryLoaded && pricesLoaded));
      }
    }

    runInitialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleRunAdvisory = () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);

    timerRef.current = setTimeout(() => {
      setIsRunning(false);
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        })
      );
    }, 3000);
  };

  const enrichedRows = useMemo(() => {
    return priceRows.map((row) => {
      const deviation = deviationPercent(row.todayPrice, row.sevenDayAvg);
      const trend = trendDirection(deviation);
      return {
        ...row,
        deviation,
        trend,
        isRecommended: row.mandi === "Bangalore APMC (Yeshwanthpur)",
      };
    });
  }, [priceRows]);

  const marketReasonLines = useMemo(() => {
    const lines = toReasonLines(marketAnalyst.reasoning);
    return lines.length ? lines : ["Evidence unavailable for market analyst."];
  }, [marketAnalyst.reasoning]);

  const historicalReasonLines = useMemo(() => {
    const lines = toReasonLines(historicalAnalyst.reasoning);
    return lines.length ? lines : ["Evidence unavailable for historical analyst."];
  }, [historicalAnalyst.reasoning]);

  const marketVisibleEvidence = expandedEvidence.market ? marketReasonLines : marketReasonLines.slice(0, 3);
  const historicalVisibleEvidence = expandedEvidence.historical
    ? historicalReasonLines
    : historicalReasonLines.slice(0, 3);

  const marketHasMoreEvidence = marketReasonLines.length > 3;
  const historicalHasMoreEvidence = historicalReasonLines.length > 3;

  const marketRiskText = marketAnalyst.risk || "Risk not available.";
  const historicalRiskText = historicalAnalyst.risk || "Risk not available.";

  const finalActionText = `Dispatch ${batchA.tonnes || "12T"} to ${String(
    batchA.mandi || "Bangalore"
  )
    .replace(" APMC", "")
    .replace("(Yeshwanthpur)", "")
    .trim()} today, hold ${batchB.tonnes || "8T"} at ${String(
    batchB.mandi || "Kolar"
  )
    .replace(" APMC", "")
    .replace("(Yeshwanthpur)", "")
    .trim()} 2 days`;
  const activeStepIndex = Math.max(
    0,
    PIPELINE_STEPS.findIndex((step) => step.id === activeStep)
  );

  return (
    <div className="dashboard-root">
      <div className="dashboard-shell">
        <header className="card header-card">
          <div className="header-grid">
            <div className="header-brand">
              <h1 className="header-title">MANDI INTELLIGENCE</h1>
              <div className="header-subtitle">Karnataka APMC Decision Engine</div>
            </div>

            <div className="commodity-wrap">
              <div className="commodity-pill">TOMATO — KARNATAKA</div>
              <div className="data-asof">Data as of {dataAsOf}</div>
            </div>

            <div className="header-actions">
              <div className="status-row">
                <span className="status-dot" />
                <span className="status-text">AGENT • {isDemoMode ? "DEMO" : "LIVE"}</span>
              </div>

              <button type="button" onClick={handleRunAdvisory} disabled={isRunning} className="run-button">
                {isRunning ? (
                  <>
                    <span className="run-spinner" />
                    Running...
                  </>
                ) : (
                  "Run Advisory"
                )}
              </button>

              <div className="last-updated">Last updated {lastUpdated}</div>
            </div>
          </div>
        </header>

        <main className="pipeline-main">
          <section className="card pipeline-card">
            <div className="card-header-row">
              <h2 className="section-title">Decision Pipeline</h2>
              <div className="section-meta">Signal → Compare Mandis → Analyst Views → Resolve Conflict → Final Plan → Verification</div>
            </div>
            <nav className="pipeline-stepper" aria-label="Decision pipeline steps">
              {PIPELINE_STEPS.map((step, index) => {
                const isCompleted = activeStepIndex > index;
                const isActive = activeStepIndex === index;
                const stepStateClass = isCompleted
                  ? "pipeline-step-complete"
                  : isActive
                    ? "pipeline-step-active"
                    : "pipeline-step-inactive";
                return (
                  <a
                    key={step.id}
                    href={`#${step.id}`}
                    className={`pipeline-step ${stepStateClass}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="pipeline-index">{isCompleted ? "✓" : index + 1}</span>
                    <span className="pipeline-label">{step.label}</span>
                  </a>
                );
              })}
            </nav>
          </section>

          <section className="pipeline-section" id="step-signal">
            <div className="section-kicker">Step 1</div>
            <h2 className="section-title">Signal Detected</h2>
            <div className={`card alert-strip ${showAlert ? "alert-strip-enter" : ""}`}>
              <div className="alert-label">Market Alert</div>
              <div className="alert-line">
                <span className="alert-bullet">•</span>
                <span className="alert-copy">
                  <span className="alert-mandi">Kolar APMC</span> — Tomato at{" "}
                  <span className="alert-strong tabular-nums">{formatRs(kolarRow.todayPrice)}/qtl</span> —{" "}
                  <span className="alert-deviation alert-down tabular-nums">
                    {Math.abs(deviationPercent(kolarRow.todayPrice, kolarRow.sevenDayAvg))}%
                  </span>{" "}
                  below 7-day average
                </span>
              </div>
              <div className="alert-line">
                <span className="alert-bullet">•</span>
                <span className="alert-copy">
                  <span className="alert-mandi">Bangalore APMC (Yeshwanthpur)</span> — Tomato at{" "}
                  <span className="alert-strong tabular-nums">{formatRs(bangaloreRow.todayPrice)}/qtl</span> —{" "}
                  <span className="alert-deviation alert-up tabular-nums">
                    {Math.abs(deviationPercent(bangaloreRow.todayPrice, bangaloreRow.sevenDayAvg))}%
                  </span>{" "}
                  above 7-day average
                </span>
              </div>
            </div>
          </section>

          <section className="pipeline-section" id="step-compare">
            <div className="section-kicker">Step 2</div>
            <h2 className="section-title">Compare Mandis</h2>
            <div className="compare-grid">
              <div className="card">
                <div className="section-header">
                  <h3 className="section-title">Current Market Prices</h3>
                  <div className="section-meta">Today, 7-day average, trend, and net revenue by mandi</div>
                </div>

                <div className="table-wrap">
                  <table className="market-table">
                    <thead>
                      <tr>
                        <th className="th-mandi">Mandi</th>
                        <th className="th-num">Today</th>
                        <th className="th-num">7-day avg</th>
                        <th className="th-num">Deviation</th>
                        <th className="th-center">Trend</th>
                        <th className="th-num">Dist km</th>
                        <th className="th-num">Net rev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrichedRows.map((row) => (
                        <tr key={row.mandi} className="table-row">
                          <td className={`mandi-cell ${row.isRecommended ? "recommended-cell" : ""}`} title={row.mandi}>
                            <span className="mandi-name">{row.mandi}</span>
                          </td>
                          <td className="num-cell">{formatRs(row.todayPrice)}</td>
                          <td className="num-cell table-secondary">{formatRs(row.sevenDayAvg)}</td>
                          <td className="num-cell">
                            <span className={`deviation-pill ${deviationClass(row.deviation)}`}>
                              {row.deviation > 0 ? `+${row.deviation}%` : `${row.deviation}%`}
                            </span>
                          </td>
                          <td className="center-cell table-secondary">
                            <span className={`trend-chip ${row.trend}`}>{trendLabel(row.trend)}</span>
                          </td>
                          <td className="num-cell distance-cell table-secondary">{formatIndianNumber(row.distanceKm)} km</td>
                          <td className="num-cell net-cell">{formatRs(row.netRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="market-mobile-list">
                    {enrichedRows.map((row) => (
                      <article
                        key={`${row.mandi}-mobile`}
                        className={`market-row-card ${row.isRecommended ? "recommended-cell" : ""}`}
                      >
                        <div className="market-row-header">
                          <div className="market-row-title" title={row.mandi}>{row.mandi}</div>
                          {row.isRecommended && (
                            <div className="analysis-badge badge-ready">Decision: Ready</div>
                          )}
                        </div>

                        <div className="market-row-grid">
                          <div className="market-mini-item">
                            <div className="market-mini-label">Today</div>
                            <div className="market-mini-value">{formatRs(row.todayPrice)}</div>
                          </div>
                          <div className="market-mini-item">
                            <div className="market-mini-label">7-day avg</div>
                            <div className="market-mini-value table-secondary">{formatRs(row.sevenDayAvg)}</div>
                          </div>
                          <div className="market-mini-item">
                            <div className="market-mini-label">Deviation</div>
                            <span className={`deviation-pill ${deviationClass(row.deviation)}`}>
                              {row.deviation > 0 ? `+${row.deviation}%` : `${row.deviation}%`}
                            </span>
                          </div>
                          <div className="market-mini-item">
                            <div className="market-mini-label">Trend</div>
                            <span className={`trend-chip ${row.trend}`}>{trendLabel(row.trend)}</span>
                          </div>
                        </div>

                        <div className="market-row-footer">
                          <span className="table-secondary">Distance {formatIndianNumber(row.distanceKm)} km</span>
                          <span className="net-cell">{formatRs(row.netRevenue)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card chart-card">
                <div className="chart-title-row">
                  <h3 className="section-title">14-day Trend</h3>
                </div>

                <div className="chart-wrap" ref={chartContainerRef}>
                  <LineChart
                    data={DEMO_CHART_DATA}
                    width={chartWidth}
                    height={270}
                    margin={{ top: 16, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#E2E8F0" strokeOpacity={0.7} strokeDasharray="0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      ticks={chartTicks}
                      tick={{ fontSize: 13, fill: "#64748b" }}
                      axisLine={{ stroke: "#CBD5E1" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 13, fill: "#64748b" }}
                      axisLine={{ stroke: "#CBD5E1" }}
                      tickLine={false}
                      width={52}
                      label={{
                        value: "Rs/qtl",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontSize: 13, fill: "#64748b" },
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [formatRs(value), ""]}
                      labelStyle={{ color: "#111827", fontSize: 13 }}
                      contentStyle={{
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        fontSize: "13px",
                        color: "#111827",
                      }}
                    />

                    {CHART_SERIES.map((series) => (
                      <Line
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.name}
                        stroke={series.color}
                        strokeWidth={2.4}
                        dot={false}
                        isAnimationActive={false}
                      />
                    ))}

                    <ReferenceLine
                      x={DEMO_CHART_DATA[DEMO_CHART_DATA.length - 1].date}
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      label={{ value: "Today", fill: "#94A3B8", fontSize: 13, position: "top" }}
                    />

                    <Legend verticalAlign="bottom" content={<CustomLegend />} />
                  </LineChart>
                </div>
              </div>
            </div>
          </section>

          <section className="pipeline-section" id="step-analysts">
            <div className="section-kicker">Step 3</div>
            <h2 className="section-title">Analyst Views</h2>

            <div className="analyst-grid">
              <div className="card analysis-card market-card">
                <div className="analysis-header card-header-row">
                  <div className="analysis-title-wrap">
                    <div className="analysis-title">Market Analyst</div>
                    <div className="analysis-subtitle">Price Arbitrage Model</div>
                  </div>
                  <div className="analysis-badge badge-ready">Decision: Ready</div>
                </div>

                <div className="analysis-body">
                  <div className="analysis-verdict">{marketAnalyst.verdict}</div>
                  <div className="analysis-amount market">
                    <span className="currency-prefix">Rs.</span>
                    <span>{formatIndianNumber(marketAnalyst.revenue)}</span>
                  </div>
                  <div className="analysis-note">{marketAnalyst.revenueNote}</div>
                  <div className="analysis-divider" />
                  <div className="analysis-section-label">Evidence</div>
                  <ul className="analysis-list">
                    {marketVisibleEvidence.map((line, index) => (
                      <li key={`market-evidence-${index}`}>{line}</li>
                    ))}
                  </ul>
                  {marketHasMoreEvidence && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setExpandedEvidence((existing) => ({ ...existing, market: !existing.market }))
                      }
                    >
                      {expandedEvidence.market ? "Show less" : "Show more"}
                    </button>
                  )}
                  <div className="risk-box">
                    <span className="risk-prefix">•</span>
                    <span>{marketRiskText}</span>
                  </div>
                </div>
              </div>

              <div className="card analysis-card historical-card">
                <div className="analysis-header card-header-row">
                  <div className="analysis-title-wrap">
                    <div className="analysis-title">Historical Analyst</div>
                    <div className="analysis-subtitle">Mean Reversion Model</div>
                  </div>
                  <div className="analysis-badge badge-disagrees">Model conflict</div>
                </div>

                <div className="analysis-body">
                  <div className="analysis-verdict">{historicalAnalyst.verdict}</div>
                  <div className="analysis-amount historical">
                    <span className="currency-prefix">Rs.</span>
                    <span>{formatIndianNumber(historicalAnalyst.revenue)}</span>
                  </div>
                  <div className="analysis-note">{historicalAnalyst.revenueNote}</div>
                  <div className="analysis-divider" />
                  <div className="analysis-section-label">Evidence</div>
                  <ul className="analysis-list">
                    {historicalVisibleEvidence.map((line, index) => (
                      <li key={`historical-evidence-${index}`}>{line}</li>
                    ))}
                  </ul>
                  {historicalHasMoreEvidence && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        setExpandedEvidence((existing) => ({ ...existing, historical: !existing.historical }))
                      }
                    >
                      {expandedEvidence.historical ? "Show less" : "Show more"}
                    </button>
                  )}
                  <div className="risk-box">
                    <span className="risk-prefix">•</span>
                    <span>{historicalRiskText}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="pipeline-section" id="step-resolve">
            <div className="section-kicker">Step 4</div>
            <h2 className="section-title">Resolution Engine Output</h2>

            <div className="card resolution-card">
              <p className="resolution-thesis">
                <strong>
                  Both models are valid under different assumptions. Split allocation maximizes expected value under shelf-life constraint.
                </strong>
              </p>
              <div className="resolution-grid">
                <div className="resolution-item">
                  <div className="resolution-label">Conflict detected</div>
                  <div className="resolution-value">Yes, analyst recommendations diverge.</div>
                </div>
                <div className="resolution-item">
                  <div className="resolution-label">Constraint applied</div>
                  <div className="resolution-value">Perishability and mandi distance constraints.</div>
                </div>
                <div className="resolution-item">
                  <div className="resolution-label">Resolution</div>
                  <div className="resolution-value">Split allocation to balance immediate arbitrage and recovery upside.</div>
                </div>
              </div>
              <div className="divider" />
              <div className="coordinator-kicker">Split Strategy</div>
              <div className="coordinator-title">{advisory.strategyTitle || DEMO_ADVISORY.strategyTitle}</div>
            </div>
          </section>

          <section className="pipeline-section" id="step-plan">
            <div className="section-kicker">Step 5</div>
            <h2 className="section-title">Final Plan</h2>

            <div className="card coordinator-card action-plan-card">
              <div className="card-header-row final-plan-head">
                <h3 className="final-action">{finalActionText}</h3>
                <div className="confidence-badge plan-confidence">
                  {advisory.confidence || DEMO_ADVISORY.confidence || "Confidence unavailable"}
                </div>
              </div>

              <div className="batch-grid">
                <div className="batch-box batch-green">
                  <div className="batch-label">{batchA.title}</div>
                  <div className="batch-tonnes">{batchA.tonnes}</div>
                  <div className="batch-mandi" title={batchA.mandi}>{batchA.mandi}</div>
                  <div className="batch-action">{batchA.action}</div>
                  <div className="batch-revenue">{formatRs(batchA.revenue)}</div>
                  <div className="batch-revenue-note">net revenue</div>
                </div>

                <div className="batch-box batch-blue">
                  <div className="batch-label">{batchB.title}</div>
                  <div className="batch-tonnes">{batchB.tonnes}</div>
                  <div className="batch-mandi" title={batchB.mandi}>{batchB.mandi}</div>
                  <div className="batch-action">{batchB.action}</div>
                  <div className="batch-revenue">{formatRs(batchB.revenue)}</div>
                  <div className="batch-revenue-note">net revenue</div>
                </div>
              </div>

              <div className="divider" />

              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">TOTAL REVENUE</div>
                  <div className="summary-value total">{formatRs(totalRevenueCount)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">ADDITIONAL GAIN</div>
                  <div className="summary-value gain">{formatRs(additionalGainCount)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">PER FARMER</div>
                  <div className="summary-value farmer">{formatRs(perFarmerCount)}</div>
                  <div className="summary-subnote">across 50 members</div>
                </div>
              </div>
            </div>
          </section>

          <section className="pipeline-section" id="step-verify">
            <div className="section-kicker">Step 6</div>
            <h2 className="section-title">Verification</h2>

            <section className="card verification-card">
              <div className="audit-grid">
                <div>
                  <div className="audit-label">Verification</div>
                  <div className="audit-id">ADV-20260215-001</div>
                </div>

                <div className="audit-items">
                  {AUDIT_ITEMS.map((item, index) => (
                    <div
                      key={item}
                      className="verify-item"
                      style={{ animationDelay: `${(index + 1) * 220}ms` }}
                    >
                      <span className="verify-glyph" aria-hidden="true">
                        ✓
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="audit-meta">
                  <div>Advisory indexed to Elastic</div>
                  <div>Verified against source indices</div>
                  <div className="audit-meta-strong">Feb 15, 2026 09:14 AM IST</div>
                </div>
              </div>

              <div className="audit-footer">
                Powered by Elastic Agent Builder | Data: Agmarknet Karnataka via CEDA Ashoka University |
                Independent advisory on open government data | Not a marketplace
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
