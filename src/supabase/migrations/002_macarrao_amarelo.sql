-- 🍝 Tabela de Exemplo: Macarrão Amarelo
-- Criada para demonstração do sistema

-- Criar tabela macarrão_amarelo
CREATE TABLE IF NOT EXISTS public.macarrao_amarelo (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- 5 Tipos de Massas
    espaguete TEXT DEFAULT 'Massa longa e fina, ideal para molhos leves',
    penne TEXT DEFAULT 'Massa em formato de canudo, perfeita para molhos cremosos',
    fusilli TEXT DEFAULT 'Massa em espiral, retém bem os molhos',
    farfalle TEXT DEFAULT 'Massa em formato de gravatinha, versátil',
    rigatoni TEXT DEFAULT 'Massa tubular grande, ideal para gratinados',
    
    -- Metadados
    cor TEXT DEFAULT 'amarelo',
    ingrediente_principal TEXT DEFAULT 'trigo durum',
    tempo_cozimento INTEGER DEFAULT 8, -- minutos
    porcao_recomendada INTEGER DEFAULT 100, -- gramas
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca
CREATE INDEX idx_macarrao_amarelo_cor ON public.macarrao_amarelo(cor);
CREATE INDEX idx_macarrao_amarelo_created_at ON public.macarrao_amarelo(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_macarrao_amarelo_updated_at 
BEFORE UPDATE ON public.macarrao_amarelo 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo dos 5 tipos de massa
INSERT INTO public.macarrao_amarelo (
    id,
    espaguete,
    penne,
    fusilli,
    farfalle,
    rigatoni,
    cor,
    ingrediente_principal,
    tempo_cozimento,
    porcao_recomendada
) VALUES (
    uuid_generate_v4(),
    'Espaguete: Massa longa e fina, perfeita com molho de tomate, carbonara ou alho e óleo. Tempo de cozimento: 8-10 minutos',
    'Penne: Massa tubular com pontas cortadas, ideal para molho à bolonhesa, arrabbiata e molhos cremosos. Tempo de cozimento: 11-13 minutos',
    'Fusilli: Massa em formato espiral, excelente para saladas frias, molhos com pedaços de carne ou vegetais. Tempo de cozimento: 10-12 minutos',
    'Farfalle (Gravatinha): Massa em formato de laço, ótima para molhos leves, saladas e pratos com salmão. Tempo de cozimento: 10-12 minutos',
    'Rigatoni: Massa tubular grande com estrias, perfeita para molhos encorpados, gratinados e massas assadas. Tempo de cozimento: 12-15 minutos',
    'amarelo dourado',
    'Sêmola de trigo durum (grano duro)',
    10,
    100
) ON CONFLICT (id) DO NOTHING;

-- Comentários na tabela
COMMENT ON TABLE public.macarrao_amarelo IS 'Tabela de demonstração contendo 5 tipos clássicos de massa italiana';
COMMENT ON COLUMN public.macarrao_amarelo.espaguete IS 'Descrição e características da massa espaguete';
COMMENT ON COLUMN public.macarrao_amarelo.penne IS 'Descrição e características da massa penne';
COMMENT ON COLUMN public.macarrao_amarelo.fusilli IS 'Descrição e características da massa fusilli';
COMMENT ON COLUMN public.macarrao_amarelo.farfalle IS 'Descrição e características da massa farfalle';
COMMENT ON COLUMN public.macarrao_amarelo.rigatoni IS 'Descrição e características da massa rigatoni';

-- Habilitar RLS (Row Level Security) - opcional
ALTER TABLE public.macarrao_amarelo ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access" 
ON public.macarrao_amarelo 
FOR SELECT 
USING (true);

-- Política para permitir inserção apenas por usuários autenticados
CREATE POLICY "Allow authenticated insert" 
ON public.macarrao_amarelo 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir atualização apenas por admins
CREATE POLICY "Allow admin update" 
ON public.macarrao_amarelo 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Verificação
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'macarrao_amarelo'
    ) THEN
        RAISE NOTICE '✅ Tabela macarrao_amarelo criada com sucesso!';
        RAISE NOTICE '🍝 5 tipos de massa configurados: Espaguete, Penne, Fusilli, Farfalle, Rigatoni';
    ELSE
        RAISE NOTICE '❌ Erro ao criar tabela macarrao_amarelo';
    END IF;
END $$;
