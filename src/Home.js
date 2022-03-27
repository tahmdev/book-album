import React from "react";
import './style.css';

class Home extends React.Component{
    constructor(props){
      super(props);
      this.state={
        name:"",
      }
    }

    render(){
      return(
        <div>
            <h1> THIS IS THE HOMEPAGE</h1>
            <p>{this.state.name}</p>
        </div>
        
      )
    }
  }
  
  export default Home;