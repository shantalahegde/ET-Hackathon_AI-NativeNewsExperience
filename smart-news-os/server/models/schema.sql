-- Smart News OS Database Schema
-- Run this file to set up the MySQL database

CREATE DATABASE IF NOT EXISTS smart_news_os;
USE smart_news_os;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('investor', 'startup_founder', 'student') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  topics JSON DEFAULT NULL,
  language VARCHAR(10) DEFAULT 'en',
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Saved articles
CREATE TABLE IF NOT EXISTS saved_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  description TEXT,
  url VARCHAR(1000),
  image_url VARCHAR(1000),
  source VARCHAR(200),
  published_at DATETIME,
  summary TEXT,
  tags JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_article (user_id, article_id)
);

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id VARCHAR(255),
  role ENUM('user', 'assistant') NOT NULL,
  message TEXT NOT NULL,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- News cache
CREATE TABLE IF NOT EXISTS news_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  data LONGTEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story arcs for tracking ongoing news topics
CREATE TABLE IF NOT EXISTS story_arcs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  entity_type ENUM('company', 'person', 'industry', 'policy') DEFAULT 'company',
  events JSON DEFAULT NULL,
  sentiment_data JSON DEFAULT NULL,
  key_entities JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_saved_articles_user ON saved_articles(user_id);
CREATE INDEX idx_chat_history_user ON chat_history(user_id);
CREATE INDEX idx_chat_history_session ON chat_history(session_id);
CREATE INDEX idx_news_cache_key ON news_cache(cache_key);
CREATE INDEX idx_news_cache_expires ON news_cache(expires_at);
