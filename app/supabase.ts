import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://xxjwbrzdfthorfdvzltt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4andicnpkZnRob3JmZHZ6bHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjA2MzIsImV4cCI6MjA5MTAzNjYzMn0.8Wzh6kLKhFGKR4RjagAq5izfFXrISZ734_TzoeawIgU'
)

// Database nunchi tools data lagadaniki idi use cheyi
export async function getAiTools() {
  const { data, error } = await supabase
    .from('ai_tools') // Ikkada nee table name correct ga pettu
    .select('*')
  
  if (error) {
    console.error("Data fetching bokka lo error:", error.message);
    return [];
  }
  return data;
}