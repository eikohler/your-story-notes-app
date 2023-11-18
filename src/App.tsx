import './App.scss';
import Main from './components/main/Main';
import { useEffect } from 'react';

const bodyScrollLock = require('body-scroll-lock');
const disableBodyScroll = bodyScrollLock.disableBodyScroll;

function App() {

  useEffect(() => {
    const body = document.querySelector('body');
    disableBodyScroll(body);
  }, []);

  return (    
    <Main />    
  );
}

export default App;
