-- ============================================================================
-- MIGRAÇÃO 005: TABELAS STRIPE
-- ============================================================================
-- Descrição: Cria tabelas para integração completa com Stripe
-- Data: 2025-11-04
-- Autor: Minha Floresta Conservações
-- ============================================================================

-- ============================================================================
-- 1. TABELA: stripe_payment_intents
-- ============================================================================
-- Armazena todos os Payment Intents criados no Stripe
-- Relaciona com purchases ou donations

CREATE TABLE IF NOT EXISTS stripe_payment_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Stripe IDs
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_client_secret TEXT,
    
    -- Relacionamentos (um dos dois será preenchido)
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
    
    -- Valores
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'brl',
    
    -- Status
    status TEXT NOT NULL CHECK (status IN (
        'requires_payment_method',
        'requires_confirmation',
        'requires_action',
        'processing',
        'requires_capture',
        'canceled',
        'succeeded'
    )),
    
    -- Metadata adicional do Stripe
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_stripe_payment_intents_stripe_id ON stripe_payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_stripe_payment_intents_purchase ON stripe_payment_intents(purchase_id);
CREATE INDEX idx_stripe_payment_intents_donation ON stripe_payment_intents(donation_id);
CREATE INDEX idx_stripe_payment_intents_status ON stripe_payment_intents(status);

-- RLS: Apenas service_role pode manipular
ALTER TABLE stripe_payment_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on payment intents"
ON stripe_payment_intents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users podem ver seus próprios payment intents (via purchases)
CREATE POLICY "Users can view own payment intents"
ON stripe_payment_intents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM purchases 
        WHERE purchases.id = stripe_payment_intents.purchase_id 
        AND purchases.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM donations 
        WHERE donations.id = stripe_payment_intents.donation_id 
        AND donations.user_id = auth.uid()
    )
);

COMMENT ON TABLE stripe_payment_intents IS 'Armazena Payment Intents do Stripe para rastreamento';

-- ============================================================================
-- 2. TABELA: stripe_events
-- ============================================================================
-- Log de todos os webhooks recebidos do Stripe
-- Implementa idempotência e auditoria

CREATE TABLE IF NOT EXISTS stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Stripe Event ID (único para idempotência)
    stripe_event_id TEXT UNIQUE NOT NULL,
    
    -- Tipo do evento
    event_type TEXT NOT NULL,
    
    -- Payload completo do webhook
    event_data JSONB NOT NULL,
    
    -- Processamento
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Erros (se houver)
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_stripe_events_event_id ON stripe_events(stripe_event_id);
CREATE INDEX idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed);
CREATE INDEX idx_stripe_events_created ON stripe_events(created_at DESC);

-- RLS: Apenas service_role
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on events"
ON stripe_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins podem ver eventos
CREATE POLICY "Admins can view events"
ON stripe_events FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

COMMENT ON TABLE stripe_events IS 'Log de webhooks do Stripe para idempotência e auditoria';

-- ============================================================================
-- 3. TABELA: stripe_subscriptions
-- ============================================================================
-- Gerencia assinaturas recorrentes (doações mensais)

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Stripe IDs
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    
    -- Usuário
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Projeto sendo apoiado
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Valores
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'brl',
    
    -- Intervalo
    interval TEXT CHECK (interval IN ('monthly', 'quarterly', 'yearly')),
    
    -- Status
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'paused', 'incomplete', 'trialing')),
    
    -- Período atual
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Cancelamento
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Total doado até agora
    total_donated DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX idx_stripe_subscriptions_user ON stripe_subscriptions(user_id);
CREATE INDEX idx_stripe_subscriptions_project ON stripe_subscriptions(project_id);
CREATE INDEX idx_stripe_subscriptions_status ON stripe_subscriptions(status);

-- RLS
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subscriptions"
ON stripe_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users veem apenas suas próprias subscriptions
CREATE POLICY "Users can view own subscriptions"
ON stripe_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users podem cancelar suas próprias subscriptions
CREATE POLICY "Users can update own subscriptions"
ON stripe_subscriptions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE stripe_subscriptions IS 'Gerencia assinaturas recorrentes do Stripe';

-- ============================================================================
-- 4. MODIFICAÇÕES EM TABELAS EXISTENTES
-- ============================================================================

-- Adicionar campos Stripe em purchases
DO $$ 
BEGIN
    -- stripe_payment_intent_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE purchases ADD COLUMN stripe_payment_intent_id TEXT;
        CREATE INDEX idx_purchases_stripe_pi ON purchases(stripe_payment_intent_id);
    END IF;

    -- stripe_charge_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'stripe_charge_id'
    ) THEN
        ALTER TABLE purchases ADD COLUMN stripe_charge_id TEXT;
    END IF;

    -- stripe_customer_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE purchases ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- Campos de reembolso
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'refund_id'
    ) THEN
        ALTER TABLE purchases ADD COLUMN refund_id TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'refund_reason'
    ) THEN
        ALTER TABLE purchases ADD COLUMN refund_reason TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'refund_amount'
    ) THEN
        ALTER TABLE purchases ADD COLUMN refund_amount DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'refund_date'
    ) THEN
        ALTER TABLE purchases ADD COLUMN refund_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Adicionar campos Stripe em donations
