import Editor from '@monaco-editor/react';

export default function CodeEditorComponent() {

    function handleEditorChange(value, event) {
        console.log('here is the current model value:', value, event);
    }

    return (
        <Editor
            height="50vh"
            defaultLanguage="javascript"
            defaultValue="// some comment"
            onChange={handleEditorChange}
        />
    );
}
