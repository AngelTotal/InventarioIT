<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define FTP directory
$ftpDir = __DIR__ . '/../../ftp_files';

// Create directory if it doesn't exist
if (!file_exists($ftpDir)) {
    mkdir($ftpDir, 0777, true);
}

// Alias file path
$aliasFile = $ftpDir . '/file_aliases.json';

// Helper functions for aliases
function getAliases($aliasFile) {
    if (!file_exists($aliasFile)) {
        return [];
    }
    $content = file_get_contents($aliasFile);
    $data = json_decode($content, true);
    return $data['file_aliases'] ?? [];
}

function saveAliases($aliasFile, $aliases) {
    $data = ['file_aliases' => $aliases];
    return file_put_contents($aliasFile, json_encode($data, JSON_PRETTY_PRINT));
}

function getMetadata($filename, $aliases) {
    if (isset($aliases[$filename])) {
        if (is_array($aliases[$filename])) {
            return $aliases[$filename];
        } else {
            // Backward compatibility
            return ['displayName' => $aliases[$filename], 'comments' => ''];
        }
    }
    return ['displayName' => $filename, 'comments' => ''];
}

// GET - List files
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $files = [];
    $aliases = getAliases($aliasFile);
    
    if (is_dir($ftpDir)) {
        $items = scandir($ftpDir);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..' || $item === 'file_aliases.json') continue;
            
            $filePath = $ftpDir . '/' . $item;
            
            if (is_file($filePath)) {
                $meta = getMetadata($item, $aliases);
                $files[] = [
                    'name' => $item,
                    'displayName' => $meta['displayName'],
                    'comments' => $meta['comments'] ?? '',
                    'size' => filesize($filePath),
                    'date' => date('Y-m-d H:i:s', filemtime($filePath)),
                    'url' => 'ftp_files/' . $item
                ];
            }
        }
    }
    
    // Sort by date (newest first)
    usort($files, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
    
    echo json_encode($files);
    exit();
}

// POST - Upload file
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No se recibió ningún archivo']);
        exit();
    }
    
    $file = $_FILES['file'];
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Error al subir el archivo']);
        exit();
    }
    
    // Sanitize filename
    $filename = basename($file['name']);
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
    
    $destination = $ftpDir . '/' . $filename;
    
    // Check if file already exists
    if (file_exists($destination)) {
        // Add timestamp to filename
        $pathInfo = pathinfo($filename);
        $filename = $pathInfo['filename'] . '_' . time() . '.' . $pathInfo['extension'];
        $destination = $ftpDir . '/' . $filename;
    }
    
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        echo json_encode([
            'success' => true,
            'message' => 'Archivo subido exitosamente',
            'filename' => $filename
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al guardar el archivo']);
    }
    exit();
}

// PUT - Update file alias
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['filename']) || !isset($input['displayName'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit();
    }
    
    $filename = basename($input['filename']);
    $displayName = trim($input['displayName']);
    
    // Verify file exists
    $filePath = $ftpDir . '/' . $filename;
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Archivo no encontrado']);
        exit();
    }
    
    // Load current aliases
    $aliases = getAliases($aliasFile);
    
    // Set new metadata
    $aliases[$filename] = [
        'displayName' => $displayName,
        'comments' => $input['comments'] ?? ''
    ];
    
    // Save aliases
    if (saveAliases($aliasFile, $aliases)) {
        echo json_encode([
            'success' => true,
            'message' => 'Metadata actualizada exitosamente',
            'displayName' => $displayName,
            'comments' => $input['comments'] ?? ''
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al guardar la metadata']);
    }
    exit();
}

// DELETE - Delete file
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $filename = $_GET['file'] ?? '';
    
    if (empty($filename)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nombre de archivo no especificado']);
        exit();
    }
    
    // Sanitize filename
    $filename = basename($filename);
    $filePath = $ftpDir . '/' . $filename;
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Archivo no encontrado']);
        exit();
    }
    
    if (unlink($filePath)) {
        // Also remove alias if exists
        $aliases = getAliases($aliasFile);
        if (isset($aliases[$filename])) {
            unset($aliases[$filename]);
            saveAliases($aliasFile, $aliases);
        }
        
        echo json_encode(['success' => true, 'message' => 'Archivo eliminado exitosamente']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el archivo']);
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método no permitido']);
