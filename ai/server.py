from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Smart Expense AI Service")


class TxRequest(BaseModel):
    title: str
    amount: float


def simple_category(title: str, amount: float) -> str:
    t = title.lower()

    if any(w in t for w in ["uber", "ola", "bus", "train", "metro", "flight", "uber auto"]):
        return "Transport"
    if any(w in t for w in ["zomato", "swiggy", "restaurant", "pizza", "burger", "food"]):
        return "Food"
    if any(w in t for w in ["grocery", "groceries", "mart", "supermarket"]):
        return "Groceries"
    if any(w in t for w in ["netflix", "spotify", "subscription", "prime video", "ott"]):
        return "Subscriptions"
    if any(w in t for w in ["recharge", "data", "internet", "wifi"]):
        return "Recharge & Internet"
    if any(w in t for w in ["rent", "pg", "hostel"]):
        return "Rent"
    if any(w in t for w in ["electricity", "water bill", "gas", "bill"]):
        return "Utilities"

    # Fallbacks based on amount
    if amount >= 5000:
        return "Big Purchase"
    if amount <= 100:
        return "Small Spend"
    return "Other"


@app.post("/categorize")
def categorize(tx: TxRequest):
    category = simple_category(tx.title, tx.amount)
    return {"category": category}
