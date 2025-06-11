<?php

namespace App\Http\Controllers;

use App\Models\DigitalOrder;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class DigitalOrderController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'model_id' => 'required|exists:model3ds,id',
                'license_type' => 'required|in:personal,commercial,enterprise'
            ]);

            $model = Model3D::findOrFail($validated['model_id']);
            
            // Проверяем, не купил ли уже пользователь эту модель
            $existingOrder = DigitalOrder::where('user_id', Auth::id())
                ->where('model_id', $model->id)
                ->where('status', 'completed')
                ->first();

            if ($existingOrder) {
                return response()->json([
                    'message' => 'You have already purchased this model',
                    'order' => $existingOrder
                ], 400);
            }

            // Создаем заказ
            $order = DigitalOrder::create([
                'user_id' => Auth::id(),
                'model_id' => $model->id,
                'price' => $model->price,
                'license_type' => $validated['license_type'],
                'status' => 'pending'
            ]);

            // TODO: Здесь должна быть интеграция с платежной системой
            // После успешной оплаты:
            $order->status = 'completed';
            $order->save();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating digital order', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'model_id' => $request->model_id ?? null
            ]);

            return response()->json([
                'message' => 'Error creating order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function download($orderId)
    {
        try {
            $order = DigitalOrder::where('user_id', Auth::id())
                ->where('id', $orderId)
                ->firstOrFail();

            if (!$order->canDownload()) {
                return response()->json([
                    'message' => 'You cannot download this model. Check your license or download limit.'
                ], 403);
            }

            $model = $order->model;
            $filePath = storage_path('app/public/models/' . $model->model_file);

            if (!file_exists($filePath)) {
                return response()->json([
                    'message' => 'Model file not found'
                ], 404);
            }

            // Увеличиваем счетчик загрузок
            $order->incrementDownloadCount();

            return response()->download($filePath, $model->title . '.' . pathinfo($model->model_file, PATHINFO_EXTENSION));

        } catch (\Exception $e) {
            Log::error('Error downloading model', [
                'error' => $e->getMessage(),
                'order_id' => $orderId,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Error downloading model',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $orders = DigitalOrder::with('model')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = DigitalOrder::with('model')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($order);
    }
} 