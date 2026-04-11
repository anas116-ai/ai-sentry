import requests
import json
import time

# Credentials
SUPABASE_URL = "https://xxjwbrzdfthorfdvzltt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4andicnpkZnRob3JmZHZ6bHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjA2MzIsImV4cCI6MjA5MTAzNjYzMn0.8Wzh6kLKhFGKR4RjagAq5izfFXrISZ734_TzoeawIgU"

def sync_to_supabase(tools):
    api_url = f"{SUPABASE_URL}/rest/v1/tools"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    count = 0
    for tool in tools:
        try:
            res = requests.post(api_url, headers=headers, data=json.dumps(tool))
            if res.status_code in [200, 201]:
                count += 1
        except:
            pass
    print(f"✅ Successfully synced {count} tools to AI-Sentry!")

def scrape_multi_source():
    print("🤖 AI-Sentry Master Bot: Scanning Multiple Sources...")
    all_new_tools = []
    
    # Headers to bypass bot detection
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    }

    # Source 1: Futurepedia (Direct API fallback)
    try:
        fp_res = requests.get("https://www.futurepedia.io/api/tools?sort=new", headers=headers, timeout=10)
        if fp_res.status_code == 200:
            data = fp_res.json()
            for t in data.get('tools', [])[:10]:
                all_new_tools.append({
                    "name": t.get('name'),
                    "url": t.get('websiteUrl') or f"https://www.futurepedia.io/tool/{t.get('slug')}",
                    "description": t.get('shortDescription') or "Professional AI Tool",
                    "category": t.get('category') or "AI Software",
                    "launched_at": t.get('addedAt') or time.strftime('%Y-%m-%d')
                })
    except:
        print("⚠️ Futurepedia source failed.")

    # Source 2: AI Tool Hunt (Alternate Source)
    try:
        # Example structure for another directory
        ah_res = requests.get("https://api.aitoolhunt.com/v1/tools?limit=10", headers=headers, timeout=10)
        if ah_res.status_code == 200:
            data = ah_res.json()
            for t in data.get('data', []):
                all_new_tools.append({
                    "name": t.get('title'),
                    "url": t.get('link'),
                    "description": t.get('description'),
                    "category": "Discovery",
                    "launched_at": time.strftime('%Y-%m-%d')
                })
    except:
        print("⚠️ AI Tool Hunt failed.")

    # Final Sync
    if all_new_tools:
        sync_to_supabase(all_new_tools)
    else:
        # If everything fails, add today's verified hand-picked tools so site is never empty
        print("⚠️ No new tools found today. Adding daily verified picks.")
        fallback = [
            {"name": "DeepSeek V3", "url": "https://www.deepseek.com/", "description": "Powerful open-source LLM for coding and reasoning.", "category": "LLM", "launched_at": time.strftime('%Y-%m-%d')},
            {"name": "Mistral Large 2", "url": "https://mistral.ai", "description": "Top-tier European AI model with huge context.", "category": "LLM", "launched_at": time.strftime('%Y-%m-%d')},
            {"name": "Kling AI", "url": "https://klingai.com", "description": "High-fidelity AI video generation platform.", "category": "Video AI", "launched_at": time.strftime('%Y-%m-%d')}
        ]
        sync_to_supabase(fallback)

if __name__ == "__main__":
    scrape_multi_source()   