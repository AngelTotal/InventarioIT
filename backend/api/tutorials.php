<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Sync files from directory to database
        $targetDir = "../../uploads/tutorials/";
        if (is_dir($targetDir)) {
            $files = glob($targetDir . "*.pdf");
            foreach ($files as $file) {
                $fileName = basename($file);
                $fileUrl = "uploads/tutorials/" . $fileName;
                
                // Check if already in database (check both possible column names)
                $stmt = $pdo->prepare("SELECT id FROM tutorials WHERE content_url = ?");
                $stmt->execute([$fileUrl]);
                if (!$stmt->fetch()) {
                    // Extract title from filename (remove timestamp and .pdf)
                    $cleanTitle = preg_replace('/^\d+_/', '', $fileName);
                    $cleanTitle = str_replace('.pdf', '', $cleanTitle);
                    
                    $stmt = $pdo->prepare("INSERT INTO tutorials (title, description, content_url) VALUES (?, 'Sincronizado automáticamente', ?)");
                    $stmt->execute([$cleanTitle, $fileUrl]);
                }
            }
        }

        // Alias content_url as file_url for frontend compatibility
        $stmt = $pdo->query("SELECT id, title, description, category, content_url as file_url, comments, created_at FROM tutorials ORDER BY id DESC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $id = $_GET['id'] ?? null;
        $title = $_POST['title'] ?? 'Sin título';
        $description = $_POST['description'] ?? '';
        $comments = $_POST['comments'] ?? '';
        $fileUrl = null;

        // Handle file upload if present
        if (isset($_FILES['pdf_file']) && $_FILES['pdf_file']['size'] > 0) {
            $file = $_FILES['pdf_file'];
            $fileName = time() . '_' . basename($file['name']);
            $targetDir = "../../uploads/tutorials/";
            $targetFile = $targetDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $targetFile)) {
                $fileUrl = "uploads/tutorials/" . $fileName;
                
                // If updating, delete old file
                if ($id) {
                    $stmt = $pdo->prepare("SELECT content_url FROM tutorials WHERE id = ?");
                    $stmt->execute([$id]);
                    $old = $stmt->fetch();
                    if ($old && $old['content_url']) {
                        $oldPath = "../../" . $old['content_url'];
                        if (file_exists($oldPath)) unlink($oldPath);
                    }
                }
            } else {
                http_response_code(500);
                jsonResponse(["message" => "Error al guardar el archivo"]);
                exit;
            }
        }

        if ($id) {
            // Update
            if ($fileUrl) {
                $sql = "UPDATE tutorials SET title = ?, description = ?, content_url = ?, comments = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$title, $description, $fileUrl, $comments, $id]);
            } else {
                $sql = "UPDATE tutorials SET title = ?, description = ?, comments = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$title, $description, $comments, $id]);
            }
            jsonResponse(["message" => "Tutorial actualizado"]);
        } else {
            // New
            if (!$fileUrl) {
                http_response_code(400);
                jsonResponse(["message" => "El archivo PDF es obligatorio para nuevos tutoriales"]);
                exit;
            }
            $sql = "INSERT INTO tutorials (title, description, content_url, comments) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$title, $description, $fileUrl, $comments]);
            jsonResponse(["message" => "Tutorial subido", "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        // Get file path to delete it from disk too
        $stmt = $pdo->prepare("SELECT content_url as file_url FROM tutorials WHERE id = ?");
        $stmt->execute([$id]);
        $tutorial = $stmt->fetch();
        
        if ($tutorial) {
            $filePath = "../../" . $tutorial['file_url'];
            if (file_exists($filePath)) unlink($filePath);
            
            $stmt = $pdo->prepare("DELETE FROM tutorials WHERE id = ?");
            $stmt->execute([$id]);
            jsonResponse(["message" => "Tutorial eliminado"]);
        }
        break;
}
?>
