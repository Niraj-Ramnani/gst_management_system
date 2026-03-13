"""
GST Forecasting - Prophet with ARIMA fallback
"""
from typing import List, Dict, Any


class ForecastModel:
    def forecast(self, history: List[Dict], periods: int = 3) -> Dict[str, Any]:
        """Forecast future GST liability. Returns predicted value + bounds."""
        if len(history) < 2:
            return {"predicted": 0, "lower": 0, "upper": 0, "forecast_data": []}

        try:
            return self._prophet_forecast(history, periods)
        except Exception as e:
            print(f"Prophet failed: {e}, using ARIMA fallback")
            return self._arima_forecast(history, periods)

    def _prophet_forecast(self, history: List[Dict], periods: int) -> Dict[str, Any]:
        from prophet import Prophet
        import pandas as pd

        df = pd.DataFrame(history)
        df["ds"] = pd.to_datetime(df["ds"])
        df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)

        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            seasonality_mode="additive",
            changepoint_prior_scale=0.05,
        )
        model.fit(df)

        future = model.make_future_dataframe(periods=periods, freq="MS")
        forecast = model.predict(future)

        last_forecast = forecast.iloc[-periods:]
        predicted = max(0, float(last_forecast["yhat"].iloc[0]))
        lower = max(0, float(last_forecast["yhat_lower"].iloc[0]))
        upper = max(0, float(last_forecast["yhat_upper"].iloc[0]))

        # Build chart-ready data
        forecast_data = []
        for _, row in forecast.iterrows():
            forecast_data.append({
                "ds": str(row["ds"])[:10],
                "predicted": max(0, round(float(row["yhat"]), 2)),
                "lower": max(0, round(float(row["yhat_lower"]), 2)),
                "upper": max(0, round(float(row["yhat_upper"]), 2)),
            })

        return {
            "predicted": round(predicted, 2),
            "lower": round(lower, 2),
            "upper": round(upper, 2),
            "model": "prophet",
            "forecast_data": forecast_data,
        }

    def _arima_forecast(self, history: List[Dict], periods: int) -> Dict[str, Any]:
        """Simple ARIMA fallback using statsmodels, or weighted moving average."""
        values = [float(h["y"]) for h in history]

        try:
            from statsmodels.tsa.arima.model import ARIMA
            model = ARIMA(values, order=(1, 1, 1))
            fit = model.fit()
            forecast = fit.forecast(steps=periods)
            predicted = max(0, float(forecast[0]))
            std = float(fit.params.get("sigma2", 0) ** 0.5)
            lower = max(0, predicted - 1.96 * std)
            upper = predicted + 1.96 * std
        except Exception:
            # Weighted moving average as last resort
            weights = list(range(1, len(values) + 1))
            predicted = sum(v * w for v, w in zip(values, weights)) / sum(weights)
            predicted = max(0, predicted)
            std = (sum((v - predicted) ** 2 for v in values) / max(len(values) - 1, 1)) ** 0.5
            lower = max(0, predicted - std)
            upper = predicted + std

        return {
            "predicted": round(predicted, 2),
            "lower": round(lower, 2),
            "upper": round(upper, 2),
            "model": "arima",
            "forecast_data": [],
        }
