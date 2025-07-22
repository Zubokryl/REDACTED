'use client'

import { useState } from 'react'
import axiosClient from '@/lib/axios'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createBulkOrder } from '@/lib/api'
import styles from './CheckoutPage.module.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type PaymentSectionProps = {
  clientSecret: string
  onSuccess: () => void
}

const PaymentSection = ({ clientSecret, onSuccess, onCancel, orderId }: PaymentSectionProps & { onCancel: () => void; orderId: number }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setLoading(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      console.error('Card Element not found')
      setLoading(false)
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email,
        },
      },
    })

    if (result.error) {
      console.error('Payment error:', result.error.message)
      alert(result.error.message)
    } else if (result.paymentIntent?.status === 'succeeded') {
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.itemsList}>
      <p>Order ID: {orderId}</p>

      <label>
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
        fontSize: '18px',
        color: '#fff',
        letterSpacing: '0.5px',
        '::placeholder': {
          color: '#888',
        },
      },
      invalid: {
        color: '#e53e3e',
      },
    },
  }}
/>


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
          {loading ? 'Processing...' : 'Pay now'}
        </button>
      </div>
    </form>
  )
}


export default function PaymentPage() {
  const { user } = useAuth()
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const [confirmed, setConfirmed] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleConfirmOrder = async () => {
    if (!user) {
      alert('Please log in to proceed.')
      return
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty.')
      return
    }
    setLoading(true)

    try {
      const orderRes = await createBulkOrder({
        items: cartItems.map(item => ({
          model_id: item.model_id,
          license_type: item.license_type,
        })),
      })

      const id = orderRes.order.id
      const amount = Math.round(getTotalPrice() * 100)

      const res = await axiosClient.post('/payments', {
        order_ids: [id],
        amount,
        currency: 'usd',
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`,
      })

      if (![200, 201].includes(res.status)) {
  throw new Error('Failed to create payment.')
}

setClientSecret(res.data.client_secret)
setOrderId(id)
setConfirmed(true)
} catch (err) {
  console.error('Error confirming the order:', err)
  alert('An error occurred while creating the payment. Please try again later.')
} finally {
  setLoading(false)
}
}

  const handleCancel = () => {
    setConfirmed(false)
    setClientSecret(null)
    setOrderId(null)
  }

  if (!user) {
    return (
      <div className={styles.containerCentered}>
        <p>Please log in to proceed with payment.</p>
      </div>
    )
  }

  return (
    <div className={styles.containerCentered}>
      <div className={styles.paymentBox}>
        <h1 className={styles.title}>
  {paymentSuccess 
    ? 'Payment was successful!' 
    : confirmed 
      ? 'Complete Your Payment'
      : 'Review Your Order'
  }
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
            <p className={styles.total}>
              Total: ${getTotalPrice().toFixed(2)}
            </p>

            <div className={styles.buttonGroup}>
              <button
                onClick={() => (window.location.href = '/cart')}
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
                {loading ? 'Confirming...' : 'Confirm'}
              </button>
            </div>
          </>
        ) : clientSecret ? (
  <Elements
    stripe={stripePromise}
    options={{ clientSecret }}
  >
    <PaymentSection
      clientSecret={clientSecret}
      onSuccess={async () => {
        await clearCart()
        setPaymentSuccess(true)
      }}
      onCancel={handleCancel}
      orderId={orderId!}
    />
  </Elements>
) : (
  <p>Creating payment session...</p>
        )}
      </div>
    </div>
  )
}
