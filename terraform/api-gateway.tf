resource "aws_apigatewayv2_api" "wordapi" {
  name          = "WordFrequencyAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "upload_lambda" {
  api_id           = aws_apigatewayv2_api.wordapi.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.upload_handler.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "upload" {
  api_id    = aws_apigatewayv2_api.wordapi.id
  route_key = "POST /upload"
  target    = "integrations/${aws_apigatewayv2_integration.upload_lambda.id}"
}

resource "aws_apigatewayv2_integration" "frequency_lambda" {
  api_id                 = aws_apigatewayv2_api.wordapi.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.frequency_handler.invoke_arn
  integration_method     = "POST" 
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "frequency_route" {
  api_id    = aws_apigatewayv2_api.wordapi.id
  route_key = "POST /frequency" 
  target    = "integrations/${aws_apigatewayv2_integration.frequency_lambda.id}"
}


resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.wordapi.id
  name        = "$default"
  auto_deploy = true
}



