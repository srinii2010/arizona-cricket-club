#!/bin/bash

# ACC Website Deployment Script
# This script ensures tests pass before deploying to Vercel

echo "🚀 Starting ACC Website Deployment Process"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run linting
echo "🔍 Running linting..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix linting errors before deploying."
    exit 1
fi

# Run tests
echo "🧪 Running test suite..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix failing tests before deploying."
    exit 1
fi

# Build application
echo "🔨 Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ All checks passed! Proceeding with deployment..."
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "✅ Your ACC website has been deployed to Vercel"
    echo "🌐 Check your Vercel dashboard for the deployment URL"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