DO $$ 
BEGIN
    -- stripe_payment_intent_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE donations ADD COLUMN stripe_payment_intent_id TEXT;
        CREATE INDEX idx_donations_stripe_pi ON donations(stripe_payment_intent_id);
    END IF;

    -- stripe_subscription_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE donations ADD COLUMN stripe_subscription_id TEXT;
        CREATE INDEX idx_donations_stripe_sub ON donations(stripe_subscription_id);
    END IF;

    -- is_recurring
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'donations' AND column_name = 'is_recurring'
    ) THEN
        ALTER TABLE donations ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ============================================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Trigger para stripe_payment_intents
CREATE OR REPLACE FUNCTION update_stripe_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stripe_payment_intents_updated_at
    BEFORE UPDATE ON stripe_payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_stripe_payment_intents_updated_at();

-- Trigger para stripe_subscriptions
CREATE OR REPLACE FUNCTION update_stripe_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stripe_subscriptions_updated_at
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_stripe_subscriptions_updated_at();

-- ============================================================================
-- 6. VIEWS ÚTEIS
-- ============================================================================

-- View: Transações completas com Stripe
CREATE OR REPLACE VIEW stripe_transactions AS
SELECT 
    p.id,
    p.user_id,
    p.total_amount,
    p.payment_status,
    p.stripe_payment_intent_id,
    p.stripe_charge_id,
    p.created_at,
    'purchase' AS transaction_type,
    spi.status AS stripe_status,
    spi.metadata AS stripe_metadata
FROM purchases p
LEFT JOIN stripe_payment_intents spi ON spi.purchase_id = p.id
WHERE p.stripe_payment_intent_id IS NOT NULL

UNION ALL

SELECT 
    d.id,
    d.user_id,
    d.amount AS total_amount,
    d.payment_status,
    d.stripe_payment_intent_id,
    NULL AS stripe_charge_id,
    d.created_at,
    'donation' AS transaction_type,
    spi.status AS stripe_status,
    spi.metadata AS stripe_metadata
FROM donations d
LEFT JOIN stripe_payment_intents spi ON spi.donation_id = d.id
WHERE d.stripe_payment_intent_id IS NOT NULL;

COMMENT ON VIEW stripe_transactions IS 'View consolidada de todas as transações Stripe';

-- ============================================================================
-- 7. FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função: Marcar evento Stripe como processado
CREATE OR REPLACE FUNCTION mark_stripe_event_processed(
    event_id TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE stripe_events
    SET 
        processed = success,
        processed_at = now(),
        error = error_message
    WHERE stripe_event_id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Obter próximo período de subscription
CREATE OR REPLACE FUNCTION get_next_subscription_period(
    subscription_id UUID
)
RETURNS TABLE (
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    sub_record RECORD;
BEGIN
    SELECT * INTO sub_record
    FROM stripe_subscriptions
    WHERE id = subscription_id;

    IF sub_record.interval = 'monthly' THEN
        RETURN QUERY SELECT 
            sub_record.current_period_end,
            sub_record.current_period_end + INTERVAL '1 month';
    ELSIF sub_record.interval = 'quarterly' THEN
        RETURN QUERY SELECT 
            sub_record.current_period_end,
            sub_record.current_period_end + INTERVAL '3 months';
    ELSIF sub_record.interval = 'yearly' THEN
        RETURN QUERY SELECT 
            sub_record.current_period_end,
            sub_record.current_period_end + INTERVAL '1 year';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. AUDIT LOG
-- ============================================================================

-- Adicionar ao audit_logs quando houver mudanças importantes em Stripe
CREATE OR REPLACE FUNCTION log_stripe_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (
            action,
            table_name,
            record_id,
            user_id,
            details
        ) VALUES (
            'stripe_status_changed',
            TG_TABLE_NAME,
            NEW.id,
            NULL, -- Sistema
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'stripe_id', COALESCE(NEW.stripe_payment_intent_id, NEW.stripe_subscription_id)
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_payment_intent_changes
    AFTER UPDATE ON stripe_payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION log_stripe_status_change();

CREATE TRIGGER trigger_log_subscription_changes
    AFTER UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_stripe_status_change();

-- ============================================================================
-- MIGRAÇÃO COMPLETA
-- ============================================================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Migração 005 concluída com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas:';
    RAISE NOTICE '   - stripe_payment_intents';
    RAISE NOTICE '   - stripe_events';
    RAISE NOTICE '   - stripe_subscriptions';
    RAISE NOTICE '🔧 Tabelas modificadas:';
    RAISE NOTICE '   - purchases (+ 7 colunas Stripe)';
    RAISE NOTICE '   - donations (+ 3 colunas Stripe)';
    RAISE NOTICE '🔒 RLS habilitado em todas as tabelas';
    RAISE NOTICE '👁️  View criada: stripe_transactions';
    RAISE NOTICE '⚙️  Funções utilitárias criadas';
END $$;
