import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OrderInput = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(40),
  document_type: z.enum([
    "memoire_licence",
    "memoire_master",
    "rapport_stage",
    "correction",
    "autre",
  ]),
  academic_level: z.string().trim().max(120).optional(),
  subject: z.string().trim().min(5).max(2000),
  instructions: z.string().trim().max(5000).optional(),
  deadline: z.string().optional(),
  pages: z.number().int().positive().max(1000).optional(),
  price_fcfa: z.number().int().nonnegative().optional(),
  payment_method: z.string().trim().max(60).optional(),
  file_paths: z.array(z.string().max(500)).max(20).default([]),
});

export type OrderInputType = z.infer<typeof OrderInput>;

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => OrderInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        document_type: data.document_type,
        academic_level: data.academic_level ?? null,
        subject: data.subject,
        instructions: data.instructions ?? null,
        deadline: data.deadline || null,
        pages: data.pages ?? null,
        price_fcfa: data.price_fcfa ?? null,
        payment_method: data.payment_method ?? null,
        file_paths: data.file_paths,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
});

const GetOrderInput = z.object({ orderId: z.string().uuid() });

export const getOrderPublic = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => GetOrderInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, subject, document_type, created_at, price_fcfa, pages, deadline, payment_method")
      .eq("id", data.orderId)
      .single();
    if (error) throw new Error(error.message);
    return order as {
      id: string;
      status: string;
      subject: string;
      document_type: string;
      created_at: string;
      price_fcfa: number | null;
      pages: number | null;
      deadline: string | null;
      payment_method: string | null;
    };
  });
