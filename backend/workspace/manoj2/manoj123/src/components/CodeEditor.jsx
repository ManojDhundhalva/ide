import { useState, useEffect, useCallback, useRef } from "react";
import Editor from '@monaco-editor/react';
import { useFileStore } from '../store/fileStore';
import debounce from "lodash.debounce";
import { detectLanguage } from "../utils/language";

export default function CodeEditorComponent() {
    const currentFilePath = useFileStore((s) => s.activeTab);
    const getFileContent = useFileStore((s) => s.getFileContent);
    const saveFileContentToDB = useFileStore((s) => s.saveFileContentToDB);
    const tabs = useFileStore((s) => s.tabs);

    const [editorValue, setEditorValue] = useState("");
    const [language, setLanguage] = useState("plaintext");

    useEffect(() => {
        if (!currentFilePath) {
            setEditorValue("");
            return;
        }

        const fetchContent = async () => {
            const content = await getFileContent(currentFilePath);
            setEditorValue(content || "");
            setLanguage(detectLanguage(currentFilePath));
        };

        fetchContent();
    }, [currentFilePath, getFileContent]);

    const saveToDB = useCallback((content) => {
        saveFileContentToDB(content).catch(console.error);
    }, [saveFileContentToDB]);

    const debouncedSave = useRef(debounce((content) => {
        saveToDB(content);
    }, 1000)).current;

    useEffect(() => {
        return () => {
            debouncedSave.cancel();
        };
    }, [debouncedSave]);

    // Handle editor changes and call debounced save
    const handleEditorChange = (value, event) => {
        setEditorValue(value);
        debouncedSave(value);
    };

    useEffect(() => {
        console.log("currentFilePath", currentFilePath);
    }, []);

    if(tabs.length === 0) return null;

    return (
        <div style={{ flex: 1, background: '#1e1e1e' }}>
            <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={editorValue}
                onChange={handleEditorChange}
                options={{
                    fontFamily: "Martian Mono",
                    minimap: { enabled: true },
                    fontSize: 12,
                    wordWrap: 'on',
                }}
            />
        </div>
    );
}
