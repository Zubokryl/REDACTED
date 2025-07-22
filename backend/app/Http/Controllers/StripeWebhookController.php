<?php

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