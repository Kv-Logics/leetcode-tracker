import { supabase } from './supabase';
import { problemsList } from './problems';

export async function seedPayPal() {
  const { data: existing } = await supabase
    .from('companies')
    .select('*')
    .eq('name', 'PayPal')
    .single();
  
  if (!existing) {
    await supabase.from('companies').insert({
      name: 'PayPal',
      problems: problemsList
    });
  }
}
