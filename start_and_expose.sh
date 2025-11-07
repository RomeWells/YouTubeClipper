#!/bin/bash

echo "============================================"
echo "Starting YouTube Clipper Backend Server..."
echo "============================================"

# Navigate into the backend directory
cd backend

# Start the server in the background using the '&' operator
npm run dev &

# Get the Process ID (PID) of the background server
SERVER_PID=$!

echo "Server started with PID: $SERVER_PID"
echo "Waiting for the server to initialize..."
sleep 5

echo "============================================"
echo "Starting LocalTunnel on port 3001..."
echo "============================================"

# Run localtunnel. When this command is stopped (e.g., with Ctrl+C),
# it will also stop the background server.
npx localtunnel --port 3001 --subdomain my-steering-up

# Kill the server process when localtunnel is closed
echo "Closing backend server..."
kill $SERVER_PID
