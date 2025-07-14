# Word Frequency Application

A cloud-based application that analyzes word frequencies in text files using AWS serverless architecture and React frontend.

## Architecture Overview

The application consists of:

- **Frontend**: React + TypeScript application built with Vite
- **Backend**: AWS Serverless architecture including:
  - Lambda Functions
  - API Gateway
  - S3 Bucket for file storage
  - DynamoDB for data persistence

## Prerequisites

- Node.js (v18 or higher)
- AWS CLI configured with appropriate credentials
- Terraform installed
- `.env` file with AWS credentials

## Project Structure

```
word-frequency-app/
├── frontend/           # React frontend application
├── lambdas/           # AWS Lambda functions
│   ├── upload-handler/    # Handles file uploads to S3
│   ├── process-handler/   # Processes uploaded files
│   └── frequency-handler/ # Calculates word frequencies
├── terraform/         # Infrastructure as Code
└── scripts/          # Deployment scripts
```

## Setup and Deployment

1. **Configure AWS Credentials**
   Create a `.env` file in the root directory with your AWS credentials:

   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_preferred_region
   ```

2. **Deploy the Application**

   ```bash
   # Make the scripts executable
   chmod +x apply.sh
   chmod +x destroy.sh

   # Deploy the application
   ./apply.sh
   ```

   This script will:

   - Package Lambda functions
   - Deploy AWS infrastructure using Terraform
   - Build and start the frontend application

3. **Access the Application**
   Once deployed, the frontend will be available at `http://localhost:3000`

## Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Lambda Functions

Each Lambda function has its own `package.json` and dependencies. To modify a Lambda:

```bash
cd lambdas/<function-name>
npm install
# Make your changes
# Redeploy using apply.sh
```

### Infrastructure Changes

Infrastructure is managed with Terraform. To modify:

```bash
cd terraform
# Make changes to .tf files
terraform plan    # Review changes
terraform apply   # Apply changes
```

## Cleanup

To destroy all created AWS resources:

```bash
./destroy.sh
```

## Architecture Details

1. **Frontend**

   - Built with React + TypeScript
   - Uses Vite for fast development and building
   - Modern UI with responsive design

2. **Backend Services**

   - Upload Handler: Manages file uploads to S3
   - Process Handler: Processes uploaded files
   - Frequency Handler: Calculates and returns word frequencies

3. **AWS Resources**
   - API Gateway for RESTful endpoints
   - S3 for file storage
   - DynamoDB for storing analysis results
   - IAM roles and policies for security

## License

ISC License
