set -e

# Step 0: Load AWS credentials from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found!"
  exit 1
fi

# Step 1: Empty S3 buckets

cd terraform

UPLOADS_BUCKET=$(terraform output -raw uploads_bucket)

aws s3 rm s3://$UPLOADS_BUCKET --recursive

terraform destroy -auto-approve