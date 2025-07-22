<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index()
    {
        $items = CartItem::with('model')
            ->where('user_id', Auth::id())
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
{
    $data = $request->validate([
        'model_id' => 'required|exists:models,id',
        'license_type' => 'required|in:personal,commercial,enterprise',
    ]);

    $exists = CartItem::where('user_id', Auth::id())
        ->where('model_id', $data['model_id'])
        ->where('license_type', $data['license_type']) 
        ->exists();

    if ($exists) {
        return response()->json(['message' => 'Model already in cart'], 409);
    }

    $item = CartItem::create([
        'user_id' => Auth::id(),
        'model_id' => $data['model_id'],
        'license_type' => $data['license_type'],
    ]);

    $item->load('model');

    return response()->json($item, 201);
}
    public function destroy($id)
    {
        $item = CartItem::where('user_id', Auth::id())->findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Removed from cart']);
    }

    public function clear()
    {
        CartItem::where('user_id', Auth::id())->delete();

        return response()->json(['message' => 'Cart cleared']);
    }

public function update(Request $request, $id)
{
    $data = $request->validate([
        'license_type' => 'required|in:personal,commercial,enterprise',
    ]);

    $item = CartItem::where('user_id', Auth::id())->findOrFail($id);

    $item->license_type = $data['license_type'];
    $item->save();

    return response()->json($item);
}

 public function checkout()
{
    $userId = Auth::id();

    $items = CartItem::with('model')
        ->where('user_id', $userId)
        ->get();

    if ($items->isEmpty()) {
        return response()->json(['message' => 'Cart is empty'], 400);
    }

    $orders = [];

    foreach ($items as $item) {
        $price = $item->model->price * DigitalOrder::licenseCoefficient($item->license_type);

        $order = DigitalOrder::create([
            'user_id' => $userId,
            'price' => $price,
            'license_type' => $item->license_type,
            'status' => 'completed',
            'download_count' => 0,
            'downloaded_at' => null,
        ]);

        $order->models()->attach($item->model_id);

        $orders[] = $order;
    }

    CartItem::where('user_id', $userId)->delete();

    return response()->json([
        'message' => 'Checkout successful',
        'orders' => $orders,
    ]);
}
}
