import './style.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom" 
import Navbar2 from "./Navbar.js"
import Home from "./Home.js"
import Userpage from "./User.js"
import Bookpage from "./Book.js"
import Searchpage from './Search.js';
import { Auth0Provider } from "@auth0/auth0-react";
import { useAuth0, User } from "@auth0/auth0-react";


function App() {  

  return (
    <Auth0Provider
      domain="dev-81hux8g1.us.auth0.com"
      clientId="g4GjOli6xfVHKUxbyANlt2GuuJyOSKFh"
      redirectUri={window.location.origin}
      >
    <Router>
      <div className="App">
        <AuthWrapper />
        
      </div>
    </Router>
    </Auth0Provider>
  );
}
const AuthWrapper = () => {
  const [state, setState] = useState(null);
  const { user, isAuthenticated, isLoading} = useAuth0();
  const placeholderUser = {
    aboutMe: "Loading...",
    name: "loading...",
    id: 0,
  }
  if(isLoading || !isAuthenticated){
    return(
      <div>
        <Navbar2 />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/:userID" element={<Userpage id="userpage"/>} />
          <Route path="/book/:isbn" element={<Bookpage userProp={placeholderUser}/>} />
          <Route path="/search/:searchString" element={<Searchpage userProp={placeholderUser}/>} />
        </Routes>
    </div>
    )
  }
  function lookForUser(){
    if(isAuthenticated){
      fetch(`https://book-album.herokuapp.com/API/userSub/${user.sub}/${user.nickname}`, {method: "POST"}) 
    }
  }
  lookForUser()

  if (!state && isAuthenticated){
  fetch(`https://book-album.herokuapp.com/API/userSubGet/${user.sub}`)
  .then(res => res.json())
  .then(json => { setState(json[0])})
  }
  
  
  return(
    <div>
    <Navbar2 />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/:userID" element={<Userpage id="userpage" userProp={state}/>}  />
          <Route path="/book/:isbn" element={<Bookpage userProp={state}/>} />
          <Route path="/search/:searchString" element={<Searchpage userProp={state}/>} />
        </Routes>
    </div>
  )
}

export default App;
