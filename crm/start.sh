#!/bin/bash
# Always run from this script's directory (so `bash start.sh` works from anywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "🏗️  Starting Gharpayy CRM..."
echo ""

# Start backend
cd server
echo "📡 Starting backend on port 5000..."
npm start &
BACKEND_PID=$!

cd ../client
echo "🌐 Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CRM Running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press CTRL+C to stop both servers"

wait $BACKEND_PID $FRONTEND_PID
