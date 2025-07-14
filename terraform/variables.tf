variable "bucket_name" {
  default = "word-frequency-files"
}

variable "dynamodb_table" {
  default = "users_word_frequency"
}

variable "aws_region" {
  default = "us-east-1"
}