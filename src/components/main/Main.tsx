import { useState, useEffect, useRef } from 'react';
import { Container, Section, Bar, Resizer } from '@column-resizer/react';
import Notepad from '../notepad/Notepad';
import Notelist from '../notelist/Notelist';
import {getNextID, getDiff} from '../../helper/helperFunctions';
import FloatingNote from '../floatingnote/FloatingNote';
import TrashCan from '../trashcan/TrashCan';
import useMousePosition from '../../hooks/UseMousePosition';
import CircleIcon from '@mui/icons-material/Circle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReorderIcon from '@mui/icons-material/Reorder';
import KeyboardIcon from '@mui/icons-material/Keyboard';

function Main() {
  const [ barActive, setBarActive ] = useState(false);
  const [ barHidden, setBarHidden ] = useState(false);  

  const [ noteList, setNoteList ] = useState(JSON.parse(localStorage.getItem("noteList")!) || []);
  const [ noteID, setNoteID ] = useState(noteList.length > 0 ? getNextID(noteList) : 0);
  const [ content, setContent ] = useState("");
  const [ noteColors, setNoteColors ] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [colWidth, setColWidth] = useState(300);
  const [showTrash, setShowTrash] = useState(false);
  const [trashCoords, setTrashCoords] = useState({x: 0, y: 0});
  const [scaleDiff, setScaleDiff] = useState(1);
  const [cpActive, setCPActive] = useState(false);
  const [slideOutActive, setSlideOutActive] = useState(false);

  const isDraggingRef = useRef<any>();
  isDraggingRef.current = isDragging;

  const mousePosition = useMousePosition();

  const innerList = useRef<any>();

  // Update state variables functions
  const updateList = (data:any) => {
    if(data !== null){
      const i = noteList.findIndex((note:any) => note.id === noteID);

      // Updates pre-existing note
      if(i > -1){
        setNoteList(noteList.map((note:any) => {
          if (note.id === noteID) {
            return { ...note, 
              title: data.title, 
              content: data.content, 
              colors: data.colors,
              text: data.text
            };
          } else {        
            return note;
          }
        }));
        // Adds new note to the note list
      }else{
        setNoteList([...noteList, data]);
      }
      // Removes the note for having no characters
    }else{
      setNoteList(noteList.filter((note:any) => note.id !== noteID));
    }
  };

  const updateNoteColors = (colors:any) =>{
    const i = noteList.findIndex((note:any) => note.id === noteID)
    if(i > -1){
      setNoteList(noteList.map((note:any) => {
        if (note.id === noteID) {
          return { ...note, colors: colors };
        } else {        
          return note;
        }
      }));
    }
  }
  const deleteNote = () => {    
    setNoteList(noteList.filter((note:any) => note.id !== noteID));
    newNote();
  }
  const loadNote = (id:any) => {
    const i = noteList.findIndex((note:any) => note.id === id);
    setContent(noteList[i].content);
    setNoteColors(noteList[i].colors);
    setNoteID(id);
  };
  const newNote = () =>{
    const id = noteList.length > 0 ? getNextID(noteList) : 0;    
    setNoteID(id);
    setContent("");
    setNoteColors({});
  };

  const newOrderList = (data:any) =>{
    setNoteList([...data]);
  }

  const updateDragState = (data:any) => setIsDragging(data);

  const updateTrashCoords = (data:any) => setTrashCoords({...data});
  
  const collapseCol = (resizer: Resizer) : void => {
    setColWidth(resizer.getSectionSize(0) >= 200 ? resizer.getSectionSize(0) : 200);
    if (resizer.getSectionSize(0) < 100) {
      resizer.resizeSection(0, { toSize: 0 });
      setBarHidden(true);
    } else if (resizer.getSectionSize(0) < 200) {
      resizer.resizeSection(0, { toSize: 200 });
      setBarHidden(false);
    }
  }  

  useEffect(() => {
    const updateScroll = (e:any) => {
      if(isDraggingRef.current) e.preventDefault();      
    }
    innerList.current.addEventListener("touchmove", updateScroll, false);
    return () => {
      innerList.current.removeEventListener("touchmove", updateScroll, false);
    };
  }, []);  

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    // Save note list to local storage
    const exportList = JSON.stringify(noteList);
    localStorage.setItem("noteList", exportList);
  }, [noteList]);  
  

  useEffect(() => {
    if((mousePosition.x > colWidth || window.innerWidth <= 767) && isDragging){
      setShowTrash(true);
      const diff = window.innerWidth <= 767 ? getDiff(mousePosition.y, trashCoords.y)/100
      : (((getDiff(mousePosition.x, trashCoords.x) + getDiff(mousePosition.y, trashCoords.y))/2)/100)*1.8;
      setScaleDiff(diff);
    }else{
      setShowTrash(false);
      setScaleDiff(1);
    }

    const time = 100;
    const modifier = 100;
    const adjustScroll = setInterval(()=>{
      if(isDragging){
        let newTop = innerList.current.scrollTop;
        if(mousePosition.y >= innerList.current.clientHeight-100){
          newTop = newTop + modifier;
        }else if(mousePosition.y <= 100){
          newTop = newTop - modifier;
        }
        innerList.current.scrollTo({
          top: newTop,
          behavior: 'smooth',
        });
      }
    }, time);

    return () => clearInterval(adjustScroll);

  }, [mousePosition, isDragging]);

  return (
    <main className={`${isDragging ? "drag" : ""}`}>
      <FloatingNote
        note={noteList[noteList.findIndex((note:any) => note.id === noteID)]}
        isDragging={isDragging}
        mousePosition={mousePosition}
        scaleDiff={scaleDiff}
        width={colWidth}
      />       
      <Container 
        className={`columns-container ${barActive ? "active" : ""}`}
        beforeApplyResizer={collapseCol}
        onActivate={() : void => setBarActive(true)}
        afterResizing={() : void => setBarActive(false)}
      >
        <Section id="noteList" className={`column ${slideOutActive ? "slide-active" : ''}`} 
        defaultSize={300}>
          <div className={`inner`} ref={innerList}>
            <Notelist 
              noteID={noteID}
              noteList={noteList} 
              loadNote={loadNote}
              newOrderList={newOrderList}
              updateDragState={updateDragState}
              mousePosition={mousePosition}
            />          
          </div>
        </Section>
          <Bar 
            id="resizeBar"
            size={5} 
            className={`resize-bar ${barHidden && !barActive ? "hidden" : ""}`}
            expandInteractiveArea={{right: 5, left: 5}} 
          />
        <Section id="notePad" className="column" minSize={400}>
          <div className="inner">
            <Notepad 
              noteID={noteID}
              content={content}
              noteColors={noteColors}
              isDragging={isDragging}
              updateList={updateList}
              updateNoteColors={updateNoteColors}
              newNote={newNote}
              cpActive={cpActive}
            />
            <TrashCan 
              showTrash={showTrash}
              scaleDiff={scaleDiff}
              updateTrashCoords={updateTrashCoords} 
              deleteNote={deleteNote}
              mousePosition={mousePosition}
            />
            <div id="mobile-list-toggle" className={`${cpActive ? "hide" : ''} 
            ${slideOutActive ? "active" : ''}`}
            onClick={()=>setSlideOutActive(!slideOutActive)}>
              <ReorderIcon />
              <KeyboardIcon />
            </div>
            <div id="mobile-cp-toggle" className={`${cpActive ? "active" : ''}`} 
            onClick={()=>setCPActive(!cpActive)}>
              <CircleIcon />
              <CancelIcon />
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}

export default Main;