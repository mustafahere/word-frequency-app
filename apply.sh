#!/bin/bash

set -e  # Exit on any error

# Step 0: Load AWS credentials from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found!"
  exit 1
fi

# Step 1: Create zip files for Lambdas
cd ./lambdas/upload-handler
npm install
npm run zip

cd ../process-handler
npm install
npm run zip

cd ../frequency-handler
npm install
npm run zip

cd ../../terraform

# # Step 2: Deploy infrastructure with Terraform
terraform init
terraform apply -auto-approve

# # Step 3: Get API Gateway URL and S3 bucket name
API_URL=$(terraform output -raw api_url)
cd ..

# Step 4: Build frontend with VITE_API_URL injected
cd frontend
echo "VITE_API_URL=$API_URL" > .env
rm -rf node_modules
npm install
npm run dev
cd ..


# Print final S3 website URL (if static hosting is enabled)
echo ""
echo "✅ Frontend deployed!"
echo "🌐 Visit your app at: http://localhost:3000"
