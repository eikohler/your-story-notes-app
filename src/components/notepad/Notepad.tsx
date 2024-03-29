import { useCallback, useEffect, useState } from 'react';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.bubble.css';
import toolBarOptions from "./toolBarOptions";
import TypeText from '../typetext/TypeText';
import ColorPicker from '../colorpicker/ColorPicker';
import AddIcon from '@mui/icons-material/Add';
import {getHTMLTextStr} from '../../helper/helperFunctions';


const Notepad = (props:any) => {    
    
    const {noteID, content, noteColors, isDragging, 
        updateList, updateNoteColors, newNote, cpActive} = props;

    const [value, setValue] = useState(content);
    const [phActive, setphActive] = useState(true);   
    const [colors, setColors] = useState({});
    const [boundary, setBoundary] = useState<any>();
    
    useEffect(() => {
        setValue(content);
    }, [noteID]);
    
    useEffect(() => {
        updateNoteColors(colors);
    }, [colors]);

    useEffect(() => {
        const bounds = document.querySelector("#notePad .inner");
        setBoundary(bounds);

        const deviceWidth = window.matchMedia("(max-width: 767px)");
        if (deviceWidth.matches) {
            window.addEventListener("resize", setHeight);
            setHeight();
        }
    }, []);

    const setHeight = () => {
        document.getElementById("notePad")!.style.height = window.innerHeight + "px";
    };

    const setNoteColors = (data:any) => setColors(data);
    
    const onChange = (newContent: any, delta: any, source: any, editor: any) => {
        setValue(newContent);
        
        if(editor.getLength() > 1){
            const header = editor.getContents().ops[0];
            const title = header.insert.replace(/\s/g, '').length ? header.insert : "New Note";
            const textStr = getHTMLTextStr(newContent);
            
            const data = {
                title : title,
                text: textStr,
                content : newContent,
                id : noteID,
                colors: colors
            }        
            updateList(data);
        }else{
            updateList(null);        
        }
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
            <div id="create-note-btn" className={`${cpActive ? 'hide' : ''}`} 
            onClick={()=>newNote()}>
                <AddIcon />
            </div>   
            {phActive && (<TypeText />)}
            {boundary !== undefined && (
                <ReactQuill
                    ref={quill}
                    theme="bubble"
                    value={value}
                    onChange={onChange}
                    modules={{ toolbar: toolBarOptions }}
                    readOnly={isDragging}
                    bounds={boundary}
                />
            )}
            <ColorPicker 
                setNoteColors={setNoteColors}
                noteID={noteID}
                noteColors={noteColors}
                cpActive={cpActive}
            />
        </>
    );
}

export default Notepad;