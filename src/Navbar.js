import './style.css';
import React from "react";
import { useAuth0, User } from "@auth0/auth0-react";
import 'font-awesome/css/font-awesome.min.css';

function Navbar2(){
  const { user, isAuthenticated, isLoading} = useAuth0();
  if (isLoading){
    return <div id="navbar"/>
  }
  else if(isAuthenticated){return(
          <Navbar userProp={user} loggedInProp={true}/>
  )}
  else{
    return (<Navbar />)
  }
}

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={() => loginWithRedirect()}>Log In</button>;
};
const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    <button onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </button>
  );
};

class Navbar extends React.Component{
  constructor(props){
    super(props);
    this.state={
      loggedIn : false,
      loggedInUser: 1,
      loggedInUserData: "",
      curretnSearchInput: "",
      searchResult: null,
    }
    this.wrapperRef = React.createRef();
    this.timer = null;
    this.getLoggedInUserData = this.getLoggedInUserData.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.checkDB = this.checkDB.bind(this)
    this.hideSearchResults = this.hideSearchResults.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
  }
  getLoggedInUserData(){
    fetch(`https://book-album.herokuapp.com/API/user/${this.state.loggedInUser}`)
    .then(res => res.json())
    .then(json => {
      this.setState({
        loggedInUserData: json
      })
    })
  }
  componentDidMount(){
    if(this.props.loggedInProp){
      fetch(`https://book-album.herokuapp.com/API/userSubGet/${this.props.userProp.sub}`)
        .then(res => res.json())
        .then(json => {
          this.setState({
            loggedIn: true,
            loggedInUser: json[0].id,
          }, () => this.getLoggedInUserData())
        })
    }
  }

  componentDidUpdate(prevProps, prevState){
    if (this.state.curretnSearchInput !== prevState.curretnSearchInput){
      if(!this.state.curretnSearchInput){
        this.setState({
          searchResult: "",
        })
        document.removeEventListener("mousedown", this.hideSearchResults)
      }
    }
  }
  hideSearchResults(e){
    if (this.wrapperRef && !this.wrapperRef.current.contains(e.target)){
      this.setState({
        searchResult: "",
      })
      document.removeEventListener("mousedown", this.hideSearchResults)
    }
  }
  handleChange(e){
    document.removeEventListener("mousedown", this.hideSearchResults)
    document.addEventListener("mousedown", this.hideSearchResults)  
    this.setState({
      curretnSearchInput : e.target.value 
    }, () => {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.handleSearch()
      }, 500);
    })
  }
  handleSearch(){
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${this.state.curretnSearchInput}`)
    .then(res => res.json())
    .then(json => this.setState({
      searchResult: json.items
    }))
  }
  checkDB(isbn, title, author, pageCount, cover, publishedDate, summary){
    fetch(`https://book-album.herokuapp.com/API/bookPost/${isbn}/${title}/${author}/${pageCount}/${cover}/${publishedDate}/${summary}`, {method: "POST"})
    console.log(`https://book-album.herokuapp.com/API/book/${isbn}/${title}/${author}/${pageCount}/${cover}/${publishedDate}/${summary}`)
  } 
  handleEnter(e){
    if(e.key === "Enter"){
      document.getElementById("search-link").click();
    }
  }

  render(){
    return(
      <div>
          <nav id="navbar">
            {this.state.loggedInUserData && <a href={`http://localhost:3000/user/${this.state.loggedInUser}`}>{this.state.loggedInUserData[0].name}</a>}
            {!this.state.loggedInUserData && <p></p>}
            <div id="search-wrapper">
              <input type="text" id="search-bar" autoComplete="off" placeholder='Search...' onChange={this.handleChange} onKeyDown={this.handleEnter}/>
              <a id="search-link" href={"http://localhost:3000/search/"+ this.state.curretnSearchInput}>
                <button id="search-btn" >
                   <i className="fa fa-search" /> 
                </button>
              </a>
              {this.state.searchResult && <div id="search-result-container" ref={this.wrapperRef}>
                {this.state.searchResult.map((item, idx) => {
                return(
                  <SearchResultTemplate 
                  key={idx}
                  title={item.volumeInfo.title}
                  image={!item.volumeInfo.imageLinks ? "https://i.imgur.com/PaBAbe9.png" : item.volumeInfo.imageLinks.thumbnail}
                  authors={!item.volumeInfo.authors ? undefined : item.volumeInfo.authors.length >= 2 ? item.volumeInfo.authors.join(", ") : item.volumeInfo.authors}
                  summary={item.volumeInfo.description}
                  language={item.volumeInfo.language}
                  pageCount={item.volumeInfo.pageCount}
                  publishedDate={item.volumeInfo.publishedDate}
                  id={item.id}
                  checkDB= {this.checkDB}
                  />
                )
              })
              
              }
              
              </div>}
              
            </div>            

            {!this.state.loggedIn && <LoginButton />}
            {this.state.loggedIn && <LogoutButton />}



          </nav>
      </div>
    )
  }
}

const SearchResultTemplate = (props) => {
  return(
    <div id="search-result-wrapper">
    <a id="search-link" href={`http://localhost:3000/book/${props.id}`}  onMouseDown={() => props.checkDB(props.id, props.title, props.authors, props.pageCount, "undefined", props.publishedDate, props.summary)}>
    <div id="search-result">
      <img src={props.image} />
      <div id="volume-info-wrapper">
        <p id="titleSearch">{props.title}</p>
        <p id="authorSearch">{props.authors}</p>
        <p id="pageCountSearch">{props.pageCount} Pages</p>
        <p id="languageSearch">Language: {props.language}</p>
        <p id="publishedDateSearch">Published: {props.publishedDate}</p>
      </div>
    </div>
    </a>
    </div>

  )
}
export default Navbar2;
