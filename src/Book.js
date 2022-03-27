import React, { useState } from "react";
import './style.css';
import {useParams} from "react-router-dom";
import 'font-awesome/css/font-awesome.min.css';

function Bookpage(props){
  let { isbn } = useParams();
  return(
          <Main isbn={isbn} loggedUser={props.userProp}/>
  )
}

class Main extends React.Component{
    constructor(props){
      super(props);
      this.state={
        user: 0,
        isAdded: false,
        showEditEntry: null,
        userLikes: [],
        bookData:[],
        noteData: [],
        currentRating: 0,
        currentStatus: "finished",
        showAddNote: false
      }
      this.hideAddNote = this.hideAddNote.bind(this)
      this.showAddNote = this.showAddNote.bind(this)
      this.wrapperRef = React.createRef();
      this.handleLike = this.handleLike.bind(this)
      this.getUserLikes = this.getUserLikes.bind(this)
      this.deleteApi = this.deleteApi.bind(this)
      this.postApi = this.postApi.bind(this)
      this.editApi = this.editApi.bind(this)
      this.handleShowEdit = this.handleShowEdit.bind(this)
      this.removePopup = this.removePopup.bind(this)
      this.handleRemove = this.handleRemove.bind(this)
      this.handleEdit = this.handleEdit.bind(this)
      this.handleAdd = this.handleAdd.bind(this)
      this.removeRating = this.removeRating.bind(this)
      this.handleStatusChange = this.handleStatusChange.bind(this)
      this.updateNotes = this.updateNotes.bind(this)
    }
    componentDidUpdate(prevProps){
      if (this.props.loggedUser !== prevProps.loggedUser && this.props.loggedUser){
        this.getAPI(`https://book-album.herokuapp.com/API/userBook/${this.props.loggedUser.id}`, (res => {
        res.map(book => {
          if (book.isbn == this.props.isbn){
            this.setState({
              isAdded: true,
              currentRating: book.score,
              currentStatus: book.status,
            }, () => console.log(this.state.isAdded))
          }
        })
      }))
      this.getUserLikes();
      }
    }
    componentDidMount(){ 
      this.getAPI(`https://book-album.herokuapp.com/API/userBook/${this.props.loggedUser.id}`, (res => {
        res.map(book => {
          if (book.isbn == this.props.isbn){
            this.setState({
              isAdded: true,
              currentRating: book.score,
              currentStatus: book.status,
            }, () => console.log(this.state.isAdded))
          }
        })
      }))
      this.getAPI(`https://book-album.herokuapp.com/API/book/${this.props.isbn}`, (res) => {
      this.setState({
          bookData: res[0]
        })
      })
      this.updateNotes()
    }
    updateNotes(){
      this.setState({
        noteData: [],
      }, () => {
        this.getAPI(`https://book-album.herokuapp.com/API/note/${this.props.isbn}`, (res) => {
        res.map(item => {
          this.getAPI(`https://book-album.herokuapp.com/API/like/${item.id}`, (res) => {
              this.getAPI(`https://book-album.herokuapp.com/API/user/${item.userID}`, (userData) => {
              this.setState({
                noteData: [
                  [
                    {
                      id: item.id,
                      author: item.userID,
                      type: item.type,
                      title: item.title,
                      text: item.text,
                      page: item.page,
                      score: item.score,
                      date: item.date,
                    }, userData[0], res
                ]
                ,...this.state.noteData]
              }, () => {
  
                this.getUserLikes()})
          })
          })
        })
        })
      })
      
    }
    getAPI(url, callback){
      fetch(url)
      .then(res => res.json())
      .then(json => callback(json))
    }
    getUserLikes(){
      let likedArr = []
      this.state.noteData.map(item => {
        likedArr = [...item[2].filter(likes => likes.userID == this.props.loggedUser.id), ...likedArr]
      })
      likedArr = likedArr.map(item => item.noteID)
      this.setState({
        userLikes: likedArr,
      })
    }
    handleLike(e){
      if (this.props.loggedUser.id !== 0){
        let id = parseInt(e.target.id, 10);
        let newLikes = [...this.state.userLikes]
        let likeCount = e.target.parentNode.firstChild;
        if(newLikes.includes(id)){
          let idxToRemove = newLikes.indexOf(id)
          newLikes.splice(idxToRemove, 1)
          this.setState({
            userLikes: newLikes,
          })
          likeCount.textContent = parseInt(likeCount.textContent, 10) - 1;
          this.deleteApi(`https://book-album.herokuapp.com/API/like/delete/${id}/${this.props.loggedUser.id}`)
        }else{
          newLikes = [...this.state.userLikes, id]
          this.setState({
            userLikes: newLikes
          })
          likeCount.textContent = parseInt(likeCount.textContent, 10) + 1;
          this.postApi(`https://book-album.herokuapp.com/API/like/post/${id}/${this.props.loggedUser.id}`)
        }
      }
    }
    handleShowEdit(e){
      if(this.props.loggedUser.id !== 0){
        document.addEventListener("mousedown", this.removePopup);
        this.setState({
          showEditEntry: e.target.id
        }, () => {
          if (e.target.id === "edit-entry"){
            if (this.state.currentRating > 0){
              document.getElementById(this.state.currentRating +"star").checked = true;
            }
          }
        })
      }
    }
    removePopup(event){
      if(this.wrapperRef && !this.wrapperRef.current.contains(event.target)){
        this.setState({
          showEditEntry: null,
        })
        document.removeEventListener("mousedown", this.removePopup);
      }
    }
    handleRemove(){
      this.deleteApi(`https://book-album.herokuapp.com/API/userBooks/delete/${this.props.isbn}/${this.props.loggedUser.id}`)
      this.setState({
        isAdded: false,
        showEditEntry: false,
      })
      document.removeEventListener("mousedown", this.removePopup);
    }
    handleEdit(e){
      e.preventDefault();
      this.editApi(`https://book-album.herokuapp.com/API/userbooks/put/${this.props.isbn}/${this.props.loggedUser.id}/${this.state.currentStatus}/${this.state.currentRating}`)
      this.setState({
        showEditEntry: false,
      })
      document.removeEventListener("mousedown", this.removePopup);
    }
    handleAdd(e){
      e.preventDefault();
      this.postApi(`https://book-album.herokuapp.com/API/userbooks/post/${this.props.isbn}/${this.props.loggedUser.id}/${this.state.currentStatus}/${this.state.currentRating}`)
      this.setState({
        isAdded: true,
        showEditEntry: false,
      })
      document.removeEventListener("mousedown", this.removePopup);

    }
    handleStatusChange(e){
      this.setState({
        currentStatus: e.target.value
      })
    }
    removeRating(e){
      if (this.state.currentRating === e.target.value){
        this.setState({
          currentRating: 0,
        })
        e.target.checked = false;
      }else{
        this.setState({
          currentRating: e.target.value,
        })
      }
    }
    deleteApi(url){
      fetch(url, {method: "DELETE"})
    }
    postApi(url){
      fetch(url, {method: "POST"})
    }
    editApi(url){
      fetch(url, {method: "PUT"})
    }
    showAddNote(){
      this.setState({
        showAddNote: true,
      })
    }
    hideAddNote(){
      this.setState({
        showAddNote: false,
      }, () => {
        this.updateNotes()
      })
      
    }
    render(){
      let notLoggedInStyle = {
        pointerEvents: "none"
      }
      if (this.state.bookData === undefined){
        return(
          <div id="noUser">This book does not exist</div>
        )}
      else{
      return(
        <div id="book-page-wrapper">
          <div id="book-info-wrapper-fix">
          <div id="book-info-wrapper">
            <h1 id="title" className="title">{this.state.bookData.title}</h1>
            <span id="author">{this.state.bookData.author}</span>
            <img id="cover" src={`http://books.google.com/books/content?id=${this.state.bookData.isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`}></img>
            {this.state.isAdded 
            ? <div id="remove-edit-wrapper">
                <button id="edit-entry" onClick={this.handleShowEdit}>Edit</button>
                <button id="remove-entry" onClick={this.handleShowEdit}>Remove</button>
              </div>
            : <button id="add-entry" onClick={this.handleShowEdit}>Add</button>
            }
            <button id="add-note" onClick={this.showAddNote}>Add note</button>
            {
              this.state.showEditEntry == "remove-entry"
              ? <div id="popup-wrapper">
                  <div id="remove-form" className="popup-form" ref={this.wrapperRef}>
                    <span>Are you sure you want to delete this entry?</span>
                    <button onClick={this.handleRemove}>Delete</button>
                  </div>
                </div>
              : this.state.showEditEntry == "edit-entry"
              ? <div id="popup-wrapper" >
                <form id="add-form" className="popup-form" onSubmit={this.handleEdit} ref={this.wrapperRef}>
                  <select id="status-select" value={this.state.currentStatus} onChange={this.handleStatusChange}>
                    <option name="status" value="finished">Finished Reading</option>
                    <option name="status" value="current">Currently Reading</option>
                    <option name="status" value="dropped">Dropped</option>
                    <option name="status" value="plan">Plan to Read</option>
                  </select>
                  <div id="rating">
                    <input type="radio" name="score" value="5" id="5star" onClick={this.removeRating}/>
                    <label className="fa fa-star" htmlFor="5star"/>
                    <input type="radio" name="score" value="4" id="4star" onClick={this.removeRating}/>
                    <label className="fa fa-star" htmlFor="4star"/>
                    <input type="radio" name="score" value="3" id="3star" onClick={this.removeRating}/>
                    <label className="fa fa-star" htmlFor="3star"/>
                    <input type="radio" name="score" value="2" id="2star" onClick={this.removeRating}/>
                    <label className="fa fa-star" htmlFor="2star"/>
                    <input type="radio" name="score" value="1" id="1star" onClick={this.removeRating}/>
                    <label className="fa fa-star" htmlFor="1star"/>
                  </div>
                  <button id="edit-btn">EDIT</button>
                </form>
              </div>
              : this.state.showEditEntry == "add-entry"
              ? <div id="popup-wrapper" >
                  <form id="add-form" className="popup-form" onSubmit={this.handleAdd} ref={this.wrapperRef}>
                    <select id="status-select" value={this.state.currentStatus} onChange={this.handleStatusChange}>
                      <option name="status" value="finished">Finished Reading</option>
                      <option name="status" value="current">Currently Reading</option>
                      <option name="status" value="dropped">Dropped</option>
                      <option name="status" value="plan">Plan to Read</option>
                    </select>
                    <div id="rating">
                      <input type="radio" name="score" value="5" id="5star" onClick={this.removeRating}/>
                      <label className="fa fa-star" htmlFor="5star"/>
                      <input type="radio" name="score" value="4" id="4star" onClick={this.removeRating}/>
                      <label className="fa fa-star" htmlFor="4star"/>
                      <input type="radio" name="score" value="3" id="3star" onClick={this.removeRating}/>
                      <label className="fa fa-star" htmlFor="3star"/>
                      <input type="radio" name="score" value="2" id="2star" onClick={this.removeRating}/>
                      <label className="fa fa-star" htmlFor="2star"/>
                      <input type="radio" name="score" value="1" id="1star" onClick={this.removeRating}/>
                      <label className="fa fa-star" htmlFor="1star"/>
                    </div>
                    <button id="add-btn">ADD</button>
                  </form>
            </div>
              : null

            }
            <div id="summary">
              <h2>Summary:</h2>
                {
                  this.state.bookData.summary === undefined
                  ? null
                  : this.state.bookData.summary.replaceAll("\\n", "\n")
                }
            </div>

            <div id="page-count">
              <span>{this.state.bookData.pageCount} Pages</span>
            </div>
            <div id="published-date">
              <span>Published: {this.state.bookData.publishedDate}</span>
            </div>
          </div>
          </div>
          <div id="book-note-list-wrapper">
            {this.state.showAddNote && 
            <CreateNote 
            hideFunc = {this.hideAddNote}
            loggedInUser = {this.props.loggedUser}
            isbn = {this.props.isbn}
            />
            }
            {
              this.state.noteData.map((item, idx) => {
                return(
                  <NoteTemplate 
                    key = {idx}
                    type={item[0].type}
                    title={item[0].title}
                    authorName={item[1].name}
                    authorPicture={item[1].profilePicture}
                    authorID={item[1].id}
                    text={item[0].text.replaceAll("\\n", "\n")}
                    noteDate={item[0].date.substring(0, 10)}
                    likeCount={item[2].length}
                    likeFunc = {this.handleLike}
                    noteID = {item[0].id}
                    userLikes = {this.state.userLikes}
                    page = {item[0].page}
                    loggedUser = {this.props.loggedUser ? this.props.loggedUser.id : 0}
                    updateNotes = {this.updateNotes}
                 />
                ) 
              })
            }
          </div>
        </div>
        
      )}
    }
  }
