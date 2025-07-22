<?php

namespace App\Http\Controllers;

use App\Models\DigitalOrder;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DigitalOrderController extends Controller
{
    // Order for a single model
    public function store(Request $request)
    {
        $validated = $request->validate([
            'model_id' => 'required|exists:models,id',
            'license_type' => 'required|in:personal,commercial,enterprise',
        ]);

        $userId = Auth::id();
        $modelId = $validated['model_id'];
        $licenseType = $validated['license_type'];

        try {
            $order = DigitalOrder::createOrderSingleModel($userId, $modelId, $licenseType);

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('items.model'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating digital order', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'model_id' => $modelId,
            ]);
            return response()->json([
                'message' => 'Error creating order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Order for multiple models
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.model_id' => 'required|exists:models,id',
            'items.*.license_type' => 'required|in:personal,commercial,enterprise',
        ]);

        $userId = Auth::id();
        $items = $validated['items'];

        try {
            $order = DigitalOrder::createBulkOrder($userId, $items);

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('items.model'),
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating bulk digital order', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'items' => $items,
            ]);
            return response()->json([
                'message' => 'Error creating order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Order for all models (example)
    public function storeAllModels(Request $request)
{
    $validated = $request->validate([
        'license_type' => 'required|in:personal,commercial,enterprise',
    ]);

    $userId = Auth::id();
    $licenseType = $validated['license_type'];

    try {
        $order = DigitalOrder::createOrderAllModels($userId, $licenseType);

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('items.model'),
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error creating order for all models', [
            'error' => $e->getMessage(),
            'user_id' => $userId,
        ]);
        return response()->json([
            'message' => 'Error creating order',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    // List of user orders
    public function index()
    {
        $orders = DigitalOrder::with('items.model')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    // View an order
    public function show($id)
    {
        $order = DigitalOrder::with('items.model')
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($order);
    }

    // Download model from order
    public function download(Request $request, $orderId)
    {
        $modelId = $request->query('model_id');

        $order = DigitalOrder::where('user_id', Auth::id())
            ->where('id', $orderId)
            ->with('items.model')
            ->firstOrFail();

        $item = null;

        if ($modelId) {
            $item = $order->items->firstWhere('model_id', $modelId);
            if (!$item) {
                return response()->json(['message' => 'Model not found in this order.'], 404);
            }
        } else {
            $item = $order->items->first();
            if (!$item) {
                return response()->json(['message' => 'No models found in this order.'], 404);
            }
        }

        if (!$item->canDownload()) {
            return response()->json(['message' => 'Download limit reached or license invalid.'], 403);
        }

        $filePath = storage_path('app/public/models/' . $item->model->model_file);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'Model file not found.'], 404);
        }

        $item->incrementDownloadCount();

        return response()->download(
            $filePath,
            $item->model->title . '.' . pathinfo($item->model->model_file, PATHINFO_EXTENSION)
        );
    }
}