/**
 * QW_Poly Zero-Dependency Code Syntax Highlighter
 * Fast, lightweight regex-based tokenization for C++ and Python
 * Synchronized with textarea overlay architecture.
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const CPP_TOKEN_REGEX = /(?<comment>\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)|(?<macro>#[ \t]*(?:include|define|undef|if|ifdef|ifndef|elif|else|endif|pragma|error|warning)\b[^\r\n]*)|(?<string>"(?:\\.|[^"\r\n])*"|'(?:\\.|[^'\r\n])*')|(?<keyword>\b(?:int|long|short|char|float|double|bool|void|auto|signed|unsigned|size_t|int64_t|uint64_t|int32_t|uint32_t|const|constexpr|static|volatile|mutable|register|inline|virtual|override|final|struct|class|union|enum|namespace|using|typedef|template|typename|public|private|protected|friend|operator|new|delete|this|nullptr|true|false|if|else|switch|case|default|break|continue|return|goto|while|do|for|try|catch|throw|noexcept|sizeof|alignof|decltype|concept|requires)\b)|(?<number>\b0[xX][0-9a-fA-F]+[uUlL]*\b|\b0[bB][01]+[uUlL]*\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[uUlLfF]*\b)|(?<function>\b[a-zA-Z_]\w*(?=\s*\())|(?<operator>::|<<=|>>=|->\*|->|<<|>>|<=|>=|==|!=|&&|\|\||\+\+|--|[+\-*/%&|^~!=<>]=?)|(?<punctuation>[{}()\[\];,.:])/g;

const PYTHON_TOKEN_REGEX = /(?<comment>#[^\r\n]*)|(?<string>"""(?:\\.|[\s\S])*?"""|'''(?:\\.|[\s\S])*?'''|[fFrRuUbB]*"(?:\\.|[^"\r\n])*"|[fFrRuUbB]*'(?:\\.|[^'\r\n])*')|(?<decorator>@[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*)|(?<keyword>\b(?:def|class|lambda|return|yield|import|from|as|if|elif|else|while|for|in|try|except|finally|with|raise|assert|pass|break|continue|global|nonlocal|async|await|match|case|True|False|None|and|or|not|is)\b)|(?<builtin>\b(?:print|input|len|range|enumerate|zip|map|filter|sum|min|max|abs|round|int|float|str|list|dict|set|tuple|bool|open|sorted|reversed|isinstance|type|super|id|any|all)\b)|(?<number>\b0[xX][0-9a-fA-F]+\b|\b0[bB][01]+\b|\b0[oO][0-7]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(?<function>\b[a-zA-Z_]\w*(?=\s*\())|(?<operator>\*\*=?|\/\/=?|<<=?|>>=?|<=|>=|==|!=|[+\-*/%&|^~=<>]=?)|(?<punctuation>[{}()\[\]:;,.\\])/g;

const TOKEN_CLASS_MAP = {
  comment: 'token comment',
  macro: 'token macro',
  string: 'token string',
  keyword: 'token keyword',
  builtin: 'token class-name',
  decorator: 'token macro',
  number: 'token number',
  function: 'token function',
  operator: 'token operator',
  punctuation: 'token punctuation'
};

/**
 * Tokenizes code into HTML spans with CSS classes
 */
function highlightCode(code, lang) {
  const isPython = lang === 'python' || lang === 'py';
  const regex = isPython ? PYTHON_TOKEN_REGEX : CPP_TOKEN_REGEX;

  let result = '';
  let lastIndex = 0;
  let match;
  regex.lastIndex = 0;

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(code.substring(lastIndex, match.index));
    }

    const groups = match.groups;
    let matchedType = null;
    if (groups) {
      for (const key in groups) {
        if (groups[key] !== undefined) {
          matchedType = key;
          break;
        }
      }
    }

    if (matchedType && TOKEN_CLASS_MAP[matchedType]) {
      result += `<span class="${TOKEN_CLASS_MAP[matchedType]}">${escapeHtml(match[0])}</span>`;
    } else {
      result += escapeHtml(match[0]);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < code.length) {
    result += escapeHtml(code.substring(lastIndex));
  }

  return result;
}

/**
 * Attaches lightweight, synchronized syntax highlighting overlay to a textarea.
 *
 * @param {HTMLTextAreaElement} textarea - The textarea to enhance
 * @param {() => string} getLanguage - Function returning 'cpp' | 'python'
 * @returns {{ update: () => void, setLanguage: (lang: string) => void }}
 */
