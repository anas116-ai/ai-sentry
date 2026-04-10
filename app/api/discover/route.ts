import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // మనం వెతకాల్సిన సోర్సెస్ (Futurepedia, Futuretools, TopAI)
    const rssSources = [
      'https://api.rss2json.com/v1/api.json?rss_url=https://www.futurepedia.io/rss.xml',
      'https://api.rss2json.com/v1/api.json?rss_url=https://www.futuretools.io/rss.xml'
    ];

    let allCollectedTools: any[] = [];

    // ప్రతి సోర్స్ నుండి డేటా లాగడం
    for (const url of rssSources) {
      try {
        const resp = await fetch(url);
        const data = await resp.json();
        if (data.items) {
          allCollectedTools = [...allCollectedTools, ...data.items];
        }
      } catch (e) {
        console.error("Source failed, moving to next...");
      }
    }

    if (allCollectedTools.length === 0) {
      return NextResponse.json({ success: true, message: "No new data discovered right now." });
    }

    // డేటాని మన ఫార్మాట్ లోకి మార్చడం
    const formattedTools = allCollectedTools.map((item: any) => {
      const pubDate = new Date(item.pubDate);
      const today = new Date();
      
      // లాంచ్ అయిన 30 రోజుల లోపు ఉంటే "New Launch" (is_featured = true)
      const diffTime = Math.abs(today.getTime() - pubDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isNewLaunch = diffDays <= 30;

      return {
        name: item.title.split('-')[0].trim(),
        category: "AI Discovery",
        url: item.link,
        description: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 160) : "Latest AI tool update.",
        trust_score: 90,
        status: "VERIFIED_NODE",
        launched_at: pubDate.toISOString().split('T')[0], // అసలు లాంచ్ డేట్
        is_featured: isNewLaunch, // కొత్తదైతే true అవుతుంది
        last_updated_at: new Date().toISOString()
      };
    });

    // UPSERT: పేరు కలిస్తే అప్‌డేట్ చేస్తుంది (Updated అని మనకి తెలుస్తుంది), లేకపోతే కొత్తది యాడ్ చేస్తుంది.
    const { error } = await supabase
      .from('tools')
      .upsert(formattedTools, { onConflict: 'name' });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      count: formattedTools.length,
      message: `${formattedTools.length} tools synchronized with launch dates!` 
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}