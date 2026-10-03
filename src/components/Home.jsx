import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { addToPastes, updateToPastes } from "../redux/pasteSlice";
import * as prettier from "prettier/standalone";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import * as htmlPlugin from "prettier/plugins/html";
import * as postcssPlugin from "prettier/plugins/postcss";

function formatFallbackCode(source) {
    let indentLevel = 0;
    return source
        .split('\n')
        .map((line) => line.trim())
        .filter((line, index, lines) => line || lines[index - 1])
        .map((line) => {
            if (/^[}\])]/.test(line) || /^else\b/.test(line)) {
                indentLevel = Math.max(indentLevel - 1, 0);
            }

            const formattedLine = `${'    '.repeat(indentLevel)}${line}`;

            if (/[{[(]$/.test(line) || /:\s*$/.test(line)) {
                indentLevel += 1;
            }

            return formattedLine;
        })
        .join('\n');
}

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const pasteId = searchParams.get("pasteId");
    const selectedPaste = useSelector((state) =>
        state.paste.pastes.find((paste) => paste._id === pasteId)
    );
    const [title, setTitle] = useState(selectedPaste?.title ?? '');
    const [value, setValue] = useState(selectedPaste?.content ?? '');
    const [pasteType, setPasteType] = useState(selectedPaste?.type ?? 'text');
    const [language, setLanguage] = useState(selectedPaste?.language ?? 'javascript');
    const dispatch = useDispatch();

    async function formatCode() {
        if (pasteType !== 'code' || !value.trim()) {
            return;
        }

        const parser = {
            javascript: 'babel',
            html: 'html',
            css: 'css',
        }[language];

        if (!parser) {
            const formatted = formatFallbackCode(value);
            setValue(formatted);
            return formatted;
        }

        try {
            const formatted = await prettier.format(value, {
                parser,
                plugins: [babelPlugin, estreePlugin, htmlPlugin, postcssPlugin],
                semi: true,
                singleQuote: true,
                tabWidth: 4,
            });
            setValue(formatted.trimEnd());
            return formatted.trimEnd();
        } catch {
            toast.error("Code could not be formatted yet.");
            return value;
        }
    }

    function handleEditorKeyDown(event) {
        if (pasteType !== 'code') {
            return;
        }

        const start = event.target.selectionStart;
        const end = event.target.selectionEnd;
        const key = event.key;
        const pairs = { '(': ')', '[': ']', '{': '}', "'": "'", '"': '"' };
        const isClosingPair = Object.values(pairs).includes(key)
            && value[start] === key
            && start === end;
        const isPairedBackspace = key === 'Backspace'
            && start === end
            && pairs[value[start - 1]] === value[start];
        const isEditorKey = key === 'Tab'
            || Boolean(pairs[key])
            || isClosingPair
            || isPairedBackspace
            || key === 'Enter';

        if (!isEditorKey) {
            return;
        }

        event.preventDefault();

        if (key === 'Tab') {
            const nextValue = `${value.slice(0, start)}    ${value.slice(end)}`;
            setValue(nextValue);
            requestAnimationFrame(() => {
                event.target.selectionStart = start + 4;
                event.target.selectionEnd = start + 4;
            });
            return;
        }

        if (pairs[key]) {
            const selectedText = value.slice(start, end);
            const nextValue = `${value.slice(0, start)}${key}${selectedText}${pairs[key]}${value.slice(end)}`;
            setValue(nextValue);
            requestAnimationFrame(() => {
                event.target.selectionStart = start + 1;
                event.target.selectionEnd = end + 1;
            });
            return;
        }

        if (Object.values(pairs).includes(key) && value[start] === key && start === end) {
            event.target.selectionStart = start + 1;
            event.target.selectionEnd = start + 1;
            return;
        }

        if (key === 'Backspace' && start === end && pairs[value[start - 1]] === value[start]) {
            const nextValue = `${value.slice(0, start - 1)}${value.slice(start + 1)}`;
            setValue(nextValue);
            requestAnimationFrame(() => {
                event.target.selectionStart = start - 1;
                event.target.selectionEnd = start - 1;
            });
            return;
        }

        if (key === 'Enter') {
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const currentIndent = value.slice(lineStart, start).match(/^\s*/)[0];
            const beforeCursor = value.slice(lineStart, start).trimEnd();
            const extraIndent = /[{[(]$/.test(beforeCursor) ? '    ' : '';
            const closingBracket = /^[}\])]/.test(value.slice(start));
            const nextIndent = closingBracket && extraIndent
                ? currentIndent
                : currentIndent + extraIndent;
            const nextValue = `${value.slice(0, start)}\n${nextIndent}${value.slice(end)}`;
            setValue(nextValue);
            requestAnimationFrame(() => {
                event.target.selectionStart = start + 1 + nextIndent.length;
                event.target.selectionEnd = start + 1 + nextIndent.length;
            });
        }
    }

    async function createMyPaste(){
        let content = value;
        if (pasteType === 'code') {
            content = await formatCode();
        }
        const paste = {
            title: title,
            content,
            _id: pasteId ||
                Date.now().toString(36),
            createdAt:new Date().toISOString(),
            pinned: selectedPaste?.pinned ?? false,
            type: pasteType,
            language: pasteType === 'code' ? language : null,
        }
        if(pasteId){
            dispatch(updateToPastes(paste));
        }else{
            dispatch(addToPastes(paste));
        }
        setTitle('');
        setValue('');
        setPasteType('text');
        setLanguage('javascript');
        setSearchParams({});
    }
  return (
    <div>
        <div className="flex flex-wrap flex-row gap-7 place-content-around">
      <input className="mt-2 rounded-2xl border border-gray-300 p-2" type="text" placeholder="Enter title here" value={title}  onChange={(e) => setTitle(e.target.value)}/>
      <div className="mt-2 flex rounded-2xl border border-gray-300 p-1">
        <button
          className={`rounded-xl px-3 py-2 ${pasteType === 'text' ? 'bg-blue-600 text-white' : ''}`}
          type="button"
          onClick={() => setPasteType('text')}
        >
          Text
        </button>
        <button
          className={`rounded-xl px-3 py-2 ${pasteType === 'code' ? 'bg-blue-600 text-white' : ''}`}
          type="button"
          onClick={() => setPasteType('code')}
        >
          Code
        </button>
      </div>
      {pasteType === 'code' && (
        <select
          className="mt-2 rounded-2xl border border-gray-300 p-2"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
      )}
      <button onClick={createMyPaste} className="mt-2 rounded-2xl bg-blue-600 p-2 text-white">
        {
            pasteId ? "Update Paste" : "Create My Paste"
        }
        </button>
    </div>
    <div className="mt-8">
      {pasteType === 'code' && (
        <button
          className="mb-2 rounded-xl border border-slate-500 px-3 py-2 text-sm"
          type="button"
          onClick={formatCode}
        >
          Format code
        </button>
      )}
      <textarea
          className={`mt-4 min-w-[500px] rounded-2xl border p-4 ${
            pasteType === 'code'
              ? 'border-slate-700 bg-slate-950 font-mono text-green-300'
              : 'border-gray-300'
          }`}
          value={value}
          placeholder={pasteType === 'code' ? `Write ${language} code here...` : 'Enter the content here'}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleEditorKeyDown}
          rows={20}
          spellCheck={pasteType !== 'code'}
        />
    </div>
    </div>
  );
};

export default Home;
