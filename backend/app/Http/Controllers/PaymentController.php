<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\StripeClient;
use Stripe\PaymentIntent;
use App\Models\Payment;
use App\Models\DigitalOrder;

class PaymentController extends Controller
{
    public function __invoke(Request $request, StripeClient $stripe)
    {
        try {
            $data = $request->validate([
                'order_ids'   => 'required|array|size:1',
                'order_ids.*' => 'integer|exists:digital_orders,id',
                'amount'      => 'required|integer|min:1',
                'currency'    => 'required|string|size:3',
                'success_url' => 'required|url',
                'cancel_url'  => 'required|url',
            ]);

            $orderId = $data['order_ids'][0];
            $order = DigitalOrder::where('id', $orderId)
                ->where('user_id', auth()->id())
                ->first();

            if (!$order) {
                \Log::error('Order not found or unauthorized', ['order_id' => $orderId, 'user_id' => auth()->id()]);
                return response()->json(['message' => 'Unauthorized or order not found.'], 403);
            }

            // Определение доступных методов оплаты
            $paymentMethodTypes = ['card'];

            if (strtolower($data['currency']) !== 'usd') {
                $paymentMethodTypes[] = 'klarna';
            }

            \Log::info('Creating PaymentIntent', [
                'currency' => $data['currency'],
                'payment_method_types' => $paymentMethodTypes
            ]);

            $pi = $stripe->paymentIntents->create([
                'amount'               => $data['amount'],
                'currency'             => $data['currency'],
                'payment_method_types' => $paymentMethodTypes,
                'metadata'             => ['order_ids' => $orderId],
            ]);

            $payment = Payment::create([
                'digital_order_id' => $orderId,
                'intent_id'        => $pi->id,
                'client_secret'    => $pi->client_secret,
                'amount'           => $data['amount'],
                'currency'         => $data['currency'],
                'status'           => 'created',
            ]);

            return response()->json([
                'payment_intent_id' => $pi->id,
                'client_secret'     => $pi->client_secret,
                'publishable_key'   => config('services.stripe.publishable'),
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Payment error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'user_id' => auth()->id(),
            ]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}