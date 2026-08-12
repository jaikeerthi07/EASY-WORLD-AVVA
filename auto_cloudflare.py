import os
import re
import subprocess
import threading
import time
import sys

CLOUDFLARED_PATH = "e:/EHS Avva Inventory/cloudflared.exe"
FRONTEND_CONFIG_PATH = "e:/EHS Avva Inventory/src/config.js"

print("==================================================")
print("  AUTOMATED 24-HR TUNNEL & VERCEL DEPLOYMENT    ")
print("==================================================")

def extract_url(text):
    match = re.search(r'(https://[a-zA-Z0-9-]+\.trycloudflare\.com)', text)
    if match:
        return match.group(1)
    return None

def update_and_push(url):
    print(f"\n[+] Found Cloudflare URL: {url}")
    print("[+] Updating Vercel Frontend Configuration...")
    
    # 1. Update config.js
    with open(FRONTEND_CONFIG_PATH, "r") as f:
        content = f.read()
    
    # Replace the existing export string
    new_content = re.sub(
        r'export const API_BASE_URL = .*?;',
        f'export const API_BASE_URL = "{url}";',
        content
    )
    
    with open(FRONTEND_CONFIG_PATH, "w") as f:
        f.write(new_content)
    
    # 2. Add, Commit, and Push via git
    print("[+] Committing the update to trigger Vercel deployment...")
    subprocess.run(["git", "add", "src/config.js"], cwd="e:/EHS Avva Inventory")
    subprocess.run(["git", "commit", "-m", f"Auto-Update API URL to {url}"], cwd="e:/EHS Avva Inventory")
    subprocess.run(["git", "push"], cwd="e:/EHS Avva Inventory")
    
    print("\n===================================================================")
    print(" DONE! Vercel is building the app right now. It will take ~1-2 min.")
    print(" KEEP THIS WINDOW OPEN to keep the backend connection alive!")
    print("===================================================================")

def run_tunnel():
    print("[+] Starting Cloudflared Tunnel...")
    process = subprocess.Popen(
        [CLOUDFLARED_PATH, "tunnel", "--url", "http://127.0.0.1:5000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        encoding="utf-8"
    )
    
    url_found = False
    while True:
        line = process.stdout.readline()
        if not line:
            break
        print("[Cloudflared]", line.strip())
        
        if not url_found:
            url = extract_url(line)
            if url:
                url_found = True
                threading.Thread(target=update_and_push, args=(url,)).start()

if __name__ == "__main__":
    try:
        run_tunnel()
    except KeyboardInterrupt:
        print("\n[!] Tunnel closed.")
