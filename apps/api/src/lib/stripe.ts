import Stripe from "stripe"
import { env } from "../config/env"

let stripeSingleton: Stripe | null | undefined

export function getStripe(): Stripe | null {
  if (stripeSingleton !== undefined) return stripeSingleton
  const key = env.STRIPE_SECRET_KEY
  stripeSingleton = key ? new Stripe(key) : null
  return stripeSingleton
}