const NoteTemplate = (props) =>{
  const [showEditNote, setShowEditNote] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [currentBody, setCurrentBody] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);

  const hideShowEditNote = () => {
    setShowEditNote(false)
    setCurrentTitle(null)
    setCurrentBody(null)
    setCurrentPage(null)
    props.updateNotes()
  }
  const handleClick = (e) => {
    setCurrentTitle(e.target.parentNode.parentNode.querySelector("#title").textContent)
    setCurrentBody(e.target.parentNode.parentNode.parentNode.querySelector("#note-body").textContent)
    setCurrentPage(e.target.parentNode.parentNode.parentNode.querySelector("#note-date").textContent)
    setShowEditNote(true)
  }
  if (props.type === "Review"){
    return(
      <div id="Note-wrapper">
        <div id="note-header">
          <div id="title-edit-wrapper">
            <h1 id="title">{props.title}</h1>
            {props.authorID === props.loggedUser && <button onClick={handleClick}  id="edit-note-btn">EDIT</button>}
          </div>
          <a href={`http://localhost:3000/user/${props.authorID}`}  id="author-wrapper">
            <span id="note-author">{props.authorName}</span>
            <img src={props.authorPicture}></img>
          </a>
        </div>
        <p id="note-body" >{props.text}</p>
        <div id="note-footer" >
          <span id="note-date">{"Submitted " + props.noteDate}</span>
          <div id="like-wrapper">
            <span id="like-count">{props.likeCount}</span>
            <button id={props.noteID} className="like" style={props.userLikes.includes(props.noteID) ? {color: "red"} : {color: "#bab5b5"}} onClick={props.likeFunc}> <i className="fa fa-heart like-icon"/></button>
          </div>
        </div>
        {showEditNote && <CreateNote
        hideFunc = {hideShowEditNote}
        isEdit = {true}
        editTitle = {currentTitle}
        editBody = {currentBody}
        noteID = {props.noteID}
        editType = {"Review"}
        />}
      </div>  
    )
  }
  else if (props.type === "Quote"){
    return(
      <div id="Note-wrapper">
        <div id="note-header">
        <div id="title-edit-wrapper">
          <h1 id="title">Quote</h1>
          {props.authorID === props.loggedUser && <button onClick={handleClick} id="edit-note-btn">EDIT</button>}
          </div>
          <a href={`http://localhost:3000/user/${props.authorID}`} id="author-wrapper">
            <span id="note-author">{props.authorName}</span>
            <img src={props.authorPicture}></img>
          </a>
        </div>
        <p id="note-body">{props.text}</p>
        <div id="note-footer">
          <span id="note-date">{"Page " + props.page}</span>
          <div id="like-wrapper">
            <span id="like-count">{props.likeCount}</span>
            <button id={props.noteID} className="like" style={props.userLikes.includes(props.noteID) ? {color: "red"} : {color: "#bab5b5"}} onClick={props.likeFunc}> <i className="fa fa-heart like-icon"/></button>
          </div>
        </div>
        {showEditNote && <CreateNote
        hideFunc = {hideShowEditNote}
        isEdit = {true}
        editTitle = {currentPage.substring(5, currentPage.length)}
        editBody = {currentBody}
        noteID = {props.noteID}
        editType = {"Quote"}
        />}
      </div>
    )
    
  }
} 

