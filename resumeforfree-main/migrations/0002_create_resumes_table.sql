-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    template TEXT DEFAULT 'template1',
    data JSON NOT NULL,
    settings JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_user_active ON resumes(user_id, is_active);

-- Enforce at most one active resume per user at the database level.
CREATE UNIQUE INDEX idx_resumes_one_active_per_user
ON resumes(user_id)
WHERE is_active = 1;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_resumes_updated_at
AFTER UPDATE ON resumes
BEGIN
    UPDATE resumes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
