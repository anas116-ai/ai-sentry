import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 1. డేటాబేస్ నుండి అన్ని టూల్స్ తేవడం
    const { data: tools, error } = await supabase.from('tools').select('id, url, name');
    if (error) throw error;

    // 2. ప్రతి లింక్ ని చెక్ చేయడం
    const results = await Promise.all(
      tools.map(async (tool) => {
        try {
          // వెబ్‌సైట్ పనిచేస్తుందో లేదో కేవలం 5 సెకన్ల లోపు చెక్ చేస్తుంది
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(tool.url, { 
            method: 'GET', 
            signal: controller.signal,
            cache: 'no-store' 
          });

          const status = res.ok ? 'VERIFIED_NODE' : 'OFFLINE';
          
          // సుపబేస్ లో స్టేటస్ అప్‌డేట్
          await supabase.from('tools').update({ status }).eq('id', tool.id);
          
          return { name: tool.name, status };
        } catch (e) {
          // లింక్ కట్ అయితే ఆటోమేటిక్ గా OFFLINE అని మారుస్తుంది
          await supabase.from('tools').update({ status: 'OFFLINE' }).eq('id', tool.id);
          return { name: tool.name, status: 'OFFLINE' };
        }
      })
    );

    return NextResponse.json({ 
        success: true, 
        message: "Monitoring cycle complete", 
        timestamp: new Date().toISOString(),
        results 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}