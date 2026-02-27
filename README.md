Mandi Intelligence Agent

A Stateful Multi-Step Decision Engine for Perishable Goods Markets

Built on Elastic Agent Builder

Problem

Perishable agricultural goods face extreme short-term price volatility.
Spot prices can swing 30–40% within 48 hours, while shelf life remains fixed.

Farmer cooperatives typically make allocation decisions using static dashboards, spreadsheets, or messaging apps — without structured reasoning, historical context, or auditability.

A single wrong 24-hour decision can erase margin entirely.

This project builds a multi-step, tool-driven AI agent using Elastic Agent Builder that detects conflicting market signals, resolves them under real-world constraints, and persists every advisory to Elasticsearch for verification.

What This Agent Does

Given:
	•	20 tonnes of perishable goods
	•	Multiple wholesale markets
	•	7-day rolling price history
	•	Daily arrival volumes
	•	Transport cost + shelf life constraints

The agent:
	1.	Detects statistical price anomalies using ES|QL
	2.	Retrieves current market prices using the Search tool
	3.	Detects supply surges using ES|QL on arrival data
	4.	Resolves disagreement between analyst outputs
	5.	Calculates revenue impact
	6.	Persists a structured advisory using the Workflow tool

All queries shown in the demo execute live against indexed data in Elasticsearch Serverless.

Demo Scenario
	•	Commodity: Tomato
	•	Quantity: 20 tonnes
	•	Markets: Kolar APMC, Bangalore APMC (Yeshwanthpur), Tumakuru APMC

Observed:
	•	Kolar dropped 28% vs rolling 7-day baseline (glut signal)
	•	Bangalore temporarily elevated
	•	Arrival surge building in Bangalore

Naïve strategy: send 20T to Bangalore.

Agent decision:
	•	12T → Bangalore (sell today)
	•	8T → Hold at Kolar (sell in 2 days)

Additional gain over naïve strategy: ₹1,98,744
Per farmer across 50-member FPO: ₹3,975

Architecture

Elasticsearch Indices
	•	mandi-prices — rolling 7-day price history per market
	•	mandi-arrivals — daily arrival volume per market
	•	advisories — persisted advisory audit log

Agent Tools
	•	ES|QL Tool — time-series aggregation and anomaly detection
	•	Search Tool — real-time price snapshot retrieval
	•	Workflow Tool — persistence of structured advisory documents


Multi-Step Agent Pipeline

Phase 1 — Price Anomaly Detection
ES|QL aggregation calculates rolling baseline and deviation per market.

Phase 2 — Market Analyst
Search tool retrieves current spot prices. Recommends highest price.

Phase 3 — Historical Analyst
ES|QL query detects arrival surge and probable short-term mean reversion.

Phase 4 — Coordinator Agent
Receives both outputs. Resolves conflict using:
	•	Shelf life constraint
	•	Transport cost
	•	Probability-weighted price trajectory

Outputs a split allocation plan.

Phase 5 — Revenue Optimization
Computes total revenue, gain vs naïve strategy, per-member benefit.

Phase 6 — Workflow Persistence
Stores advisory in Elasticsearch with:
	•	Market split
	•	Revenue metrics
	•	Reasoning trace
	•	Timestamp

Queryable via ES|QL for audit and verification.


Repository Contents
	•	MandiIntelligenceDashboard.jsx — React dashboard component (demo UI)
	•	styles.css — Dashboard styling
	•	agent-instructions.md — Agent configuration and system prompt
	•	esql-queries.md — ES|QL queries used in the agent tools
	•	sample-data/ — Example indexed documents
	•	README.md


Built With
	•	Elastic Agent Builder (custom multi-tool agent)
	•	Elasticsearch Serverless
	•	ES|QL
	•	Search tool
	•	Workflow tool
	•	React (UI component for demo)


Why This Matters

Price lookup is easy.

Detecting disagreement between signals, resolving it under constraints, and persisting a verifiable decision trail — that is the harder problem.

This project demonstrates a stateful, auditable, multi-step decision system built entirely on Elastic Agent Builder.

