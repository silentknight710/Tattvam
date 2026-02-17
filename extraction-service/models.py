from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import date

class FuelType(str, Enum):
    COAL = "Coal"
    DIESEL = "Diesel"

class Unit(str, Enum):
    MT = "MT"
    KG = "Kg"
    L = "L"

class ElectricityBill(BaseModel):
    consumer_no: str = Field(description="Consumer number or account ID from the bill")
    billing_date: date = Field(description="Date of the bill in YYYY-MM-DD format")
    kwh_units: int = Field(description="Total kWh units consumed")
    kvah_units: Optional[int] = Field(default=None, description="Total kVAh units consumed (if available)")
    net_amount_inr: float = Field(description="Net payable amount in INR")

class FuelInvoice(BaseModel):
    invoice_no: str = Field(description="Invoice number")
    date: date = Field(description="Date of invoice in YYYY-MM-DD format")
    fuel_type: FuelType = Field(description="Type of fuel (Coal or Diesel)")
    quantity: float = Field(description="Quantity of fuel purchased")
    unit: Unit = Field(description="Unit of measurement (MT, Kg, or L)")
    gcv: Optional[float] = Field(default=None, description="Gross Calorific Value if mentioned")

class LogisticsBill(BaseModel):
    lr_no: str = Field(description="Lorry Receipt (LR) Number")
    origin: str = Field(description="Origin location")
    destination: str = Field(description="Destination location")
    weight_mt: float = Field(description="Weight of cargo in Metric Tonnes")
    vehicle_no: str = Field(description="Vehicle registration number")
