#!/bin/bash
# Udaan Backend Startup Script

echo "=== Starting Udaan Backend ==="

# Navigate to backend directory
cd "$(dirname "$0")/Backend/app"

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r ../requirements.txt -q

# Seed career data if needed
echo "Seeding career data..."
python seed_career_data.py

# Start the server
echo "Starting FastAPI server on http://localhost:8000"
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
