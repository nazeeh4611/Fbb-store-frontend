import React from 'react'; // Add this import
import './App.css';
import Approutes from './Routes/Main';
import { Toaster } from 'react-hot-toast';



const App:React.FC = () =>{
  return (
    <>
 <Toaster position="top-center" />
    <Approutes/>
    </>
  );
}

export default App;
