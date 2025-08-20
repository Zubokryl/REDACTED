"use client";

import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axiosClient from "@/lib/axios";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createBulkOrder } from "@/lib/api";
import styles from "./CheckoutPage.module.css";

/**
 * Stripe init
 * - reads the key from NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY .env.local only
 * - If the env-var is undefined we pass an empty string so the Promise still
 * resolves (Stripe will then warn in console).
 */

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

type PaymentSectionProps = {
  clientSecret: string;
  orderId: number;
  onSuccess: () => void;
  onCancel: () => void;
};

const PaymentSection = ({
  clientSecret,
  orderId,
  onSuccess,
  onCancel,
}: PaymentSectionProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);

    const card = elements.getElement(CardElement);
    if (!card) {
      setErrorMsg("Card element not initialised");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card,
          billing_details: { email },
        },
      }
    );

    if (error) {
      setErrorMsg(error.message ?? "Payment failed");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.itemsList}>
      <p>Order ID: {orderId}</p>

      <label className={styles.label}>
        Email for receipt:
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
      </label>

      <CardElement
        className={styles.stripeInput}
        options={{
          style: {
            base: {
              fontSize: "18px",
              color: "#fff",
              letterSpacing: "0.5px",
              "::placeholder": { color: "#888" },
            },
            invalid: { color: "#e53e3e" },
          },
        }}
      />

      {errorMsg && <p className={styles.error}>{errorMsg}</p>}

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          className={`${styles.button} ${styles.buttonRed}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`${styles.button} ${styles.buttonGreen}`}
        >
          {loading ? "Processing…" : "Pay now"}
        </button>
      </div>
    </form>
  );
};

export default function PaymentPage() {
  const { user } = useAuth();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [confirmed, setConfirmed] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /**
   * 1. Creates the Digital Order via backend
   * 2. Creates the PaymentIntent and returns client_secret
   */
  const handleConfirmOrder = useCallback(async () => {
    if (!user) {
      alert("Please log in to proceed.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await createBulkOrder({
        items: cartItems.map((item) => ({
          model_id: item.model_id,
          license_type: item.license_type,
        })),
      });

      const id = orderRes.order.id as number;
      const amount = Math.round(getTotalPrice() * 100); // cents

      const res = await axiosClient.post("/payments", {
        order_ids: [id],
        amount,
        currency: "usd",
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      });

      if (![200, 201].includes(res.status)) {
        throw new Error("Failed to create payment.");
      }

      setClientSecret(res.data.client_secret);
      setOrderId(id);
      setConfirmed(true);
    } catch (err) {
      console.error("Error confirming the order:", err);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user, cartItems, getTotalPrice]);

  const handleCancel = () => {
    setConfirmed(false);
    setClientSecret(null);
    setOrderId(null);
  };

  if (!user) {
    return (
      <div className={styles.containerCentered}>
        <p>Please log in to proceed with payment.</p>
      </div>
    );
  }

  return (
    <div className={styles.containerCentered}>
      <div className={styles.paymentBox}>
        <h1 className={styles.title}>
          {paymentSuccess
            ? "Payment was successful!"
            : confirmed
            ? "Complete Your Payment"
            : "Review Your Order"}
        </h1>

        {paymentSuccess ? (
          <div className={styles.successMessage}>
            <p>A confirmation has been sent to your email.</p>
          </div>
        ) : !confirmed ? (
          <>
            <h2 className={styles.orderTitle}>Your Order:</h2>
            <ul className={styles.orderList}>
              {cartItems.map((item, index) => (
                <li key={index} className={styles.orderItem}>
                  • Model ID: {item.model_id} — License: {item.license_type}
                </li>
              ))}
            </ul>
            <p className={styles.total}>Total: € {getTotalPrice().toFixed(2)}</p>

            <div className={styles.buttonGroup}>
              <button
                onClick={() => (window.location.href = "/cart")}
                className={`${styles.button} ${styles.buttonGray}`}
              >
                Edit
              </button>
              <button
                onClick={handleCancel}
                className={`${styles.button} ${styles.buttonRed}`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className={`${styles.button} ${styles.buttonGreen}`}
              >
                {loading ? "Confirming…" : "Proceed to Payment"}
              </button>
            </div>
          </>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentSection
              clientSecret={clientSecret}
              orderId={orderId!}
              onSuccess={async () => {
                await clearCart();
                setPaymentSuccess(true);
              }}
              onCancel={handleCancel}
            />
          </Elements>
        ) : (
          <p>Creating payment session…</p>
        )}
      </div>
    </div>
  );
}
