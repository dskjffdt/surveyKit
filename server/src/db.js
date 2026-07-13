import './loadEnv.js'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'surveykit',
}

let pool

function parseJson(value) {
  if (value == null) return value
  return typeof value === 'string' ? JSON.parse(value) : value
}

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
  }
}

function mapSurvey(row) {
  if (!row) return null
  const survey = {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    questions: parseJson(row.questions) ?? [],
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  }
  if (row.owner_name != null) {
    survey.ownerName = row.owner_name
  }
  if (row.response_count != null) {
    survey.responseCount = Number(row.response_count)
  }
  return survey
}

function mapResponse(row) {
  if (!row) return null
  return {
    id: row.id,
    surveyId: row.survey_id,
    answers: parseJson(row.answers) ?? {},
    submittedAt: Number(row.submitted_at),
  }
}

async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  })
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await conn.end()
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'creator') NOT NULL,
      created_at BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  await pool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS responses (
      id VARCHAR(36) PRIMARY KEY,
      survey_id VARCHAR(36) NOT NULL,
      answers JSON NOT NULL,
      submitted_at BIGINT NOT NULL,
      INDEX idx_survey_id (survey_id),
      FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

async function seedIfEmpty() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users')
  if (Number(rows[0].count) > 0) return

  const adminId = randomUUID()
  const creatorId = randomUUID()
  const now = Date.now()

  await pool.query(
    'INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
    [
      adminId,
      'admin',
      await bcrypt.hash('admin123', 10),
      'admin',
      now,
      creatorId,
      'creator',
      await bcrypt.hash('creator123', 10),
      'creator',
      now,
    ],
  )

  const surveyId = randomUUID()
  const questions = [
    {
      id: randomUUID(),
      type: 'single',
      title: '您对我们的整体满意度？',
      required: true,
      options: ['非常满意', '满意', '一般', '不满意'],
    },
    {
      id: randomUUID(),
      type: 'rating',
      title: '您会向朋友推荐我们吗？',
      required: true,
      max: 5,
    },
    {
      id: randomUUID(),
      type: 'text',
      title: '还有什么建议？',
      required: false,
      placeholder: '请输入您的建议',
      multiline: true,
    },
  ]

  await pool.query(
    `INSERT INTO surveys (id, owner_id, title, description, status, questions, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      surveyId,
      creatorId,
      '客户满意度调查',
      '感谢您抽出时间填写这份问卷',
      'published',
      JSON.stringify(questions),
      now,
      now,
    ],
  )

  console.log('MySQL 数据库已初始化')
  console.log('账号 admin / admin123（管理员）')
  console.log('账号 creator / creator123（创建者）')
}

export async function initDb() {
  try {
    await ensureDatabase()
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
    })
    await createTables()
    await seedIfEmpty()
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error(
        'MySQL 连接失败：请复制 .env.example 为 .env 并填写正确的 MYSQL_USER / MYSQL_PASSWORD',
      )
    }
    throw error
  }
}

export async function findUserByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
  return mapUser(rows[0])
}

export async function findUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
  return mapUser(rows[0])
}

export async function insertUser(user) {
  await pool.query(
    'INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
    [user.id, user.username, user.passwordHash, user.role, user.createdAt],
  )
  return findUserById(user.id)
}

export async function listSurveys(user) {
  let sql = `
    SELECT s.*, u.username AS owner_name,
           (SELECT COUNT(*) FROM responses r WHERE r.survey_id = s.id) AS response_count
    FROM surveys s
    LEFT JOIN users u ON s.owner_id = u.id
  `
  const params = []
  if (user.role === 'creator') {
    sql += ' WHERE s.owner_id = ?'
    params.push(user.id)
  }
  sql += ' ORDER BY s.updated_at DESC'
  const [rows] = await pool.query(sql, params)
  return rows.map(mapSurvey)
}

export async function findSurveyById(id) {
  const [rows] = await pool.query(
    `SELECT s.*, u.username AS owner_name
     FROM surveys s
     LEFT JOIN users u ON s.owner_id = u.id
     WHERE s.id = ?`,
    [id],
  )
  return mapSurvey(rows[0])
}

export async function findPublishedSurvey(id) {
  const [rows] = await pool.query(
    'SELECT id, title, description, status, questions FROM surveys WHERE id = ? AND status = ?',
    [id, 'published'],
  )
  if (!rows[0]) return null
  const row = rows[0]
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    questions: parseJson(row.questions) ?? [],
  }
}

export async function insertSurvey(survey) {
  await pool.query(
    `INSERT INTO surveys (id, owner_id, title, description, status, questions, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      survey.id,
      survey.ownerId,
      survey.title,
      survey.description,
      survey.status,
      JSON.stringify(survey.questions),
      survey.createdAt,
      survey.updatedAt,
    ],
  )
  return findSurveyById(survey.id)
}

export async function updateSurveyRecord(survey) {
  await pool.query(
    `UPDATE surveys
     SET title = ?, description = ?, status = ?, questions = ?, updated_at = ?
     WHERE id = ?`,
    [
      survey.title,
      survey.description,
      survey.status,
      JSON.stringify(survey.questions),
      survey.updatedAt,
      survey.id,
    ],
  )
  return findSurveyById(survey.id)
}

export async function deleteSurveyById(id) {
  await pool.query('DELETE FROM surveys WHERE id = ?', [id])
}

export async function listResponsesBySurveyId(surveyId) {
  const [rows] = await pool.query(
    'SELECT * FROM responses WHERE survey_id = ? ORDER BY submitted_at DESC',
    [surveyId],
  )
  return rows.map(mapResponse)
}

export async function insertResponse(response) {
  await pool.query(
    'INSERT INTO responses (id, survey_id, answers, submitted_at) VALUES (?, ?, ?, ?)',
    [response.id, response.surveyId, JSON.stringify(response.answers), response.submittedAt],
  )
  return response
}
