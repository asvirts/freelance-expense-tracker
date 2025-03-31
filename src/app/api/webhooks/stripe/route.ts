import type { Stripe } from "stripe"

// Replace any with Stripe.Event.Data
const session = event.data.object as Stripe.Checkout.Session

// Remove customerId if not used
const userId = session.client_reference_id
