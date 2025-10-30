-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for budget_categories table
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_categories;