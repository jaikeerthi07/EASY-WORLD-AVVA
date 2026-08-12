import os
import re

def fix_imports():
    base_dir = r"e:\EHS Avva Inventory\src"
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')) and file != 'config.js':
                filepath = os.path.join(root, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()

                new_lines = []
                import_stmt = ""
                found = False

                for line in lines:
                    if 'import { API_BASE_URL } from' in line:
                        import_stmt = line.strip() + "\n"
                        found = True
                    else:
                        new_lines.append(line)

                if found and import_stmt:
                    new_lines.insert(0, import_stmt)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.writelines(new_lines)
                    print(f"Fixed {filepath}")

if __name__ == "__main__":
    fix_imports()
