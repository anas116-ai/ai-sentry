const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 1. Supabase Connection
// Note: Deeniki kavalsina Keys manam GitHub Actions Secrets lo pedatham.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncAiTools() {
  console.log("🚀 AI-SENTRY Automation: Syncing started...");

  try {
    // --- SOURCE: GITHUB TRENDING AI ---
    // Trending AI projects ni GitHub nunchi lagesthundi
    console.log("📡 Connecting to GitHub API...");
    const githubRes = await axios.get('https://api.github.com/search/repositories?q=topic:ai&sort=stars&order=desc', {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    const toolsToSync = githubRes.data.items.slice(0, 15).map(repo => ({
      name: repo.name,
      description: repo.description || "Top trending AI repository found via AI-Sentry monitoring.",
      url: repo.html_url,
      category: 'Open Source',
      source: 'github',
      external_id: repo.id.toString(),
      stars: repo.stargazers_count,
      github_repo: repo.full_name,
      status: 'active',
      launched_at: new Date(repo.created_at).toISOString().split('T')[0]
    }));

    console.log(`📦 Found ${toolsToSync.length} new potential tools.`);

    // 2. Database loki Push (Upsert) cheyadam
    // OnConflict: source mariyu external_id okate unte update chestundi, lekapothe kotha tool create chestundi.
    const { data, error } = await supabase
      .from('tools')
      .upsert(toolsToSync, { onConflict: 'source, external_id' });

    if (error) {
      console.error("❌ Supabase Insertion Error:", error.message);
    } else {
      console.log(`✅ Success! Database updated with ${toolsToSync.length} tools.`);
    }

  } catch (err) {
    console.error("❌ Automation Script Failed:", err.message);
  }
}

// Start the process
syncAiTools();