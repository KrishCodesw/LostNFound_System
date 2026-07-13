# Campus Lost & Found

A centralized web application designed to reduce turnaround time for retrieving lost items on campus using automated text-matching.

## Outcomes & Metrics
* **Objective:** Streamline the report-to-claim pipeline for campus items.
* **Core Mechanism:** Category and description similarity matching (Full-Text Search).
* **Target:** Sub-24-hour resolution for matched items.

## Tech Stack
* **UI:** React (Vite)
* **API:** Java Spring Boot
* **Data:** MySQL

## Quick Start

### 1. Database Setup
Ensure MySQL is running. Create the database:
```sql
CREATE DATABASE lost_and_found;