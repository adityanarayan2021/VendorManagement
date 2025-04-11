// validators/order.validator.js
import { z } from 'zod';

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().length(24),
    quantity: z.number().int().positive()
  })).min(1)
});