export function attachSyntaxHighlight(textarea, getLanguage) {
  if (!textarea || textarea.dataset.syntaxAttached === 'true') {
    return { update: () => {}, setLanguage: () => {} };
  }
  textarea.dataset.syntaxAttached = 'true';

  let currentLang = (typeof getLanguage === 'function' ? getLanguage() : getLanguage) || 'cpp';

  // 1. Create wrapper container around textarea
  const wrapper = document.createElement('div');
  wrapper.className = 'code-editor-wrapper';

  if (textarea.style.height) {
    wrapper.style.height = textarea.style.height;
  }

  textarea.parentNode.insertBefore(wrapper, textarea);

  // 2. Create the highlight layer (<pre><code>)
  const pre = document.createElement('pre');
  pre.className = 'code-highlight-layer';
  pre.setAttribute('aria-hidden', 'true');

  const code = document.createElement('code');
  code.className = `language-${currentLang}`;
  pre.appendChild(code);

  wrapper.appendChild(pre);
  wrapper.appendChild(textarea);

  // 3. Highlight function
  function updateHighlight() {
    const rawCode = textarea.value;
    const lang = (typeof getLanguage === 'function' ? getLanguage() : currentLang) || 'cpp';

    // Trailing newline needs a space character so pre layer renders trailing line height accurately
    const textToHighlight = rawCode.endsWith('\n') ? rawCode + ' ' : (rawCode || ' ');

    try {
      code.innerHTML = highlightCode(textToHighlight, lang);
    } catch {
      code.textContent = textToHighlight;
    }

    // Toggle has-value class on wrapper for CSS floating labels
    const hasValue = rawCode.trim().length > 0;
    wrapper.classList.toggle('has-value', hasValue);

    // Keep scroll in sync
    pre.scrollTop = textarea.scrollTop;
    pre.scrollLeft = textarea.scrollLeft;
  }

  // 4. Intercept direct property assignment (e.g. textarea.value = '...')
  const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
  if (originalDescriptor && originalDescriptor.set) {
    Object.defineProperty(textarea, 'value', {
      get() {
        return originalDescriptor.get.call(this);
      },
      set(val) {
        originalDescriptor.set.call(this, val);
        updateHighlight();
      },
      configurable: true
    });
  }

  // 5. Input & Scroll event listeners
  textarea.addEventListener('input', updateHighlight);

  textarea.addEventListener('scroll', () => {
    pre.scrollTop = textarea.scrollTop;
    pre.scrollLeft = textarea.scrollLeft;
  });

  // 6. Tab key support (4 spaces indentation for competitive programming)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      if (start === end) {
        if (!e.shiftKey) {
          // Insert 4 spaces
          const before = val.substring(0, start);
          const after = val.substring(end);
          textarea.value = before + '    ' + after;
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        } else {
          // Shift+Tab: remove up to 4 spaces before cursor
          const lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const linePrefix = val.substring(lineStart, start);
          const spacesMatch = linePrefix.match(/ {1,4}$/);
          if (spacesMatch) {
            const count = spacesMatch[0].length;
            textarea.value = val.substring(0, start - count) + val.substring(start);
            textarea.selectionStart = textarea.selectionEnd = start - count;
          }
        }
      } else {
        // Multi-line selection indent/unindent
        const startLine = val.lastIndexOf('\n', start - 1) + 1;
        let endLine = val.indexOf('\n', end);
        if (endLine === -1) endLine = val.length;

        const lines = val.substring(startLine, endLine).split('\n');
        let newLines;
        let diff = 0;

        if (!e.shiftKey) {
          newLines = lines.map(line => {
            diff += 4;
            return '    ' + line;
          });
        } else {
          newLines = lines.map(line => {
            const remove = line.match(/^ {1,4}/);
            if (remove) {
              diff -= remove[0].length;
              return line.substring(remove[0].length);
            }
            return line;
          });
        }

        textarea.value = val.substring(0, startLine) + newLines.join('\n') + val.substring(endLine);
        textarea.selectionStart = start;
        textarea.selectionEnd = Math.max(start, end + diff);
      }

      updateHighlight();
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  // 7. Initial highlight
  updateHighlight();

  return {
    update: updateHighlight,
    setLanguage(newLang) {
      currentLang = newLang;
      code.className = `language-${newLang}`;
      updateHighlight();
    }
  };
}
