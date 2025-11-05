<?php
/**
 * API PHP para Hostinger - Minha Floresta Conservações
 * Funciona em QUALQUER plano da Hostinger
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://minhafloresta.ampler.me');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Lidar com preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuração do banco de dados
$DB_CONFIG = [
    'host' => 'sql10.freesqldatabase.com',
    'username' => 'u271208684_minhafloresta',
    'password' => 'B7Jz/vu~4s|Q',
    'database' => 'u271208684_minhafloresta',
    'port' => 3306
];

// Classe para resposta JSON
class APIResponse {
    public static function success($data = null, $message = null) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'timestamp' => date('c')
        ]);
        exit();
    }
    
    public static function error($message, $code = 400, $details = null) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message,
            'details' => $details,
            'timestamp' => date('c')
        ]);
        exit();
    }
}

// Classe para conexão com banco
class Database {
    private $connection;
    
    public function __construct($config) {
        try {
            $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['database']};charset=utf8mb4";
            $this->connection = new PDO($dsn, $config['username'], $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            APIResponse::error('Erro de conexão com banco de dados', 500, $e->getMessage());
        }
    }
    
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            APIResponse::error('Erro na consulta', 500, $e->getMessage());
        }
    }
    
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
    
    public function ping() {
        try {
            $this->connection->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}

// Roteador simples
class Router {
    private $routes = [];
    
    public function get($path, $callback) {
        $this->routes['GET'][$path] = $callback;
    }
    
    public function post($path, $callback) {
        $this->routes['POST'][$path] = $callback;
    }
    
    public function run() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = str_replace('/backend/api', '', $path); // Remover prefixo
        
        if (isset($this->routes[$method][$path])) {
            call_user_func($this->routes[$method][$path]);
        } else {
            APIResponse::error('Endpoint não encontrado', 404);
        }
    }
}

// Inicializar
$db = new Database($DB_CONFIG);
$router = new Router();

// ==========================================
// DEFINIR ROTAS
// ==========================================

// Status da API
$router->get('/', function() use ($db) {
    $status = $db->ping();
    APIResponse::success([
        'status' => $status ? 'online' : 'offline',
        'database' => $status ? 'connected' : 'disconnected',
        'server' => 'Hostinger PHP',
        'version' => '1.0.0'
    ]);
});

$router->get('/status', function() use ($db) {
    $status = $db->ping();
    APIResponse::success([
        'status' => $status ? 'online' : 'offline',
        'database' => $status ? 'connected' : 'disconnected',
        'server' => 'Hostinger PHP',
        'version' => '1.0.0'
    ]);
});

// Listar projetos
$router->get('/projects', function() use ($db) {
    $stmt = $db->query("
        SELECT 
            p.*,
            COUNT(c.id) as total_certificates,
            COALESCE(SUM(c.area_m2), 0) as total_area_sold,
            (p.total_area_m2 - COALESCE(SUM(c.area_m2), 0)) as available_area
        FROM projects p
        LEFT JOIN certificates c ON p.id = c.project_id AND c.status = 'active'
        WHERE p.status = 'active'
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ");
    
    $projects = $stmt->fetchAll();
    APIResponse::success($projects);
});

// Projeto específico
$router->get('/projects/{id}', function() use ($db) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        APIResponse::error('ID do projeto requerido', 400);
    }
    
    $stmt = $db->query("
        SELECT 
            p.*,
            COUNT(c.id) as total_certificates,
            COALESCE(SUM(c.area_m2), 0) as total_area_sold,
            (p.total_area_m2 - COALESCE(SUM(c.area_m2), 0)) as available_area
        FROM projects p
        LEFT JOIN certificates c ON p.id = c.project_id AND c.status = 'active'
        WHERE p.id = ? AND p.status = 'active'
        GROUP BY p.id
    ", [$id]);
    
    $project = $stmt->fetch();
    if (!$project) {
        APIResponse::error('Projeto não encontrado', 404);
    }
    
    APIResponse::success($project);
});

// Criar certificado
$router->post('/certificates', function() use ($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['project_id', 'buyer_name', 'buyer_email', 'area_m2', 'total_price'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            APIResponse::error("Campo obrigatório: {$field}", 400);
        }
    }
    
    // Verificar disponibilidade
    $stmt = $db->query("
        SELECT 
            p.total_area_m2,
            COALESCE(SUM(c.area_m2), 0) as sold_area
        FROM projects p
        LEFT JOIN certificates c ON p.id = c.project_id AND c.status = 'active'
        WHERE p.id = ? AND p.status = 'active'
        GROUP BY p.id
    ", [$input['project_id']]);
    
    $project = $stmt->fetch();
    if (!$project) {
        APIResponse::error('Projeto não encontrado', 404);
    }
    
    $availableArea = $project['total_area_m2'] - $project['sold_area'];
    if ($input['area_m2'] > $availableArea) {
        APIResponse::error("Área disponível insuficiente. Disponível: {$availableArea}m²", 400);
    }
    
    // Gerar código único
    $certificateCode = 'MF' . time() . strtoupper(substr(md5(uniqid()), 0, 4));
    
    // Inserir certificado
    $stmt = $db->query("
        INSERT INTO certificates (
            project_id, certificate_code, buyer_name, buyer_email, 
            buyer_phone, area_m2, total_price, payment_method, 
            status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ", [
        $input['project_id'],
        $certificateCode,
        $input['buyer_name'],
        $input['buyer_email'],
        $input['buyer_phone'] ?? null,
        $input['area_m2'],
        $input['total_price'],
        $input['payment_method'] ?? 'pending'
    ]);
    
    APIResponse::success([
        'id' => $db->lastInsertId(),
        'certificate_code' => $certificateCode,
        'area_m2' => $input['area_m2'],
        'total_price' => $input['total_price']
    ], 'Certificado criado com sucesso');
});

// Buscar certificado
$router->get('/certificates/{code}', function() use ($db) {
    $code = $_GET['code'] ?? null;
    if (!$code) {
        APIResponse::error('Código do certificado requerido', 400);
    }
    
    $stmt = $db->query("
        SELECT 
            c.*,
            p.name as project_name,
            p.location as project_location,
            p.description as project_description
        FROM certificates c
        JOIN projects p ON c.project_id = p.id
        WHERE c.certificate_code = ?
    ", [$code]);
    
    $certificate = $stmt->fetch();
    if (!$certificate) {
        APIResponse::error('Certificado não encontrado', 404);
    }
    
    APIResponse::success($certificate);
});

// Calcular pegada de carbono
$router->post('/calculate-footprint', function() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $transport = $input['transport'] ?? [];
    $energy = $input['energy'] ?? [];
    $consumption = $input['consumption'] ?? [];
    $waste = $input['waste'] ?? [];
    
    // Cálculos simplificados
    $transportCO2 = ($transport['car_km'] ?? 0) * 0.12 + 
                    ($transport['plane_km'] ?? 0) * 0.25 +
                    ($transport['public_km'] ?? 0) * 0.04;
    
    $energyCO2 = ($energy['electricity_kwh'] ?? 0) * 0.5 +
                 ($energy['gas_m3'] ?? 0) * 2.3;
    
    $consumptionCO2 = ($consumption['food_score'] ?? 0) * 0.1 +
                      ($consumption['goods_score'] ?? 0) * 0.05;
    
    $wasteCO2 = ($waste['general_kg'] ?? 0) * 0.02 +
                ($waste['recyclable_kg'] ?? 0) * 0.01;
    
    $totalCO2 = $transportCO2 + $energyCO2 + $consumptionCO2 + $wasteCO2;
    $recommendedArea = ceil($totalCO2 / 10);
    
    APIResponse::success([
        'total_co2_kg_year' => $totalCO2,
        'breakdown' => [
            'transport' => $transportCO2,
            'energy' => $energyCO2,
            'consumption' => $consumptionCO2,
            'waste' => $wasteCO2
        ],
        'recommended_area_m2' => $recommendedArea,
        'estimated_cost' => $recommendedArea * 15,
        'trees_equivalent' => ceil($totalCO2 / 22)
    ]);
});

// ==========================================
// EXECUTAR ROTEADOR
// ==========================================

try {
    $router->run();
} catch (Exception $e) {
    APIResponse::error('Erro interno do servidor', 500, $e->getMessage());
}

?>