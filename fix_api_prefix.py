import os
import re

def main():
    base_dir = r"e:\EHS Avva Inventory\src"
    
    # List of endpoints that MUST have /api/ prefix
    api_endpoints = ['employees', 'products', 'billing', 'quotations', 'invoices', 'attendance', 'salary', 'enquiries', 'auth']
    
    # Pattern looks for `${API_BASE_URL}/endpoint` and misses `/api`
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                modified = False
                new_content = content
                
                for endpoint in api_endpoints:
                    # Look for exact `${API_BASE_URL}/endpoint`
                    search_str = f"${{API_BASE_URL}}/{endpoint}"
                    api_str = f"${{API_BASE_URL}}/api/{endpoint}"
                    
                    if search_str in new_content and api_str not in new_content:
                        new_content = new_content.replace(search_str, api_str)
                        modified = True

                if modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed missing /api in {filepath}")

if __name__ == "__main__":
    main()
