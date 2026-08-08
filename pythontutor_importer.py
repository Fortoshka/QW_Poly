#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pythontutor Archival Importer & Polygon Uploader module for QW_Toolset / QW_Poly.
Fetches, parses, and migrates programming problems from pythontutor.ru (web.archive.org)
to Codeforces Polygon or local QW task formats.
"""

import sys
import os
import json
import re
import time
import hashlib
import random
import string
import ssl
import urllib.request
import urllib.parse
from html import unescape

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DEFAULT_ARCHIVE_TIMESTAMP = "20240301103830"
DEFAULT_LESSONS = [
    'inout_and_arithmetic_operations',
    'ifelse',
    'int_and_float',
    'for_loop',
    'str',
    'while',
    'lists',
    'functions',
    '2d_arrays',
    'sets',
    'dicts'
]

CYRILLIC_TO_LATIN = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo', 'Ж': 'zh',
    'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n', 'О': 'o',
    'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts',
    'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch', 'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu',
    'Я': 'ya'
}

def to_system_name(name):
    res = ""
    for char in name:
        if char in CYRILLIC_TO_LATIN:
            res += CYRILLIC_TO_LATIN[char]
        else:
            res += char
    res = re.sub(r'[^a-z0-9]+', '-', res.lower()).strip('-')
    if not res:
        res = "problem"
    elif not re.match(r'^[a-z]', res):
        res = "p-" + res
    return res

def fetch_html(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        return resp.read().decode('utf-8', errors='replace')

def resolve_problem_url(url_or_slug, timestamp=DEFAULT_ARCHIVE_TIMESTAMP):
    if 'web.archive.org' in url_or_slug:
        return url_or_slug
    
    if 'pythontutor.ru' in url_or_slug:
        clean = re.sub(r'^https?://', '', url_or_slug)
        return f"https://web.archive.org/web/{timestamp}/http://{clean}"
    
    slug = url_or_slug.strip('/')
    
    for lesson in DEFAULT_LESSONS:
        target = f"https://web.archive.org/web/{timestamp}/http://pythontutor.ru/lessons/{lesson}/problems/{slug}/"
        try:
            html = fetch_html(target)
            if 'class="problem_name"' in html or 'id="example_tests"' in html:
                return target
        except Exception:
            continue
            
    return f"https://web.archive.org/web/{timestamp}/http://pythontutor.ru/lessons/for_loop/problems/{slug}/"

def parse_pythontutor_problem(url_or_slug):
    url = resolve_problem_url(url_or_slug)
    print(f"[*] Fetching: {url}")
    html = fetch_html(url)

    title_match = re.search(r'<h3[^>]*class=["\']problem_name["\'][^>]*>(.*?)</h3>', html, re.DOTALL)
    title = "Untitled Problem"
    if title_match:
        raw_title = title_match.group(1)
        raw_title = re.sub(r'<[^>]+>', '', raw_title)
        title = unescape(raw_title).strip()
        title = re.sub(r'^Задача\s*[«"»&laquo;&raquo;]*', '', title)
        title = re.sub(r'[»"»&laquo;&raquo;]*$', '', title).strip()

    legend_match = re.search(r'<h4><small>Условие</small></h4>\s*(.*?)\s*<hr>', html, re.DOTALL)
    legend_raw = legend_match.group(1) if legend_match else ""

    legend_clean = legend_raw
    legend_clean = re.sub(r'&le;', r'\\le ', legend_clean)
    legend_clean = re.sub(r'&ge;', r'\\ge ', legend_clean)
    legend_clean = re.sub(r'&times;', r'\\times ', legend_clean)
    legend_clean = re.sub(r'&ne;', r'\\ne ', legend_clean)
    legend_clean = re.sub(r'&nbsp;', ' ', legend_clean)
    legend_clean = unescape(legend_clean)
    
    legend_text = re.sub(r'<p[^>]*>', '\n\n', legend_clean)
    legend_text = re.sub(r'<br\s*/?>', '\n', legend_text)
    legend_text = re.sub(r'<code>(.*?)</code>', r'\\t{\1}', legend_text)
    legend_text = re.sub(r'<[^>]+>', '', legend_text).strip()

    input_format = "Входные данные содержат параметры согласно условию задачи."
    output_format = "Выведите ответ на задачу."

    inputs = re.findall(r'<pre[^>]*class=["\']input["\'][^>]*>(.*?)</pre>', html, re.DOTALL)
    outputs = re.findall(r'<pre[^>]*class=["\']output["\'][^>]*>(.*?)</pre>', html, re.DOTALL)

    tests = []
    examples = []
    for idx, (inp, out) in enumerate(zip(inputs, outputs), 1):
        inp_str = unescape(inp).replace('\r\n', '\n').strip('\r')
        out_str = unescape(out).replace('\r\n', '\n').strip('\r')
        
        if inp_str and not inp_str.endswith('\n'):
            inp_str += '\n'
        if out_str and not out_str.endswith('\n'):
            out_str += '\n'

        tests.append({
            'id': idx,
            'input': inp_str,
            'output': out_str,
            'useInStatements': idx <= 2
        })
        examples.append({
            'input': inp_str,
            'output': out_str
        })

    slug = url_or_slug.rstrip('/').split('/')[-1]
    system_name = to_system_name(slug) if slug and not slug.startswith('http') else to_system_name(title)

    return {
        'slug': slug,
        'systemName': system_name,
        'title': title,
        'legend': legend_text,
        'inputFormat': input_format,
        'outputFormat': output_format,
        'timeLimit': 2000,
        'memoryLimit': 256,
        'tests': tests,
        'examples': examples,
        'sourceUrl': url
    }

def save_local_task(prob_data, output_dir=None):
    sys_name = prob_data['systemName']
    if not output_dir:
        output_dir = os.path.join(os.getcwd(), 'sample_tasks', sys_name)
    
    os.makedirs(os.path.join(output_dir, 'tests'), exist_ok=True)
    
    prob_json_path = os.path.join(output_dir, 'problem.json')
    json_content = {
        "title": prob_data['title'],
        "description": prob_data['legend'],
        "inputFormat": prob_data['inputFormat'],
        "outputFormat": prob_data['outputFormat'],
        "timeLimit": prob_data['timeLimit'],
        "memoryLimit": prob_data['memoryLimit'],
        "examples": prob_data['examples']
    }
    with open(prob_json_path, 'w', encoding='utf-8') as f:
        json.dump(json_content, f, ensure_ascii=False, indent=2)
        
    for test in prob_data['tests']:
        test_file_name = f"{test['id']:02d}"
        in_path = os.path.join(output_dir, 'tests', test_file_name)
        with open(in_path, 'w', encoding='utf-8') as f:
            f.write(test['input'])
        
        if test['output']:
            ans_path = os.path.join(output_dir, 'tests', f"{test_file_name}.a")
            with open(ans_path, 'w', encoding='utf-8') as f:
                f.write(test['output'])

    print(f"[+] Task saved locally to: {output_dir}")
    return output_dir

def polygon_api_call(method_name, params, api_key, api_secret):
    rand = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    time_stamp = str(int(time.time()))
    
    full_params = dict(params)
    full_params['apiKey'] = api_key
    full_params['time'] = time_stamp

    sorted_keys = sorted(full_params.keys())
    param_pairs = []
    for k in sorted_keys:
        v = full_params[k]
        if isinstance(v, list):
            for item in sorted(v):
                param_pairs.append(f"{k}={item}")
        else:
            param_pairs.append(f"{k}={v}")

    query_str = "&".join(param_pairs)
    sig_base = f"{rand}/{method_name}?{query_str}#{api_secret}"
    api_sig = rand + hashlib.sha512(sig_base.encode('utf-8')).hexdigest()

    encoded_data = urllib.parse.urlencode(full_params, doseq=True).encode('utf-8') + f"&apiSig={api_sig}".encode('utf-8')
    url = f"https://polygon.codeforces.com/api/{method_name}"

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, data=encoded_data, headers=headers)

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get('status') == 'FAILED':
                raise RuntimeError(data.get('comment', 'Polygon API request failed'))
            return data
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        try:
            err_json = json.loads(err_body)
            raise RuntimeError(err_json.get('comment', f"HTTP {e.code}"))
        except Exception:
            raise RuntimeError(f"HTTP Error {e.code}: {err_body}")

def upload_to_polygon(prob_data, api_key, api_secret):
    sys_name = prob_data['systemName']
    print(f"[*] Creating problem '{sys_name}' on Polygon...")
    
    res = polygon_api_call('problem.create', {'name': sys_name}, api_key, api_secret)
    prob_id = res['result']['id']
    print(f"[+] Problem created! ID: {prob_id}")

    print("[*] Updating time and memory limits...")
    polygon_api_call('problem.updateInfo', {
        'problemId': prob_id,
        'timeLimit': prob_data['timeLimit'],
        'memoryLimit': prob_data['memoryLimit']
    }, api_key, api_secret)

    print("[*] Saving Russian statement...")
    polygon_api_call('problem.saveStatement', {
        'problemId': prob_id,
        'lang': 'russian',
        'name': prob_data['title'],
        'legend': prob_data['legend'],
        'input': prob_data['inputFormat'],
        'output': prob_data['outputFormat']
    }, api_key, api_secret)

    print("[*] Setting checker to std::ncmp.cpp...")
    polygon_api_call('problem.setChecker', {
        'problemId': prob_id,
        'checker': 'std::ncmp.cpp'
    }, api_key, api_secret)

    print(f"[*] Uploading {len(prob_data['tests'])} tests...")
    for idx, test in enumerate(prob_data['tests'], 1):
        polygon_api_call('problem.saveTest', {
            'problemId': prob_id,
            'testIndex': idx,
            'testInput': test['input'],
            'testUseInStatements': 'true' if test['useInStatements'] else 'false',
            'testDescription': f"Imported test {idx}"
        }, api_key, api_secret)
        print(f"  [+] Uploaded test #{idx}")

    print("[*] Committing changes on Polygon...")
    polygon_api_call('problem.commitChanges', {
        'problemId': prob_id,
        'message': f"Automated import from pythontutor ({prob_data['slug']})"
    }, api_key, api_secret)

    print(f"[SUCCESS] Problem '{prob_data['title']}' (ID: {prob_id}) fully uploaded to Polygon!")
    return prob_id

def main():
    if len(sys.argv) < 2:
        print("Usage: python pythontutor_importer.py <url_or_slug> [--local | --upload] [--key API_KEY] [--secret API_SECRET]")
        print("Examples:")
        print("  python pythontutor_importer.py series_1 --local")
        print("  python pythontutor_importer.py https://web.archive.org/web/20240301103830/http://pythontutor.ru/lessons/for_loop/problems/series_1/ --upload --key YOUR_KEY --secret YOUR_SECRET")
        sys.exit(1)

    target = sys.argv[1]
    parsed = parse_pythontutor_problem(target)
    
    print("\n--- Parsed Problem Details ---")
    print(f"Title: {parsed['title']}")
    print(f"System Name: {parsed['systemName']}")
    print(f"Tests Count: {len(parsed['tests'])}")
    print(f"Legend Preview: {parsed['legend'][:120]}...\n")

    if '--upload' in sys.argv:
        key = None
        secret = None
        if '--key' in sys.argv:
            key = sys.argv[sys.argv.index('--key') + 1]
        if '--secret' in sys.argv:
            secret = sys.argv[sys.argv.index('--secret') + 1]
            
        key = key or os.environ.get('POLYGON_API_KEY')
        secret = secret or os.environ.get('POLYGON_API_SECRET')
        
        if not key or not secret:
            print("[ERROR] Polygon API Key and Secret are required for upload. Pass --key and --secret or set POLYGON_API_KEY and POLYGON_API_SECRET environment variables.")
            sys.exit(1)
            
        upload_to_polygon(parsed, key, secret)
    else:
        save_local_task(parsed)

if __name__ == '__main__':
    main()
