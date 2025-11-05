/**
 * 🌱 Minha Floresta Conservações - Schema PostgreSQL Completo
 * 
 * Migração inicial do sistema híbrido com todas as tabelas necessárias
 * para funcionalidade completa do e-commerce de reflorestamento
 */

-- =====================================
-- 🔐 EXTENSÕES E CONFIGURAÇÕES
-- =====================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- 👥 SISTEMA DE USUÁRIOS
-- =====================================

-- Perfis de usuário (complementa auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address JSONB, -- {street, city, state, country, postal_code}
    preferences JSONB, -- {notifications, language, theme}
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'enterprise')),
    total_co2_offset DECIMAL(10,2) DEFAULT 0,
    total_donated DECIMAL(10,2) DEFAULT 0,
    total_purchased_area DECIMAL(10,2) DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.user_profiles(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 🌳 PROJETOS DE REFLORESTAMENTO
-- =====================================

-- Projetos principais
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    long_description TEXT,
    category TEXT NOT NULL CHECK (category IN ('reforestation', 'conservation', 'restoration', 'blue_carbon', 'social')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'planning')),
    
    -- Localização
    location JSONB NOT NULL, -- {country, state, city, coordinates, region}
    
    -- Métricas do projeto
    total_area DECIMAL(12,2) NOT NULL, -- metros quadrados totais
    available_area DECIMAL(12,2) NOT NULL, -- área disponível para venda
    sold_area DECIMAL(12,2) DEFAULT 0, -- área já vendida
    price_per_sqm DECIMAL(8,2) NOT NULL, -- preço por metro quadrado
    
    -- Impacto ambiental
    co2_absorption_per_sqm DECIMAL(8,4) DEFAULT 0.023, -- kg CO2/m²/ano
    biodiversity_score INTEGER DEFAULT 0 CHECK (biodiversity_score BETWEEN 0 AND 100),
    water_conservation_impact TEXT,
    soil_improvement_impact TEXT,
    
    -- Dados técnicos
    species_planted JSONB, -- [{name, scientific_name, quantity, native}]
    planting_date DATE,
    expected_maturity_years INTEGER DEFAULT 20,
    certification_types JSONB, -- ['FSC', 'REDD+', 'VCS']
    
    -- Mídia
    images JSONB, -- ['{url, alt, is_primary}']
    videos JSONB, -- [{url, title, duration}]
    documents JSONB, -- [{url, title, type}]
    
    -- Monitoramento
    monitoring_frequency TEXT DEFAULT 'monthly',
    last_monitoring_date DATE,
    monitoring_reports JSONB,
    
    -- Social impact
    communities_benefited INTEGER DEFAULT 0,
    jobs_created INTEGER DEFAULT 0,
    social_programs JSONB,
    
    -- Metadados
    featured BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    tags JSONB, -- ['sustainable', 'native', 'biodiversity']
    seo_metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Imagens dos projetos (múltiplas imagens por projeto)
CREATE TABLE public.project_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    metadata JSONB, -- {size, format, dimensions}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 🛒 SISTEMA DE E-COMMERCE
-- =====================================

-- Carrinho de compras
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    area_sqm DECIMAL(10,2) NOT NULL,
    price_per_sqm DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (area_sqm * price_per_sqm) STORED,
    session_id TEXT, -- Para carrinho de usuários não logados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, project_id)
);

-- Pedidos/Compras
CREATE TABLE public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Dados do pedido
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    
    -- Financeiro
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    
    -- Pagamento
    payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer'
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_id TEXT, -- Stripe payment intent ID
    payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Dados de envio (para certificados físicos)
    shipping_address JSONB,
    shipping_method TEXT,
    shipping_cost DECIMAL(8,2) DEFAULT 0,
    tracking_number TEXT,
    
    -- Metadados
    metadata JSONB,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itens do pedido
CREATE TABLE public.purchase_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    area_sqm DECIMAL(10,2) NOT NULL,
    price_per_sqm DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Dados do projeto no momento da compra
    project_snapshot JSONB, -- Snapshot dos dados do projeto
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 📜 SISTEMA DE CERTIFICADOS
-- =====================================

-- Certificados gerados
CREATE TABLE public.certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Dados do certificado
    certificate_type TEXT DEFAULT 'ownership' CHECK (certificate_type IN ('ownership', 'co2_offset', 'donation')),
    area_sqm DECIMAL(10,2) NOT NULL,
    co2_offset_amount DECIMAL(10,2), -- kg CO2 compensado
    
    -- Verificação MRV
    mrv_hash TEXT UNIQUE, -- Hash para verificação blockchain-like
    verification_code TEXT UNIQUE,
    qr_code_data TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    
    -- Arquivos
    pdf_url TEXT,
    image_url TEXT,
    
    -- Dados de verificação
    verification_count INTEGER DEFAULT 0,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log de verificações de certificado
CREATE TABLE public.certificate_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
    verified_by_ip TEXT,
    verified_by_user UUID REFERENCES public.user_profiles(id),
    verification_method TEXT, -- 'qr_code', 'certificate_number', 'verification_code'
    success BOOLEAN NOT NULL,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 🧮 CALCULADORA DE PEGADA DE CARBONO
-- =====================================

-- Cálculos salvos
CREATE TABLE public.carbon_calculations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    session_id TEXT, -- Para usuários não logados
    
    -- Dados da calculadora
    calculation_type TEXT NOT NULL, -- 'personal', 'business', 'event'
    input_data JSONB NOT NULL, -- Dados inseridos pelo usuário
    
    -- Resultados
    total_co2_kg DECIMAL(10,2) NOT NULL,
    breakdown JSONB NOT NULL, -- Detalhamento por categoria
    recommendations JSONB, -- Recomendações de projetos
    
    -- Metadata
    calculator_version TEXT DEFAULT '1.0',
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 💝 SISTEMA DE DOAÇÕES
-- =====================================

