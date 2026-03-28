import os
import re

base_dir = r"c:\Users\lenovo\Downloads\CampConnect-main\backend\src\main\java\com\campconnect"

# 1. Rename directories
dirs_to_rename = {
    "model": "Entite",
    "repository": "repositories",
    "service": "services",
    "controller": "controllers"
}

for old, new in dirs_to_rename.items():
    old_path = os.path.join(base_dir, old)
    new_path = os.path.join(base_dir, new)
    if os.path.exists(old_path) and not os.path.exists(new_path):
        os.rename(old_path, new_path)

# 2. Update packages and imports globally
def update_packages_and_imports():
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.endswith(".java"):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for old, new in dirs_to_rename.items():
                    new_content = re.sub(rf'\bpackage\s+com\.campconnect\.{old}\b', f'package com.campconnect.{new}', new_content)
                    new_content = re.sub(rf'\bimport\s+com\.campconnect\.{old}\b', f'import com.campconnect.{new}', new_content)
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

update_packages_and_imports()

def get_method_signatures(class_content, class_name):
    sigs = []
    lines = class_content.split('\n')
    current_sig = ""
    in_sig = False
    for line in lines:
        stripped = line.strip()
        if not in_sig:
            if stripped.startswith("public ") and " class " not in stripped and " interface " not in stripped and " enum " not in stripped:
                current_sig = stripped
                if "{" in current_sig:
                    sigs.append(current_sig.split("{")[0].strip())
                    current_sig = ""
                else:
                    in_sig = True
        else:
            current_sig += " " + stripped
            if "{" in current_sig:
                sigs.append(current_sig.split("{")[0].strip())
                in_sig = False
                current_sig = ""
                
    final_sigs = []
    for sig in sigs:
        if f"public {class_name}" in sig and "(" in sig:
            continue
        final_sigs.append(sig)
    return final_sigs

def refactor_module(module_name):
    print(f"Refactoring {module_name}...")
    
    # Repositories
    repo_dir = os.path.join(base_dir, "repositories", module_name)
    if os.path.exists(repo_dir):
        for file in os.listdir(repo_dir):
            if file.endswith("Repository.java") and not file.startswith("I"):
                old_name = file[:-5]
                new_name = f"I{old_name}"
                
                old_path = os.path.join(repo_dir, file)
                new_path = os.path.join(repo_dir, f"{new_name}.java")
                
                with open(old_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                content = re.sub(rf'\binterface\s+{old_name}\b', f'interface {new_name}', content)
                
                with open(new_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                os.remove(old_path)
                
                for root, _, mfiles in os.walk(base_dir):
                    for mfile in mfiles:
                        if mfile.endswith(".java"):
                            mpath = os.path.join(root, mfile)
                            with open(mpath, 'r', encoding='utf-8') as f:
                                mcontent = f.read()
                            mcontent_new = re.sub(rf'\b{old_name}\b', new_name, mcontent)
                            if mcontent_new != mcontent:
                                with open(mpath, 'w', encoding='utf-8') as f:
                                    f.write(mcontent_new)

    # Controllers
    ctrl_dir = os.path.join(base_dir, "controllers", module_name)
    if os.path.exists(ctrl_dir):
        for file in os.listdir(ctrl_dir):
            if file.endswith("Controller.java") and not file.endswith("RestController.java"):
                old_name = file[:-5]
                base_name = old_name[:-10]
                new_name = f"{base_name}RestController"
                
                old_path = os.path.join(ctrl_dir, file)
                new_path = os.path.join(ctrl_dir, f"{new_name}.java")
                
                with open(old_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                content = re.sub(rf'\bclass\s+{old_name}\b', f'class {new_name}', content)
                
                with open(new_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                os.remove(old_path)

    # Services
    srv_dir = os.path.join(base_dir, "services", module_name)
    if os.path.exists(srv_dir):
        for file in os.listdir(srv_dir):
            if file.endswith("Service.java") and not file.startswith("I"):
                old_name = file[:-5]
                base_name = old_name[:-7]
                
                if old_name.endswith("Services"):
                    base_name = old_name[:-8]
                    
                interface_name = f"I{base_name}Services"
                impl_name = f"{base_name}ServicesImpl"
                
                old_path = os.path.join(srv_dir, file)
                interface_path = os.path.join(srv_dir, f"{interface_name}.java")
                impl_path = os.path.join(srv_dir, f"{impl_name}.java")
                
                with open(old_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                method_sigs = get_method_signatures(content, old_name)
                
                pkg_match = re.search(r'package\s+[\w\.]+;', content)
                package_decl = pkg_match.group(0) if pkg_match else f"package com.campconnect.services.{module_name};"
                
                imports = "\n".join(re.findall(r'import\s+[\w\.\*]+;', content))
                
                interface_content = f"{package_decl}\n\n{imports}\n\npublic interface {interface_name} {{\n"
                for sig in method_sigs:
                    interface_content += f"    {sig};\n"
                interface_content += "}\n"
                
                with open(interface_path, 'w', encoding='utf-8') as f:
                    f.write(interface_content)
                
                impl_content = re.sub(rf'\bclass\s+{old_name}\b', f'class {impl_name} implements {interface_name}', content)
                # Ensure we also rename constructor if any explicit was used
                impl_content = re.sub(rf'\bpublic\s+{old_name}\s*\(', f'public {impl_name}(', impl_content)
                
                with open(impl_path, 'w', encoding='utf-8') as f:
                    f.write(impl_content)
                os.remove(old_path)
                
                for root, _, mfiles in os.walk(base_dir):
                    for mfile in mfiles:
                        if mfile.endswith(".java"):
                            mpath = os.path.join(root, mfile)
                            if mpath == impl_path:
                                continue # dont mess up the impl we just wrote
                            with open(mpath, 'r', encoding='utf-8') as f:
                                mcontent = f.read()
                            mcontent_new = re.sub(rf'\b{old_name}\b', interface_name, mcontent)
                            if mcontent_new != mcontent:
                                with open(mpath, 'w', encoding='utf-8') as f:
                                    f.write(mcontent_new)

refactor_module("trip")
refactor_module("transport")