class CreateNote extends React.Component{
  constructor(props){
    super(props)
    this.state={
      currentTitle: "",
      currentBody: "",
      currentType: "Review",
      titleTooLongOrShort: false,
      bodyTooShort: false,
    }
    this.wrapperRef = React.createRef();
    this.removePopup = this.removePopup.bind(this)
    this.test = this.test.bind(this)
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleBodyChange = this.handleBodyChange.bind(this)
    this.handleTypeChange = this.handleTypeChange.bind(this)
    this.submitNote = this.submitNote.bind(this)
  }
  componentDidMount(){
    document.addEventListener("mousedown", this.removePopup)
    if (this.props.isEdit){
      this.setState({
        currentBody: this.props.editBody,
        currentTitle: this.props.editTitle
      })
    }
  }
  componentWillUnmount(){
    document.removeEventListener("mousedown", this.removePopup)
  }
  removePopup(event){
    if(this.wrapperRef && !this.wrapperRef.current.contains(event.target)){
      this.props.hideFunc()
    }
  }
  test(e){
    e.preventDefault();
  }
  handleTitleChange(e){
    if (e.target.value.length < 41 && e.target.value.length > 0){
      this.setState({
        titleTooLongOrShort: false,
        currentTitle: e.target.value
      })
      }else{
        this.setState({
          titleTooLongOrShort: true,
        })
      }
  }
  handleBodyChange(e){
    if (e.target.value.length > 0){
    this.setState({
      bodyTooShort: false,
      currentBody: e.target.value.replace(/(?:\r\n|\r|\n)/g, '%0A')
    })
    }else{
      this.setState({
        bodyTooShort: true,
      })
    }
  }
  handleTypeChange(e){
    this.setState({
      currentType: e.target.value
    })
  }
  submitNote(e){
    e.preventDefault();
    if(this.props.isEdit){
      if (this.props.editType == "Review"){
        fetch(`https://book-album.herokuapp.com/API/editNote/${this.props.noteID}/${this.state.currentTitle}/${this.state.currentBody}/0`, {method: "POST"})
      }else{
        fetch(`https://book-album.herokuapp.com/API/editNote/${this.props.noteID}/undefined/${this.state.currentBody}/${this.state.currentTitle}`, {method: "POST"})
      }
    }
    else{
      if(this.state.currentType === "Review"){
        fetch(`https://book-album.herokuapp.com/API/note/post/${this.props.isbn}/${this.props.loggedInUser.id}/${this.state.currentType}/${this.state.currentTitle}/${this.state.currentBody}/0`, {method: "POST"})
      }else{
        fetch(`https://book-album.herokuapp.com/API/note/post/${this.props.isbn}/${this.props.loggedInUser.id}/${this.state.currentType}/${undefined}/${this.state.currentBody}/${this.state.currentTitle}`, {method: "POST"})
      }
    }
    this.props.hideFunc()
  }

