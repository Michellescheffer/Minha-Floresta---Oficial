// Debug utilities for testing API connectivity

export async function testAPIConnectivity() {
  const API_BASE_URL = 'http://localhost:3001/api';
  
  console.log('🔍 Testing API connectivity...');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend conectado:', data);
      return true;
    } else {
      console.log('❌ Backend retornou erro:', response.status);
      return false;
    }
  } catch (error) {
    console.log('ℹ️  Backend não encontrado - usando modo offline');
    console.log('ℹ️  Para conectar ao MySQL, execute:');
    console.log('   cd backend && npm install && npm run dev');
    return false;
  }
}

// Check if we're in development mode and show instructions
export function showBackendInstructions() {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
🚀 Para conectar ao banco MySQL, siga estes passos:

1. 📁 Abra um terminal na pasta do projeto
2. 📂 Navegue para a pasta backend:
   cd backend

3. 📦 Instale as dependências:
   npm install

4. 🗄️ Configure o banco de dados:
   npm run init-db

5. 🌱 Adicione dados de teste:
   npm run seed-db

6. ▶️ Inicie o servidor:
   npm run dev

7. 🔄 Recarregue esta página

✅ Quando conectado, você verá "Online - Conectado ao banco" no canto inferior direito.
❌ Sem o backend, o sistema funciona em modo offline com localStorage.
    `);
  }
}

// Test localStorage functionality
export function testLocalStorage() {
  try {
    const testKey = 'test_minha_floresta';
    const testValue = { test: true, timestamp: Date.now() };
    
    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
    localStorage.removeItem(testKey);
    
    if (retrieved.test === true) {
      console.log('✅ localStorage funcionando corretamente');
      return true;
    } else {
      console.log('❌ localStorage com problemas');
      return false;
    }
  } catch (error) {
    console.log('❌ localStorage não disponível:', error);
    return false;
  }
}

// Initialize debug checks
export function initializeDebug() {
  console.log('🌳 Minha Floresta Conservações - System Debug');
  
  testLocalStorage();
  testAPIConnectivity();
  showBackendInstructions();
}