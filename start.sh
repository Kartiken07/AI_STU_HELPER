#!/bin/bash
cd "Udaan2/Student_helper_2 3/Backend/app"
echo "Python: $(python3 --version)"
echo "Port: $PORT"
pip install -r ../requirements.txt 2>/dev/null
echo "Starting uvicorn..."
exec uvicorn app:app --host 0.0.0.0 --port $PORT --log-level debug 2>&1
