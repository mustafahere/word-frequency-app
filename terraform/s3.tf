resource "aws_s3_bucket" "uploads" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.uploads.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.process_handler.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".txt"
  }

  lambda_function {
    lambda_function_arn = aws_lambda_function.process_handler.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".pdf"
  }

  lambda_function {
    lambda_function_arn = aws_lambda_function.process_handler.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".docx"
  }

  depends_on = [aws_lambda_permission.allow_s3]
}

resource "aws_s3_bucket_cors_configuration" "bucket_cors" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}


