-- Minha Floresta Conservações - Database Schema
-- MySQL Database Schema for the reforestation platform

-- Create database (if needed)
-- CREATE DATABASE u271208684_minhafloresta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE u271208684_minhafloresta;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cpf VARCHAR(14),
    birth_date DATE,
    address JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    preferences JSON
);

-- Projects table (reforestation projects)
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    type ENUM('reforestation', 'restoration', 'conservation', 'blue-carbon') DEFAULT 'reforestation',
    price DECIMAL(10,2) NOT NULL,
    total_area INTEGER NOT NULL,
    available_area INTEGER NOT NULL,
    sold_area INTEGER DEFAULT 0,
    images JSON,
    coordinates JSON,
    status ENUM('active', 'inactive', 'completed') DEFAULT 'active',
    carbon_credit_per_m2 DECIMAL(10,4) DEFAULT 0.022,
    trees_per_m2 DECIMAL(10,4) DEFAULT 0.1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    start_date DATE,
    expected_completion DATE,
    certifications JSON,
    project_details JSON
);

-- Social projects table
CREATE TABLE IF NOT EXISTS social_projects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    category ENUM('education', 'community', 'research', 'training') DEFAULT 'education',
    budget DECIMAL(12,2) NOT NULL,
    spent DECIMAL(12,2) DEFAULT 0,
    donations_received DECIMAL(12,2) DEFAULT 0,
    beneficiaries INTEGER DEFAULT 0,
    status ENUM('active', 'paused', 'completed') DEFAULT 'active',
    images JSON,
    documents JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    start_date DATE,
    end_date DATE,
    coordinator_name VARCHAR(255),
    coordinator_contact VARCHAR(255)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    project_id VARCHAR(36),
    amount DECIMAL(12,2) NOT NULL,
    area_purchased INTEGER NOT NULL,
    payment_method ENUM('pix', 'credit_card', 'boleto', 'bank_transfer') NOT NULL,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    transaction_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    payment_gateway_id VARCHAR(255),
    receipt_url VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(36) PRIMARY KEY,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(36),
    transaction_id VARCHAR(36),
    project_id VARCHAR(36),
    area_m2 INTEGER NOT NULL,
    co2_offset_kg DECIMAL(10,2) NOT NULL,
    trees_planted INTEGER NOT NULL,
    issue_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    certificate_type ENUM('digital', 'physical') DEFAULT 'digital',
    status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
    certificate_data JSON,
    physical_delivery JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(36) PRIMARY KEY,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(20),
    social_project_id VARCHAR(36),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('pix', 'credit_card', 'boleto') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    receipt_issued BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (social_project_id) REFERENCES social_projects(id) ON DELETE CASCADE
);

-- Carbon calculator history
CREATE TABLE IF NOT EXISTS carbon_calculations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    session_id VARCHAR(100),
    calculation_data JSON NOT NULL,
    total_co2_kg DECIMAL(10,2) NOT NULL,
    recommendations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Shopping cart (for persistent cart across sessions)
CREATE TABLE IF NOT EXISTS shopping_cart (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    session_id VARCHAR(100),
    project_id VARCHAR(36),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (COALESCE(user_id, session_id), project_id)
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reply TEXT,
    replied_at TIMESTAMP NULL
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Audit log for important actions
CREATE TABLE IF NOT EXISTS audit_log (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(payment_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_donations_social_project_id ON donations(social_project_id);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_carbon_calculations_user_id ON carbon_calculations(user_id);
CREATE INDEX idx_shopping_cart_user_session ON shopping_cart(user_id, session_id);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Insert default system settings
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description) VALUES
('1', 'platform_name', '"Minha Floresta Conservações"', 'string', 'Nome da plataforma'),
('2', 'contact_email', '"contato@minhaflorestaconservacoes.com"', 'string', 'Email de contato principal'),
('3', 'processing_fee_percent', '3.5', 'number', 'Taxa de processamento em porcentagem'),
('4', 'certificate_prefix', '"MFC"', 'string', 'Prefixo dos certificados'),
('5', 'certificate_validity_years', '30', 'number', 'Validade dos certificados em anos'),
('6', 'physical_delivery_fee', '15.00', 'number', 'Taxa de envio físico dos certificados'),
('7', 'co2_per_m2_kg', '22', 'number', 'CO₂ compensado por m² em kg/ano'),
('8', 'trees_per_m2', '0.1', 'number', 'Número de árvores por m²'),
('9', 'survival_rate_percent', '85', 'number', 'Taxa de sobrevivência das árvores em %'),
('10', 'payment_methods', '{"pix": true, "credit_card": true, "boleto": true, "bank_transfer": false}', 'json', 'Métodos de pagamento habilitados')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    updated_at = CURRENT_TIMESTAMP;

-- Insert sample data for development/testing
INSERT INTO projects (id, name, description, location, type, price, total_area, available_area, images, status) VALUES
('proj-1', 'Projeto Amazônia Verde', 'Reflorestamento na região amazônica com espécies nativas', 'Amazonas, Brasil', 'reforestation', 25.00, 100000, 85000, '["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"]', 'active'),
('proj-2', 'Restauração Mata Atlântica', 'Recuperação de áreas degradadas da Mata Atlântica', 'São Paulo, Brasil', 'restoration', 30.00, 50000, 42000, '["https://images.unsplash.com/photo-1569163139134-de3c2e8e0c0f?w=800"]', 'active'),
('proj-3', 'Conservação do Cerrado', 'Preservação e restauração do bioma Cerrado', 'Goiás, Brasil', 'conservation', 20.00, 75000, 67000, '["https://images.unsplash.com/photo-1544550285-f813152fb2fd?w=800"]', 'active'),
('proj-4', 'Projeto Carbono Azul', 'Restauração de manguezais e ecossistemas costeiros', 'Bahia, Brasil', 'blue-carbon', 35.00, 30000, 28000, '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]', 'active')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO social_projects (id, title, description, location, category, budget, beneficiaries, status, images) VALUES
('social-1', 'Educação Ambiental Rural', 'Programa de educação ambiental para comunidades rurais', 'Interior do Brasil', 'education', 150000.00, 500, 'active', '["https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800"]'),
('social-2', 'Capacitação em Agrofloresta', 'Treinamento de agricultores em técnicas agroflorestais', 'Várias regiões', 'training', 200000.00, 300, 'active', '["https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800"]'),
('social-3', 'Pesquisa em Biodiversidade', 'Estudos científicos sobre biodiversidade em áreas restauradas', 'Universidades parceiras', 'research', 300000.00, 50, 'active', '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"]'),
('social-4', 'Desenvolvimento Comunitário', 'Apoio ao desenvolvimento sustentável de comunidades locais', 'Comunidades rurais', 'community', 250000.00, 800, 'active', '["https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800"]')
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    updated_at = CURRENT_TIMESTAMP;