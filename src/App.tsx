import React from 'react';
import './App.css';
import Approutes from './Routes/Main';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "418114033455-nu2odpsacsi4vb0sjrgsoebqcpfb9ai9.apps.googleusercontent.com";

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Toaster position="top-center" />
      <Approutes />
    </GoogleOAuthProvider>
  );
}

export default App;