CREATE DATABASE IF NOT EXISTS surveykit
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE surveykit;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'creator') NOT NULL,
  created_at BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS surveys (
  id VARCHAR(36) PRIMARY KEY,
  owner_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  questions JSON NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  INDEX idx_owner_id (owner_id),
  INDEX idx_updated_at (updated_at),
  FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS responses (
  id VARCHAR(36) PRIMARY KEY,
  survey_id VARCHAR(36) NOT NULL,
  answers JSON NOT NULL,
  submitted_at BIGINT NOT NULL,
  INDEX idx_survey_id (survey_id),
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
