<?php
/*
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Webhook;
use App\Models\Payment;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $event = Webhook::constructEvent(
            $request->getContent(),
            $request->header('Stripe-Signature'),
            config('services.stripe.webhook')
        );

        match ($event->type) {
            'payment_intent.succeeded'      => $this->handleSuccess($event),
            'payment_intent.payment_failed' => $this->handleFailure($event),
            default                         => null,
        };

        return response()->noContent();
    }

  protected function handleSuccess($event)
{
    $pi = $event->data->object;
    $orderIds = explode(',', $pi->metadata->order_ids ?? '');

    Payment::where('intent_id', $pi->id)->update(['status' => 'succeeded']);

    foreach ($orderIds as $id) {
        \App\Models\DigitalOrder::where('id', $id)->update(['status' => 'completed']);
    }
}

    protected function handleFailure($event)
    {
        $pi = $event->data->object;
        
        Payment::where('intent_id', $pi->id)->update(['status' => 'failed']);
    }
}
*/

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use App\Models\Payment;
use App\Models\DigitalOrder;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $payload = $request->getContent();
        $sig     = $request->header('Stripe-Signature');
        $secret  = config('services.stripe.webhook');

        try {
            $event = Webhook::constructEvent($payload, $sig, $secret);
        } catch (\Throwable $e) {
            Log::error('Stripe webhook signature error', ['error' => $e->getMessage()]);
            return response('Bad signature', 400);
        }

        match ($event->type) {
            'payment_intent.succeeded'      => $this->handleSuccess($event->data->object),
            'payment_intent.payment_failed' => $this->handleFailure($event->data->object),
            default                         => null,
        };

        return response()->noContent();
    }

    protected function handleSuccess($pi)
    {
        $orderIds = explode(',', $pi->metadata->order_ids ?? '');

        Payment::where('intent_id', $pi->id)->update([
            'status'   => 'succeeded',
            'amount'   => (int) ($pi->amount_received ?? $pi->amount ?? 0),
            'currency' => $pi->currency ?? 'eur',
        ]);

        foreach ($orderIds as $id) {
            if (!$id) continue;
            DigitalOrder::where('id', $id)->update(['status' => 'completed']);
        }
    }

    protected function handleFailure($pi)
    {
        Payment::where('intent_id', $pi->id)->update(['status' => 'failed']);
    }
}