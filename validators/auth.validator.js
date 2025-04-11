import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
  email: z.string({ required_error: 'Email is required' })
           .email('Please provide a valid email'),
  password: z.string({ required_error: 'Password is required' })
             .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'vendor', 'admin'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be one of customer, vendor, or admin'
  })
});


export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' })
           .email('Invalid email format'),
  password: z.string({ required_error: 'Password is required' })
             .min(6, 'Password must be at least 6 characters')
});
