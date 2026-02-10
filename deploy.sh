#!/bin/bash

echo "🚀 Deploying CWS Frontend to Vercel..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Frontend URL: https://cws-frontend-4mptq0611-chrisnshuti943-2374s-projects.vercel.app"
