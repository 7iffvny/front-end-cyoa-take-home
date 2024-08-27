import React from "react";
import NavBar from "./components/Navbar";
import CommentList from "./components/CommentList";
import "./styling/App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <NavBar />
      <div className="content">
        <header className="header">
          <h1>Tell Us How We're Doing!</h1>
        </header>
        <CommentList />
      </div>
    </div>
  );
};

export default App;
