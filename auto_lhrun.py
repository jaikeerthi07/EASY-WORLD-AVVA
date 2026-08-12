import os
import re
import subprocess
import threading
import time

FRONTEND_CONFIG_PATH = "e:/EHS Avva Inventory/src/config.js"

print("==================================================")
print("  AUTOMATED 24-HR VERCEL TUNNEL (NO CLOUDFLARE)  ")
print("==================================================")

def extract_url(text):
    match = re.search(r'(https://[a-zA-Z0-9-]+\.localhost\.run)', text)
    if match:
        return match.group(1)
    return None

def update_and_push(url):
    print(f"\n[+] Found localhost.run URL: {url}")
    print("[+] Updating Vercel Frontend Configuration...")
    
    with open(FRONTEND_CONFIG_PATH, "r") as f:
        content = f.read()
    
    new_content = re.sub(
        r'export const API_BASE_URL = .*?;',
        f'export const API_BASE_URL = "{url}";',
        content
    )
    
    with open(FRONTEND_CONFIG_PATH, "w") as f:
        f.write(new_content)
    
    print("[+] Committing the update to trigger Vercel deployment...")
    subprocess.run(["git", "add", "src/config.js"], cwd="e:/EHS Avva Inventory")
    subprocess.run(["git", "commit", "-m", f"Fix: Bypass anti-bot by using valid ssh tunnel URL ({url})"], cwd="e:/EHS Avva Inventory")
    subprocess.run(["git", "push"], cwd="e:/EHS Avva Inventory")
    
    print("\n===================================================================")
    print(" DONE! Vercel is building the app right now. It will take ~1-2 min.")
    print(" KEEP THIS WINDOW OPEN to keep the connection alive!")
    print("===================================================================")

def run_tunnel():
    print("[+] Starting LHRUN Tunnel...")
    process = subprocess.Popen(
        ["ssh", "-o", "StrictHostKeyChecking=no", "-R", "80:localhost:5000", "localhost.run"],
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
        print("[LHRUN]", line.strip())
        
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
