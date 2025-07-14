resource "aws_dynamodb_table" "user_data" {
  name         = var.dynamodb_table
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "username"

  attribute {
    name = "username"
    type = "S"
  }
}
