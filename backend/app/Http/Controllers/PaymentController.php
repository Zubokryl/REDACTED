<?php
/*
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
*/

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\StripeClient;
use App\Models\Payment;
use App\Models\DigitalOrder;
use Stripe\PaymentIntent;
use Illuminate\Container\Attributes\Log;


class PaymentController extends Controller
{
    public function __invoke(Request $request, StripeClient $stripe)
    {
        try {
            $data = $request->validate([
                'order_ids'   => 'required|array|size:1',
                'order_ids.*' => 'integer|exists:digital_orders,id',
                'currency'    => 'sometimes|string|size:3',
                'success_url' => 'nullable|url',
                'cancel_url'  => 'nullable|url',
            ]);

            $orderId = (int) $data['order_ids'][0];

            /** @var \App\Models\DigitalOrder|null $order */
            $order = DigitalOrder::with('items')
                ->where('id', $orderId)
                ->where('user_id', Auth::id())
                ->first();

            if (!$order) {
                \Log::error('Order not found or unauthorized', ['order_id' => $orderId, 'user_id' => Auth::id()]);
                return response()->json(['message' => 'Unauthorized or order not found.'], 403);
            }

            // Netto aus den Order-Items (price ist bei dir Netto)
            $subtotalCents = 0;
            foreach ($order->items as $item) {
                $subtotalCents += (int) round(((float)$item->price) * 100);
            }

            $vatPercent = (float) env('VAT_PERCENT', 20.0);
            $vatCents   = (int) round($subtotalCents * ($vatPercent / 100.0));
            $grossCents = $subtotalCents + $vatCents;

            if ($grossCents < 1) {
                return response()->json(['message' => 'Invalid amount.'], 422);
            }

            $currency = strtolower($data['currency'] ?? 'eur');

            // einfacher Card-Flow
            $pi = $stripe->paymentIntents->create([
                'amount'               => $grossCents,
                'currency'             => $currency,
                'payment_method_types' => ['card'],
                'metadata'             => [
                    'order_ids'  => (string) $orderId,
                    'buyer_id'   => (string) Auth::id(),
                    'vat_percent'=> (string) $vatPercent,
                    'net_cents'  => (string) $subtotalCents,
                    'vat_cents'  => (string) $vatCents,
                ],
            ]);

            Payment::create([
                'digital_order_id' => $orderId,
                'intent_id'        => $pi->id,
                'client_secret'    => $pi->client_secret,
                'amount'           => $grossCents,  // BRUTTO in Cents
                'currency'         => $currency,
                'status'           => 'created',
            ]);

            return response()->json([
                'payment_intent_id' => $pi->id,
                'client_secret'     => $pi->client_secret,
                'publishable_key'   => config('services.stripe.publishable'),
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Payment error', [
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
                'request' => $request->all(),
                'user_id' => Auth::id(),
            ]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
