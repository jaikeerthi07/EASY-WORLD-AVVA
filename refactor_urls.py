import os
import re

def main():
    base_dir = r"e:\EHS Avva Inventory\src"
    
    # Regex definitions
    # Match "http://localhost:5000..." or '...'
    regex_quotes = re.compile(r'(["\'])http://localhost:5000(.*?)\1')
    # Match `http://localhost:5000...`
    regex_ticks = re.compile(r'`http://localhost:5000(.*?)`')

    # Look for files
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')) and file != 'config.js':
                filepath = os.path.join(root, file)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if "localhost:5000" in content:
                    # Calculate relative import
                    # If in src/, import from './config'
                    # If in src/components/, import from '../config'
                    rel_dir = os.path.relpath(root, base_dir)
                    
                    if rel_dir == '.':
                        import_stmt = "import { API_BASE_URL } from './config';\n"
                    else:
                        depth = len(rel_dir.split(os.sep))
                        prefix = "../" * depth
                        import_stmt = f"import {{ API_BASE_URL }} from '{prefix}config';\n"

                    new_content = regex_quotes.sub(r'`${API_BASE_URL}\2`', content)
                    new_content = regex_ticks.sub(r'`${API_BASE_URL}\1`', new_content)

                    # Only add import if it's not already there and there was an actual link replacement
                    if 'API_BASE_URL' in new_content and 'import { API_BASE_URL }' not in new_content:
                        # Find where to put the import stmt (usually after other imports)
                        lines = new_content.split('\n')
                        import_index = 0
                        for i, line in enumerate(lines):
                            if line.startswith('import '):
                                import_index = i + 1
                        
                        lines.insert(import_index, import_stmt.strip())
                        new_content = '\n'.join(lines)

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == "__main__":
    main()
