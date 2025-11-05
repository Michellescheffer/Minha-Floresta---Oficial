// Utilitário para geração e validação de UUIDs v4

/**
 * Gera um UUID v4 válido
 * @returns string UUID v4 no formato xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Valida se uma string é um UUID v4 válido
 * @param id - String a ser validada
 * @returns boolean - true se for um UUID v4 válido
 */
export function isValidUUIDv4(id: string): boolean {
  // UUID v4 deve ter exatamente este formato:
  // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // onde:
  // - O 13º caractere deve ser "4" (versão 4)
  // - O 17º caractere deve ser "8", "9", "a", ou "b" (variante RFC 4122)
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidv4Regex.test(id);
}

/**
 * Valida se uma string é um UUID válido (qualquer versão)
 * @param id - String a ser validada
 * @returns boolean - true se for um UUID válido
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Converte um ID antigo (numérico) para UUID v4
 * @param oldId - ID antigo (string ou número)
 * @returns string - Novo UUID v4
 */
export function migrateOldIdToUUID(oldId: string | number): string {
  // Para manter consistência, podemos criar um UUID baseado no ID antigo
  // mas garantindo que seja um UUID v4 válido
  const seed = typeof oldId === 'string' ? oldId : oldId.toString();
  
  // Gerar UUID v4 determinístico baseado no ID antigo (para consistência)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Usar o hash como seed para gerar um UUID v4 válido
  const random = () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Mapeamento de IDs antigos para novos UUIDs v4 (para consistência)
 */
export const legacyIdMappings: { [key: string]: string } = {
  '1': '550e8400-e29b-41d4-a716-446655440001',
  '2': '550e8400-e29b-41d4-a716-446655440002',
  '3': '550e8400-e29b-41d4-a716-446655440003',
  '4': '550e8400-e29b-41d4-a716-446655440004',
  '5': '550e8400-e29b-41d4-a716-446655440005'
};

/**
 * Converte um ID antigo para o UUID correspondente usando o mapeamento
 * @param oldId - ID antigo
 * @returns string - UUID correspondente ou novo UUID se não encontrado
 */
export function convertLegacyId(oldId: string): string {
  if (legacyIdMappings[oldId]) {
    return legacyIdMappings[oldId];
  }
  
  // Se não estiver no mapeamento, gerar novo UUID
  return migrateOldIdToUUID(oldId);
}

/**
 * Verifica se um ID é um ID antigo (numérico)
 * @param id - ID a ser verificado
 * @returns boolean - true se for um ID antigo
 */
export function isLegacyId(id: string): boolean {
  return /^\d+$/.test(id);
}

/**
 * Normaliza um ID para UUID v4
 * @param id - ID a ser normalizado
 * @returns string - UUID v4 válido
 */
export function normalizeToUUID(id: string): string {
  // Se já é um UUID v4 válido, retornar como está
  if (isValidUUIDv4(id)) {
    return id;
  }
  
  // Se é um ID antigo conhecido, usar o mapeamento
  if (isLegacyId(id) && legacyIdMappings[id]) {
    return legacyIdMappings[id];
  }
  
  // Se é um UUID inválido ou ID desconhecido, gerar novo
  return generateUUID();
}