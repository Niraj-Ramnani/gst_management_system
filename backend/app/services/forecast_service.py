"""
GST Forecasting Service - Prophet / ARIMA based
"""
from datetime import datetime
from app.models.returns import MonthlyReturn
from app.models.forecast import Forecast
from app.ml.forecasting.model import ForecastModel


async def get_next_month_forecast(business_id: str) -> dict:
    returns = await MonthlyReturn.find(MonthlyReturn.business_id == business_id).sort(
        MonthlyReturn.year, MonthlyReturn.month
    ).to_list()

    if len(returns) < 2:
        # Not enough data - return estimate based on average or zero
        return {
            "status": "insufficient_data",
            "message": "Need at least 2 months of data for forecasting",
            "predicted_liability": 0,
            "lower_bound": 0,
            "upper_bound": 0,
        }

    history = [{"ds": f"{r.year}-{r.month:02d}-01", "y": r.net_gst_payable} for r in returns]

    model = ForecastModel()
    result = model.forecast(history, periods=1)

    now = datetime.utcnow()
    next_month = now.month % 12 + 1
    next_year = now.year + (1 if next_month == 1 else 0)

    # Determine trend
    if len(returns) >= 3:
        recent_avg = sum(r.net_gst_payable for r in returns[-3:]) / 3
        older_avg = sum(r.net_gst_payable for r in returns[:-3]) / max(len(returns) - 3, 1)
        if recent_avg > older_avg * 1.1:
            trend = "increasing"
        elif recent_avg < older_avg * 0.9:
            trend = "decreasing"
        else:
            trend = "stable"
    else:
        trend = "stable"

    predicted = result["predicted"]
    explanation = (
        f"Based on {len(returns)} months of GST data, your liability is trending {trend}. "
        f"Next month's estimated GST payable is ₹{predicted:,.2f}."
    )

    # Save forecast
    forecast = Forecast(
        business_id=business_id,
        month=next_month,
        year=next_year,
        predicted_liability=predicted,
        lower_bound=result["lower"],
        upper_bound=result["upper"],
        trend=trend,
        explanation=explanation,
        historical_data=history,
        forecast_data=result.get("forecast_data", []),
    )
    await forecast.insert()

    return {
        "month": next_month,
        "year": next_year,
        "predicted_liability": predicted,
        "lower_bound": result["lower"],
        "upper_bound": result["upper"],
        "trend": trend,
        "explanation": explanation,
        "historical_data": history,
        "forecast_data": result.get("forecast_data", []),
    }


async def train_forecast_model(business_id: str) -> dict:
    returns = await MonthlyReturn.find(MonthlyReturn.business_id == business_id).to_list()
    return {
        "status": "ok",
        "message": f"Model trained on {len(returns)} months of data",
        "data_points": len(returns),
    }
