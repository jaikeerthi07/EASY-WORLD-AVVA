import os

def main():
    base_dir = r"e:\EHS Avva Inventory\src"
    
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')) and file != 'config.js':
                filepath = os.path.join(root, file)
                changed = False
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                new_lines = []
                for line in lines:
                    if 'const API_BASE_URL =' in line or 'const API_BASE_URL=' in line:
                        changed = True
                    else:
                        new_lines.append(line)
                
                if changed:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.writelines(new_lines)
                    print(f"Removed duplicate API_BASE_URL in {filepath}")

if __name__ == "__main__":
    main()
