import { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

type LanguageKey = 'cpp' | 'python' | 'javascript' | 'java';

const DEFAULT_CODE: Record<LanguageKey, string> = {
    cpp: '// Write your C++ code here...\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    python: '# Write your Python code here...\nprint("Hello, World!")',
    javascript: '// Write your JavaScript code here...\nconsole.log("Hello, World!")',
    java: '// The class name must be "user_code"\n// Write your Java code here...\npublic class user_code {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
};

const CodeEditor = () => {
    const [code, setCode] = useState(DEFAULT_CODE.cpp);
    const [output, setOutput] = useState('');
    const [language, setLanguage] = useState<LanguageKey>('cpp');
    const [isRunning, setIsRunning] = useState(false);
    const [inputValue, setInputValue] = useState('');
    
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
        // alert("compile");
        // setTimeout(() => {
        //     alert("We are in devloping stage so your code will take some time to execute please be patient");
        // }, 1000);
        setIsRunning(true);

        try {
            const response = await fetch(`http://localhost:8080/run/${language}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, input: inputValue }), // Include input value in the request
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

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value as LanguageKey;
        setLanguage(selectedLanguage);
        setCode(DEFAULT_CODE[selectedLanguage]);
        setInputValue('');
    };


    return (
        <div style={{ 
            height: 'calc(100vh - 60px)', 
            display: 'flex', 
            flexDirection: 'row',
            backgroundColor: '#0d1117',
            padding: '10px',
            gap: '10px'
        }}>
            {/* Editor Section */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                minWidth: 0
            }}>
                {/* Toolbar */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end',
                    marginBottom: '10px',
                    gap: '8px'
                }}>
                    <input
                        type="file"
                        id="formFile"
                        onChange={loadCode}
                        style={{ display: 'none' }}
                    />
                    {/* <label
                        htmlFor="formFile"
                        style={{
                            backgroundColor: '#21262d',
                            color: 'white',
                            padding: '8px 20px',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            border: '1px solid #30363d',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Choose File
                    </label> */}
                    <select
                        style={{ 
                            width: '150px', 
                            backgroundColor: '#21262d', 
                            color: 'white', 
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                        value={language}
                        onChange={handleLanguageChange}
                    >
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                    </select>
                    <button
                        type="button"
                        onClick={runCode}
                        style={{ 
                            backgroundColor: '#238636',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                            opacity: isRunning ? 0.6 : 1
                        }}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Run'}
                    </button>
                </div>

                {/* Monaco Editor */}
                <div style={{ 
                    flex: 1, 
                    borderRadius: '6px', 
                    overflow: 'hidden',
                    border: '1px solid #30363d'
                }}>
                    <MonacoEditor
                        height="100%"
                        width="100%"
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true
                        }}
                    />
                </div>
            </div>

            {/* Output Section */}
            <div style={{
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#161b22',
                borderRadius: '6px',
                border: '1px solid #30363d',
                overflow: 'hidden'
            }}>
                {/* Input Section */}
                <div style={{ padding: '15px', borderBottom: '1px solid #30363d' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#c9d1d9'
                    }}>
                        Input
                    </label>
                    <textarea
                        style={{
                            width: '100%',
                            minHeight: '100px',
                            backgroundColor: '#0d1117',
                            color: '#c9d1d9',
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            padding: '10px',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            resize: 'vertical'
                        }}
                        placeholder="Input for the code..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>

                {/* Output Section */}
                <div style={{ 
                    flex: 1, 
                    padding: '15px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h5 style={{ 
                        color: '#58a6ff',
                        marginBottom: '12px',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Output
                    </h5>
                    <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        wordWrap: 'break-word',
                        backgroundColor: '#0d1117',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #30363d',
                        color: '#c9d1d9',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        margin: 0,
                        flex: 1,
                        overflow: 'auto'
                    }}>
                        {output || 'No output yet'}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
