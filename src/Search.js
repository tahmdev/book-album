import './style.css';
import React from "react";
import 'font-awesome/css/font-awesome.min.css';
import {resolvePath, useParams} from "react-router-dom";


function Searchpage(props){
    let { searchString } = useParams();
    return(
            <Main searchString={searchString} loggedUser={props.userProp}/>
    )
  }

class Main extends React.Component{
  constructor(props){
    super(props);
    this.state={
      startIndex : 0,
      searchResults: [1, 2],
      isLoaded: false,
    }
    this.checkDB = this.checkDB.bind(this)
    this.updateResults = this.updateResults.bind(this)
    this.handleNext = this.handleNext.bind(this)
    this.handlePrev = this.handlePrev.bind(this)
  }
  componentDidMount(){
    this.updateResults()
  }
  updateResults(){
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${this.props.searchString}&startIndex=${this.state.startIndex}&maxResults=20`)
    .then(res => res.json())
    .then(json => this.setState({
        searchResults: json.items,
        isLoaded: true,
    }))
  }
  handleNext(){
    let newStartIndex = this.state.startIndex + 20
    this.setState({
      startIndex: newStartIndex,
    }, () => {
      document.getElementById("search-page-result-wrapper").scrollTo(0,0)
      this.updateResults()})
  }
  handlePrev(){
    let newStartIndex = this.state.startIndex - 20
    this.setState({
      startIndex: newStartIndex,
    }, () => {
      document.getElementById("search-page-result-wrapper").scrollTo(0,0)
      this.updateResults()})
  }
  checkDB(isbn, title, author, pageCount, cover, publishedDate, summary){
    fetch(`https://book-album.herokuapp.com/API/bookPost/${isbn}/${title}/${author}/${pageCount}/${cover}/${publishedDate}/${summary}`, {method: "POST"})
    console.log(`https://book-album.herokuapp.com/API/book/${isbn}/${title}/${author}/${pageCount}/${cover}/${publishedDate}/${summary}`)
  } 

  render(){
    return(
      <div id="search-page"> 
        {this.state.isLoaded && <div id="search-page-result-wrapper"> 
          {this.state.searchResults.map((item, idx) => {
            return (
              <SearchResultTemplate 
              key={idx}
              title={item.volumeInfo.title}
              image={!item.volumeInfo.imageLinks ? "https://i.imgur.com/PaBAbe9.png" : item.volumeInfo.imageLinks.thumbnail}
              authors={!item.volumeInfo.authors ? undefined : item.volumeInfo.authors.length >= 2 ? item.volumeInfo.authors.join(", ") : item.volumeInfo.authors}
              summary={item.volumeInfo.description ? item.volumeInfo.description : "No summary found :("}
              language={item.volumeInfo.language}
              pageCount={item.volumeInfo.pageCount}
              publishedDate={item.volumeInfo.publishedDate}
              id={item.id}
              checkDB= {this.checkDB}
              />
            )
          })}
          <div id="search-button-container">
          {this.state.startIndex > 0 && <button onClick={this.handlePrev} className="page-btn">Prev page</button>}

            <button onClick={this.handleNext} className="page-btn">Next page</button>
          </div>
        </div>}
      </div>
    )
  }
}

const SearchResultTemplate = (props) => {
  return(
    <div id="search-result-wrapper-sp">
    <a id="search-link" href={`http://localhost:3000/book/${props.id}`}  onMouseDown={() => props.checkDB(props.id, props.title, props.authors, props.pageCount, "undefined", props.publishedDate, props.summary)}>
    <div id="search-result">
      <img id="sp-img" src={props.image} />
      <div id="volume-info-wrapper-sp">
        <p id="titleSearch">{props.title}</p>
        <p id="authorSearch-sp">{props.authors}</p>
        <p id="summarySearch-sp">{props.summary}</p>
        <p id="pageCountSearch">{props.pageCount} Pages</p>
        <p id="languageSearch">Language: {props.language}</p>
        <p id="publishedDateSearch">Published: {props.publishedDate}</p>
      </div>
    </div>
    </a>
    </div>

  )
}
export default Searchpage;
