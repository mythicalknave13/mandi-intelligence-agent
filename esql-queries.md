# ES|QL queries used in the demo

## 1) Resolve “today” (MAX timestamp)

```esql
FROM mandi-prices
| STATS max_timestamp = MAX(@timestamp)
```

## 2) Today’s tomato prices (demo mandis)

```esql
FROM mandi-prices
| WHERE commodity == "tomato" AND @timestamp == "2026-02-21T00:00:00.000Z"
| KEEP @timestamp, mandi, district, commodity, variety, min_price, max_price, modal_price
```