  render(){
    return (
      <div id="create-note-wrapper">
        <form id="create-note-form" ref={this.wrapperRef} onSubmit={this.submitNote}>
          <div id="title-wrapper">
            <select value={this.state.currentType} onChange={this.handleTypeChange}>
              <option>Review</option>
              <option>Quote</option>
            </select>
            {this.state.currentType == "Quote" && <input type="text" id="quote-page-input" placeholder="Page" onChange={this.handleTitleChange} value={this.state.currentTitle}/>}
            {this.state.currentType == "Review" && <input type="text" id="note-title-input" placeholder="Title" onChange={this.handleTitleChange} value={this.state.currentTitle} style={this.state.titleTooLongOrShort ? {border: "2px solid red"} : {border: "1px solid black"}}/>}
          </div>
          {this.state.titleTooLongOrShort && <span id="title-warning">Please enter a title between 3 and 40 characters in length!</span>}
          <textarea id="note-body-input" placeholder={this.state.currentType == "Review" ? "Share your thoughts" : "Quote here"} onChange={this.handleBodyChange} value={this.state.currentBody} style={this.state.bodyTooShort ? {border: "2px solid red"} : {border: "1px solid black"}}/>
          {this.state.bodyTooShort && <span id="body-warning">This field is required!</span>}
          {!this.props.isEdit && <button id="submit-note" style={this.state.bodyTooShort || this.state.titleTooLongOrShort ? {backgroundColor: "lightgrey", pointerEvents: "none"} : null}>Submit!</button>}
          {this.props.isEdit && <button id="edit-note" onClick={this.handleEdit} style={this.state.bodyTooShort || this.state.titleTooLongOrShort ? {backgroundColor: "lightgrey", pointerEvents: "none"} : null}>Edit!</button>}
        </form>
      </div>
    )
  }
}


  export default Bookpage;