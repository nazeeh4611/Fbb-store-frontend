import React from "react";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Approutes from "./Routes/Main";
import { ClientId } from "./Constant/Base";

const App: React.FC = () => (
  <GoogleOAuthProvider clientId={ClientId}>
    <Toaster
      position="top-center"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: "#1c1917",
          color: "#fafaf9",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px 16px",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.35)",
        },
        success: { iconTheme: { primary: "#f59e0b", secondary: "#1c1917" } },
        error: { duration: 4500, iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
    <Approutes />
  </GoogleOAuthProvider>
);

export default App;
