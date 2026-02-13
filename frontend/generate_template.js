const XLSX = require('xlsx');

const data = [
    {
        "ItemName": "Tilapia Feed A",
        "SKU": "FEED-001",
        "Category": "Feeds",
        "Supplier": "AquaSupplies",
        "Quantity": 100,
        "UnitCost": 5000,
        "Location": "Warehouse A",
        "ReorderLevel": 10,
        "Description": "High quality feed",
        "ExpiryDate": "2025-12-31"
    },
    {
        "ItemName": "PH Meter",
        "SKU": "EQ-PH-01",
        "Category": "Equipment",
        "Supplier": "TechInstruments",
        "Quantity": 5,
        "UnitCost": 15000,
        "Location": "Lab Cabinet",
        "ReorderLevel": 2,
        "Description": "Digital PH Meter",
        "ExpiryDate": ""
    },
    {
        "ItemName": "Antibiotics",
        "SKU": "MED-001",
        "Category": "Medicine",
        "Supplier": "VetPharma",
        "Quantity": 50,
        "UnitCost": 2000,
        "Location": "Cold Storage",
        "ReorderLevel": 5,
        "Description": "General antibiotics",
        "ExpiryDate": "2024-06-30"
    },
    {
        "ItemName": "Netting 50m",
        "SKU": "NET-050",
        "Category": "Equipment",
        "Supplier": "NetMaster",
        "Quantity": 10,
        "UnitCost": 12000,
        "Location": "Warehouse B",
        "ReorderLevel": 2,
        "Description": "Heavy duty netting",
        "ExpiryDate": ""
    },
    {
        "ItemName": "Vitamin Mix",
        "SKU": "VIT-001",
        "Category": "Medicine",
        "Supplier": "VetPharma",
        "Quantity": 20,
        "UnitCost": 3500,
        "Location": "Cold Storage",
        "ReorderLevel": 5,
        "Description": "Growth supplement",
        "ExpiryDate": "2025-01-01"
    }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Import");

XLSX.writeFile(workbook, "stock_import_template.xlsx");

console.log("stock_import_template.xlsx created successfully!");
