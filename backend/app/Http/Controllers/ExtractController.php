<?php

namespace App\Http\Controllers;

use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class ExtractController extends Controller
{
    /**
     * Extract files from a ZIP archive
     */
    public function extract($id)
    {
        $model = Model3D::findOrFail($id);
        
        // Проверяем, что файл модели - ZIP-архив
        if (!str_ends_with(strtolower($model->model_file), '.zip')) {
            return response()->json(['error' => 'Model file is not a ZIP archive'], 400);
        }
        
        $zipPath = storage_path('app/public/models/' . $model->model_file);
        
        if (!file_exists($zipPath)) {
            return response()->json(['error' => 'ZIP file not found'], 404);
        }
        
        // Создаем директории для распакованных файлов, если они не существуют
        $extractDir = storage_path('app/public/extracted/' . $id);
        if (!file_exists($extractDir)) {
            mkdir($extractDir, 0755, true);
        }
        
        // Распаковываем архив
        $zip = new ZipArchive();
        if ($zip->open($zipPath) === TRUE) {
            $zip->extractTo($extractDir);
            $zip->close();
            
            // Ищем файлы моделей и tbscene в распакованных файлах
            $modelFile = null;
            $tbsceneFile = null;
            $textureFiles = [];
            
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($extractDir),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );
            
            foreach ($files as $file) {
                if ($file->isDir()) {
                    continue;
                }
                
                $filePath = $file->getPathname();
                $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                
                // Ищем файлы моделей
                if (in_array($extension, ['fbx', 'obj', 'glb', 'gltf']) && !$modelFile) {
                    $modelFile = str_replace(storage_path('app/public/'), '', $filePath);
                }
                
                // Ищем tbscene файлы
                if ($extension === 'tbscene' && !$tbsceneFile) {
                    $tbsceneFile = str_replace(storage_path('app/public/'), '', $filePath);
                }
                
                // Ищем текстуры
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'tga', 'bmp'])) {
                    $textureFiles[] = str_replace(storage_path('app/public/'), '', $filePath);
                }
            }
            
            // Обновляем модель с путями к распакованным файлам
            if ($modelFile) {
                $model->extracted_model_file = $modelFile;
            }
            
            if ($tbsceneFile) {
                $model->extracted_tbscene_file = $tbsceneFile;
            }
            
            // Сохраняем текстуры в JSON поле
            if (!empty($textureFiles)) {
                $model->texture_files = $textureFiles;
            }
            
            $model->save();
            
            return response()->json([
                'message' => 'ZIP file extracted successfully',
                'model_file' => $modelFile ? asset('storage/' . $modelFile) : null,
                'tbscene_file' => $tbsceneFile ? asset('storage/' . $tbsceneFile) : null,
                'texture_files' => !empty($textureFiles) ? array_map(function($texture) {
                    return asset('storage/' . $texture);
                }, $textureFiles) : []
            ]);
        } else {
            return response()->json(['error' => 'Failed to open ZIP file'], 500);
        }
    }

    /**
     * Get extracted files for a model
     */
    public function getExtractedFiles($id)
    {
        $model = Model3D::findOrFail($id);
        
        // Если файлы еще не извлечены, но это ZIP-архив, извлекаем их автоматически
        if (!$model->extracted_model_file && !$model->extracted_tbscene_file && 
            str_ends_with(strtolower($model->model_file), '.zip')) {
            return $this->extract($id);
        }
        
        return response()->json([
            'model_file' => $model->extracted_model_file ? asset('storage/' . $model->extracted_model_file) : null,
            'tbscene_file' => $model->extracted_tbscene_file ? asset('storage/' . $model->extracted_tbscene_file) : null,
            'texture_files' => $model->texture_files ? array_map(function($texture) {
                return asset('storage/' . $texture);
            }, $model->texture_files) : []
        ]);
    }
}