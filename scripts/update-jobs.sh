#!/bin/bash

echo "🚀 Triggering manual job opportunities update..."

# Check if the server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Next.js server is not running. Please start it with 'npm run dev' first."
    exit 1
fi

# Trigger the manual update
echo "📊 Updating job opportunities..."
response=$(curl -s -X POST http://localhost:3000/api/manual-update)

if [ $? -eq 0 ]; then
    echo "✅ Update triggered successfully!"
    echo "Response: $response"
else
    echo "❌ Failed to trigger update"
    exit 1
fi

echo "🎉 Manual update completed!"
