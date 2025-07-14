output "api_url" {
  value = aws_apigatewayv2_api.wordapi.api_endpoint
}

output "uploads_bucket" {
  value = aws_s3_bucket.uploads.id
}


