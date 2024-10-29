import React, { useEffect, useRef } from "react";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";
import CodeMirror from "codemirror";
import { ACTIONS } from "../Actions";

function Editor({ socketRef, roomId, onCodeChange }) {
  const editorRef = useRef(null);

  // Initialize the CodeMirror editor
  useEffect(() => {
    const initEditor = () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true }, // Syntax highlighting for JavaScript
          theme: "dracula", // Editor theme
          autoCloseTags: true, // Automatically close HTML tags
          autoCloseBrackets: true, // Automatically close brackets
          lineNumbers: true, // Show line numbers in the editor
        }
      );

      // Store the editor instance in ref
      editorRef.current = editor;

      // Set the editor height
      editor.setSize(null, "100%");
       // Handle changes in the editor
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();

        // Pass the code to the parent component
        onCodeChange(code);

        // Emit code change event only if the change didn't originate from 'setValue'
        if (origin !== "setValue" && socketRef.current) {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    initEditor();

    // Clean up on component unmount
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea(); // Destroys the editor instance
      }
    };
  }, [onCodeChange, roomId]); // Dependency array ensures this runs only when onCodeChange or roomId changes

  // Listen for code changes from the server
  useEffect(() => {
    if (socketRef.current) {
      // Log when connected to server
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
    });
  
      // Listen for code change event from server
     // Listen for code change event from server
socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
  if (editorRef.current) {
    const currentCode = editorRef.current.getValue();
    
    // Only set value if the received code is different
    if (code !== currentCode) {
      editorRef.current.setValue(code);
    }
  }
});

  
      // Clean up when the component unmounts or socket changes
      return () => {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      };
    }
  }, [socketRef.current]);
  

  return (
    <div style={{ height: "600px" }}>
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;

