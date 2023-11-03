import { useCallback, useEffect, useState } from 'react';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.bubble.css';
import toolBarOptions from "./toolBarOptions";
import TypeText from '../typetext/TypeText';
import ColorPicker from '../colorpicker/ColorPicker';
import AddIcon from '@mui/icons-material/Add';
import {getHTMLTextStr} from '../../helper/helperFunctions';


const Notepad = (props:any) => {    
    
    const {noteID, content, noteColors, updateList, updateNoteColors, newNote} = props;

    const [value, setValue] = useState(content);
    const [phActive, setphActive] = useState(true);   
    const [colors, setColors] = useState({});

    useEffect(() => {
        setValue(content);
    }, [noteID]);
    
    useEffect(() => {
        updateNoteColors(colors);
    }, [colors]);

    const setNoteColors = (data:any) => setColors(data);
    
    const onChange = (newContent: any, delta: any, source: any, editor: any) => {
        setValue(newContent);        
        
        const header = editor.getContents().ops[0];
        const title = header.insert.replace(/\s/g, '').length ? header.insert : "Untitled";
        const textStr = getHTMLTextStr(newContent);
        
        const data = {
            title : title,
            text: textStr,
            content : newContent,
            id : noteID,
            colors: colors
        }        
        updateList(editor.getLength() > 1 ? data : null);        
    };

    const quill = useCallback((quill:any) => {
        if(quill){
            quill = quill.getEditor();
            quill.focus();
            quill.formatLine(0, 0, 'header', 1);
            
            quill.on('editor-change', function() {
                quill.formatLine(0, 0, 'header', 1);
                setphActive(quill.getLength() === 1);
            });                                               
        }
    }, []);

    return (
        <>   
            <div id="create-note-btn" onClick={()=>newNote()}>
                <AddIcon />
            </div>         
            <TypeText phActive={phActive} />            
            <ReactQuill
                ref={quill}
                theme="bubble"
                value={value}
                onChange={onChange}
                modules={{ toolbar: toolBarOptions }}
            />
            <ColorPicker 
                setNoteColors={setNoteColors}
                noteID={noteID}
                noteColors={noteColors}
            />
        </>
    );
}

export default Notepad;