-- Doações para projetos
CREATE TABLE public.donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Dados da doação
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    donation_type TEXT DEFAULT 'monetary' CHECK (donation_type IN ('monetary', 'area', 'equipment')),
    
    -- Pagamento
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id TEXT,
    
    -- Doador
    donor_name TEXT,
    donor_email TEXT,
    donor_message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT, -- 'monthly', 'quarterly', 'yearly'
    
    -- Certificado de doação
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_id UUID REFERENCES public.certificates(id),
    
    -- Metadados
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 📊 PROJETOS SOCIAIS
-- =====================================

-- Projetos sociais específicos
CREATE TABLE public.social_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location JSONB,
    
    -- Impacto social
    beneficiaries_count INTEGER DEFAULT 0,
    communities_involved INTEGER DEFAULT 0,
    education_programs JSONB,
    health_programs JSONB,
    economic_programs JSONB,
    
    -- Relacionamento com projetos de reflorestamento
    related_project_id UUID REFERENCES public.projects(id),
    
    -- Status e métricas
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    funds_raised DECIMAL(12,2) DEFAULT 0,
    
    -- Mídia
    images JSONB,
    videos JSONB,
    reports JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 🔔 SISTEMA DE NOTIFICAÇÕES
-- =====================================

-- Notificações para usuários
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Conteúdo
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'promotion')),
    
    -- Categoria
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'purchase', 'certificate', 'project', 'system')),
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    
    -- Ação
    action_url TEXT,
    action_label TEXT,
    
    -- Delivery
    delivery_method JSONB, -- ['in_app', 'email', 'sms', 'push']
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================
-- ⚙️ CONFIGURAÇÕES DO SISTEMA
-- =====================================

-- Configurações globais
CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de auditoria
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 📈 MÉTRICAS E ANALYTICS
-- =====================================

-- Analytics de uso
CREATE TABLE public.usage_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id),
    session_id TEXT,
    
    -- Evento
    event_name TEXT NOT NULL,
    event_category TEXT,
    event_data JSONB,
    
    -- Contexto
    page_url TEXT,
    referrer TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- 🔍 ÍNDICES PARA PERFORMANCE
-- =====================================

-- Índices principais
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_featured ON public.projects(featured);
CREATE INDEX idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchase_items_purchase_id ON public.purchase_items(purchase_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX idx_certificates_verification_code ON public.certificates(verification_code);
CREATE INDEX idx_carbon_calculations_user_id ON public.carbon_calculations(user_id);
CREATE INDEX idx_donations_user_id ON public.donations(user_id);
CREATE INDEX idx_donations_project_id ON public.donations(project_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_usage_analytics_user_id ON public.usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_event_name ON public.usage_analytics(event_name);

-- Índices compostos para queries comuns
CREATE INDEX idx_purchases_user_status ON public.purchases(user_id, status);
CREATE INDEX idx_certificates_user_status ON public.certificates(user_id, status);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- =====================================
-- 🔄 TRIGGERS PARA ATUALIZAÇÃO
-- =====================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_projects_updated_at BEFORE UPDATE ON public.social_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- 🛡️ ROW LEVEL SECURITY (RLS)
-- =====================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
);

-- Políticas RLS para cart_items
CREATE POLICY "Users can manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para purchases
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all purchases" ON public.purchases FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
);

-- Políticas RLS para certificates
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Certificate verification is public" ON public.certificate_verifications FOR SELECT USING (true);

-- Políticas RLS para notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- 📊 CONFIGURAÇÕES INICIAIS
-- =====================================

-- Configurações padrão do sistema
INSERT INTO public.app_settings (key, value, description, category, is_public) VALUES
('site_name', '"Minha Floresta Conservações"', 'Nome do site', 'general', true),
('site_description', '"Compre seu próprio oxigênio através de projetos de reflorestamento sustentável"', 'Descrição do site', 'general', true),
('default_co2_absorption', '0.023', 'Absorção padrão de CO2 por m²/ano em kg', 'calculations', true),
('default_currency', '"BRL"', 'Moeda padrão', 'commerce', true),
('min_purchase_area', '1', 'Área mínima de compra em m²', 'commerce', true),
('max_purchase_area', '10000', 'Área máxima de compra em m²', 'commerce', true),
('certificate_validity_years', '50', 'Validade dos certificados em anos', 'certificates', true),
('notification_retention_days', '90', 'Dias para manter notificações', 'notifications', false),
('analytics_retention_days', '365', 'Dias para manter analytics', 'analytics', false);

-- Usuário admin padrão (será criado via auth depois)
-- INSERT INTO public.user_profiles (id, email, full_name, role) VALUES
-- ('00000000-0000-0000-0000-000000000000', 'admin@minhaflorestaconservacoes.com', 'Administrador', 'admin');

-- =====================================
-- ✅ VERIFICAÇÃO FINAL
-- =====================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'user_profiles', 'projects', 'project_images', 'cart_items', 
        'purchases', 'purchase_items', 'certificates', 'certificate_verifications',
        'carbon_calculations', 'donations', 'social_projects', 'notifications',
        'app_settings', 'audit_logs', 'usage_analytics'
    );
    
    IF table_count = 15 THEN
        RAISE NOTICE '✅ Todas as 15 tabelas foram criadas com sucesso!';
    ELSE
        RAISE NOTICE '❌ Erro: Apenas % tabelas foram criadas de 15 esperadas', table_count;
    END IF;
END $$;