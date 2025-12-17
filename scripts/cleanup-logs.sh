#!/bin/bash

# Script to remove debug console.log statements for production
# Keeps console.error and console.warn for important error handling
# More careful approach - only removes complete console.log() lines

echo "🧹 Cleaning up console.log statements..."

# Find and remove console.log lines (but keep console.error and console.warn)
# This uses a more careful sed pattern that only removes lines that start with console.log
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '/^[[:space:]]*console\.log(/d' {} +

echo "✅ Cleanup complete!"
echo "Note: console.error and console.warn statements were preserved"
echo "Files processed:"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l
