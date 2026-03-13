"""
GST Liability Forecasting Engine.
Primary: Facebook Prophet
Fallback: Simple moving average / linear trend
"""
from typing import List, Dict, Any
from datetime import datetime, date
import calendar


class ForecastEngine:

    def train_and_predict(self, sales_invoices: list) -> Dict[str, Any]:
        """
        Build monthly GST totals from sales invoices and forecast next month.
        """
        monthly = self._aggregate_monthly(sales_invoices)

        if len(monthly) < 3:
            return self._fallback_forecast(monthly)

        try:
            return self._prophet_forecast(monthly)
        except Exception as e:
            print(f"[Forecast] Prophet failed ({e}), using fallback")
            return self._fallback_forecast(monthly)

    # ── Data aggregation ────────────────────────────────────────────────────

    def _aggregate_monthly(self, invoices: list) -> List[Dict]:
        """Aggregate invoice GST totals by month."""
        monthly: dict = {}
        for inv in invoices:
            period = self._invoice_period(inv)
            if not period:
                continue
            if period not in monthly:
                monthly[period] = {"gst": 0, "taxable": 0, "count": 0}
            gst = (inv.cgst or 0) + (inv.sgst or 0) + (inv.igst or 0)
            monthly[period]["gst"] += gst
            monthly[period]["taxable"] += inv.taxable_amount or 0
            monthly[period]["count"] += 1

        result = []
        for period, vals in sorted(monthly.items()):
            year, month = map(int, period.split("-"))
            result.append({
                "period": period,
                "year": year,
                "month": month,
                "gst_total": round(vals["gst"], 2),
                "taxable_total": round(vals["taxable"], 2),
                "invoice_count": vals["count"],
            })
        return result

    def _invoice_period(self, inv) -> str | None:
        date_str = inv.invoice_date
        if not date_str:
            return None
        try:
            if "-" in date_str:
                parts = date_str.split("-")
                if len(parts[0]) == 4:
                    return f"{parts[0]}-{parts[1].zfill(2)}"
                else:
                    return f"{parts[2]}-{parts[1].zfill(2)}"
            elif "/" in date_str:
                parts = date_str.split("/")
                return f"{parts[2]}-{parts[1].zfill(2)}"
        except Exception:
            pass
        return None

    # ── Prophet forecast ────────────────────────────────────────────────────

    def _prophet_forecast(self, monthly: List[Dict]) -> Dict[str, Any]:
        from prophet import Prophet
        import pandas as pd

        df = pd.DataFrame([
            {"ds": f"{m['year']}-{m['month']:02d}-01", "y": m["gst_total"]}
            for m in monthly
        ])
        df["ds"] = pd.to_datetime(df["ds"])

        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            interval_width=0.8,
        )
        model.fit(df)

        future = model.make_future_dataframe(periods=1, freq="MS")
        forecast = model.predict(future)

        last = forecast.iloc[-1]
        pred_month = last["ds"].month
        pred_year = last["ds"].year
        predicted = max(0, round(float(last["yhat"]), 2))
        lower = max(0, round(float(last["yhat_lower"]), 2))
        upper = max(0, round(float(last["yhat_upper"]), 2))

        trend = self._compute_trend(monthly)
        explanation = self._generate_explanation(predicted, monthly, trend)

        return {
            "month": pred_month,
            "year": pred_year,
            "predicted_liability": predicted,
            "lower_bound": lower,
            "upper_bound": upper,
            "model_type": "prophet",
            "trend": trend,
            "explanation": explanation,
            "historical_data": [
                {"period": m["period"], "gst_total": m["gst_total"]} for m in monthly
            ],
            "forecast_data": [
                {
                    "period": row["ds"].strftime("%Y-%m"),
                    "predicted": max(0, round(float(row["yhat"]), 2)),
                    "lower": max(0, round(float(row["yhat_lower"]), 2)),
                    "upper": max(0, round(float(row["yhat_upper"]), 2)),
                }
                for _, row in forecast.iterrows()
            ],
        }

    # ── Simple fallback ─────────────────────────────────────────────────────

    def _fallback_forecast(self, monthly: List[Dict]) -> Dict[str, Any]:
        if not monthly:
            return self._empty_forecast()

        values = [m["gst_total"] for m in monthly]
        avg = sum(values) / len(values)

        # Linear trend using last 3 points
        if len(values) >= 2:
            deltas = [values[i] - values[i - 1] for i in range(1, len(values))]
            avg_delta = sum(deltas[-3:]) / len(deltas[-3:])
            predicted = max(0, values[-1] + avg_delta)
        else:
            predicted = avg

        predicted = round(predicted, 2)
        lower = round(predicted * 0.85, 2)
        upper = round(predicted * 1.15, 2)

        last = monthly[-1]
        next_month = last["month"] % 12 + 1
        next_year = last["year"] + (1 if next_month == 1 else 0)

        trend = self._compute_trend(monthly)
        explanation = self._generate_explanation(predicted, monthly, trend)

        return {
            "month": next_month,
            "year": next_year,
            "predicted_liability": predicted,
            "lower_bound": lower,
            "upper_bound": upper,
            "model_type": "moving_average",
            "trend": trend,
            "explanation": explanation,
            "historical_data": [
                {"period": m["period"], "gst_total": m["gst_total"]} for m in monthly
            ],
            "forecast_data": [
                {"period": f"{next_year}-{next_month:02d}", "predicted": predicted,
                 "lower": lower, "upper": upper}
            ],
        }

    def _compute_trend(self, monthly: List[Dict]) -> str:
        if len(monthly) < 2:
            return "stable"
        vals = [m["gst_total"] for m in monthly]
        recent = vals[-3:] if len(vals) >= 3 else vals
        if recent[-1] > recent[0] * 1.1:
            return "increasing"
        elif recent[-1] < recent[0] * 0.9:
            return "decreasing"
        return "stable"

    def _generate_explanation(self, predicted: float, monthly: List[Dict], trend: str) -> str:
        if not monthly:
            return "Insufficient data for analysis."
        avg = sum(m["gst_total"] for m in monthly) / len(monthly)
        change = ((predicted - avg) / avg * 100) if avg > 0 else 0
        direction = "above" if change > 0 else "below"
        trend_text = {"increasing": "upward", "decreasing": "downward", "stable": "stable"}.get(trend, "stable")

        return (
            f"Based on {len(monthly)} months of data, your GST liability shows a {trend_text} trend. "
            f"Next month's predicted liability of ₹{predicted:,.0f} is "
            f"{abs(change):.1f}% {direction} your historical average of ₹{avg:,.0f}."
        )

    def _empty_forecast(self) -> Dict[str, Any]:
        now = datetime.now()
        return {
            "month": now.month % 12 + 1,
            "year": now.year + (1 if now.month == 12 else 0),
            "predicted_liability": 0,
            "lower_bound": 0,
            "upper_bound": 0,
            "model_type": "none",
            "trend": "stable",
            "explanation": "No historical data available.",
            "historical_data": [],
            "forecast_data": [],
        }
