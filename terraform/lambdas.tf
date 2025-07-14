resource "aws_lambda_function" "upload_handler" {
  filename         = "${path.module}/../lambdas/upload-handler/function.zip"
  function_name    = "uploadHandler"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/../lambdas/upload-handler/function.zip")
  environment {
    variables = {
      BUCKET_NAME = var.bucket_name
    }
  }
}

resource "aws_lambda_function" "process_handler" {
  filename         = "${path.module}/../lambdas/process-handler/function.zip"
  function_name    = "processHandler"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/../lambdas/process-handler/function.zip")
  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table
    }
  }
  timeout = 300 # 5 minutes
}

resource "aws_lambda_function" "frequency_handler" {
  filename         = "${path.module}/../lambdas/frequency-handler/function.zip"
  function_name    = "frequencyHandler"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_exec_role.arn
  source_code_hash = filebase64sha256("${path.module}/../lambdas/frequency-handler/function.zip")
  environment {
    variables = {
      TABLE_NAME = var.dynamodb_table
    }
  }
}

resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_handler.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.uploads.arn
}

resource "aws_lambda_permission" "allow_apigateway_upload" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wordapi.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_apigateway_frequency" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.frequency_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.wordapi.execution_arn}/*/*"
}
