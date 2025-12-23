#!/bin/bash

# LikeThem Development Server Startup Script
# Ensures the server always runs on port 3000

echo "🚀 Starting LikeThem Development Server..."

# Check if port 3000 is in use
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is in use. Killing existing process..."
    lsof -ti:3000 | xargs kill -9
    sleep 2
fi

# Start the development server
echo "✅ Starting server on http://localhost:3000"
npm run dev 