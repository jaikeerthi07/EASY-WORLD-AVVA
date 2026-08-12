import os
import re
import subprocess
import threading
import time

FRONTEND_CONFIG_PATH = "e:/EHS Avva Inventory/src/config.js"

print("==================================================")
print("  AUTOMATED DEMO TUNNEL (GUARANTEED 60 MINUTES)  ")
print("==================================================")

def extract_url(text):
    match = re.search(r'(https://[a-zA-Z0-9-]+\.a\.free\.pinggy\.link)', text)
    if not match:
        match = re.search(r'(https://[a-zA-Z0-9-]+\.a\.free\.pinggy\.io)', text)
    if match:
        return match.group(1)
    return None

def update_and_push(url):
    print(f"\n[+] Found Pinggy URL: {url}")
    print("[+] Updating Vercel Frontend Configuration...")
    
    with open(FRONTEND_CONFIG_PATH, "r") as f:
        content = f.read()
    
    # Force hardcode the URL to prevent Vercel ENV caching it wrong
    new_content = re.sub(
        r'export const API_BASE_URL = .*?;',
        f'export const API_BASE_URL = "{url}";',
        content
    )
    
    with open(FRONTEND_CONFIG_PATH, "w") as f:
        f.write(new_content)
    
    print("[+] Committing the update to trigger Vercel deployment...")
    subprocess.run(["git", "add", "src/config.js"], cwd="e:/EHS Avva Inventory")
    subprocess.run(["git", "commit", "-m", f"Fix: Force Pinggy Demo URL ({url})"], cwd="e:/EHS Avva Inventory")
    subprocess.run(["git", "push"], cwd="e:/EHS Avva Inventory")
    
    print("\n===================================================================")
    print(" DONE! Vercel is building the DEMO app right now. Wait ~2 mins.")
    print(" KEEP THIS WINDOW OPEN! This highly stable connection lasts 60m!")
    print("===================================================================")

def run_tunnel():
    print("[+] Starting Pinggy Tunnel...")
    
    # Automatically accept host keys using StrictHostKeyChecking=no
    process = subprocess.Popen(
        ["ssh", "-o", "StrictHostKeyChecking=no", "-p", "443", "-R0:localhost:5000", "a.pinggy.io"],
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
        print("[PINGGY]", line.strip())
        
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
