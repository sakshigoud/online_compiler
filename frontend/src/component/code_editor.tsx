import { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import type { IconType } from 'react-icons';
import { FaJava } from 'react-icons/fa6';
import { SiC, SiCplusplus, SiJavascript, SiPython, SiSharp, SiTypescript } from 'react-icons/si';
import '../App.css';

type LanguageKey = 'c' | 'cpp' | 'python' | 'javascript' | 'java' | 'csharp' | 'typescript';

type LanguageCard = {
    key: LanguageKey;
    label: string;
    languageName: string;
    icon: IconType;
    accent: string;
    thumbnail: string;
    description: string;
};

const LANGUAGE_CARDS: LanguageCard[] = [
    {
        key: 'cpp',
        label: 'C++',
        languageName: 'systems',
        icon: SiCplusplus,
        accent: '#7dd3fc',
        thumbnail: 'linear-gradient(135deg, #0ea5e9 0%, #1d4ed8 100%)',
        description: 'Fast, compiled, and close to the metal.',
    },
    {
        key: 'python',
        label: 'Python',
        languageName: 'scripting',
        icon: SiPython,
        accent: '#fbbf24',
        thumbnail: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        description: 'Clean syntax for quick experiments.',
    },
    {
        key: 'javascript',
        label: 'JavaScript',
        languageName: 'web runtime',
        icon: SiJavascript,
        accent: '#fde68a',
        thumbnail: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
        description: 'Run browser-style code on Node.',
    },
    {
        key: 'java',
        label: 'Java',
        languageName: 'oop',
        icon: FaJava,
        accent: '#fca5a5',
        thumbnail: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        description: 'Structured classes with a classic JVM flow.',
    },
    {
        key: 'c',
        label: 'C',
        languageName: 'native',
        icon: SiC,
        accent: '#86efac',
        thumbnail: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
        description: 'Minimal runtime for low-level programs.',
    },
    {
        key: 'csharp',
        label: 'C#',
        languageName: 'dotnet',
        icon: SiSharp,
        accent: '#c4b5fd',
        thumbnail: 'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)',
        description: 'Modern app code for the .NET stack.',
    },
    {
        key: 'typescript',
        label: 'TypeScript',
        languageName: 'typed js',
        icon: SiTypescript,
        accent: '#93c5fd',
        thumbnail: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
        description: 'Safer JavaScript with static types.',
    },
];

const DEFAULT_CODE: Record<LanguageKey, string> = {
    c: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
    cpp: '// Write your C++ code here...\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    python: '# Write your Python code here...\nprint("Hello, World!")',
    javascript: '// Write your JavaScript code here...\nconsole.log("Hello, World!")',
    java: '// The class name must be "user_code"\n// Write your Java code here...\npublic class user_code {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    csharp: 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    typescript: '// Write your TypeScript code here...\nconsole.log("Hello, World!")',
};

const CodeEditor = () => {
    const [code, setCode] = useState(DEFAULT_CODE.cpp);
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState<LanguageKey>('cpp');
    const [isRunning, setIsRunning] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const activeCard = LANGUAGE_CARDS.find((card) => card.key === language) ?? LANGUAGE_CARDS[0];

    const handleEditorChange = (value: string | undefined) => {
        setCode(value || '');
    };

    const loadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setCode(result);
                }
            };
            reader.readAsText(file);
        }
    };

    const runCode = async () => {
        setIsRunning(true);

        try {
            const response = await fetch(`http://localhost:8080/run/${language}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, input: inputValue }),
            });

            if (response.status === 200) {
                const result = await response.json();
                setOutput(result.output);
            } else if (response.status === 400) {
                const result = await response.json();
                setOutput(result.error);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleLanguageSelect = (selectedLanguage: LanguageKey) => {
        setLanguage(selectedLanguage);
        setCode(DEFAULT_CODE[selectedLanguage]);
        setInputValue('');
        setOutput('');
    };

    return (
        <div className="compiler-shell">
            <aside className="panel language-rail">
                <div className="panel-header">
                    <p className="eyebrow">Languages</p>
                    <h2>Pick a runtime</h2>
                    <p className="panel-copy">Tap a card to switch the editor, template, and execution backend.</p>
                </div>

                <div className="language-grid">
                    {LANGUAGE_CARDS.map((card) => {
                        const isActive = card.key === language;
                        const CardIcon = card.icon;

                        return (
                            <button
                                key={card.key}
                                type="button"
                                className={`language-card ${isActive ? 'active' : ''}`}
                                onClick={() => handleLanguageSelect(card.key)}
                            >
                                <div className="language-thumb" style={{ background: card.thumbnail }}>
                                    <CardIcon size={28} />
                                </div>
                                <div className="language-card-body">
                                    <div className="language-card-topline">
                                        <strong>{card.label}</strong>
                                        <span style={{ color: card.accent }}>{card.languageName}</span>
                                    </div>
                                    <p>{card.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <main className="panel editor-panel">
                <div className="editor-topbar">
                    <div>
                        <p className="eyebrow">Editor</p>
                        <h1>{activeCard.label}</h1>
                        <p className="panel-copy">Current runtime: {activeCard.languageName}</p>
                    </div>

                    <div className="editor-actions">
                        <input
                            type="file"
                            id="formFile"
                            onChange={loadCode}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="formFile" className="action-button secondary-button">
                            Upload file
                        </label>
                        <button type="button" onClick={runCode} className="action-button primary-button" disabled={isRunning}>
                            {isRunning ? 'Running...' : 'Run code'}
                        </button>
                    </div>
                </div>

                <div className="editor-surface">
                    <MonacoEditor
                        height="100%"
                        width="100%"
                        language={language === 'csharp' ? 'csharp' : language}
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16, bottom: 16 },
                            fontLigatures: true,
                        }}
                    />
                </div>
            </main>

            <section className="panel output-panel">
                <div className="panel-header compact">
                    <div>
                        <p className="eyebrow">Input</p>
                        <h2>Run with data</h2>
                    </div>
                </div>

                <textarea
                    className="input-field"
                    placeholder="Type input here for stdin-driven programs..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />

                <div className="output-section">
                    <div className="panel-header compact output-heading">
                        <div>
                            <p className="eyebrow">Output</p>
                            <h2>Console</h2>
                        </div>
                    </div>
                    <pre className="output-field">{output || 'No output yet'}</pre>
                </div>
            </section>
        </div>
    );
};

export default CodeEditor;
