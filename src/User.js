import React, { useState } from "react";
import {resolvePath, useParams} from "react-router-dom";
import './style.css';
import 'font-awesome/css/font-awesome.min.css';
import { useAuth0, User } from "@auth0/auth0-react";


function Userpage(props){
    let { userID } = useParams();
    return(
            <Main userID={userID} loggedUser={props.userProp}/>
    )
}

class Main extends React.Component{
    constructor(props){
      super(props);
      this.state={
        userDoesNotExist: false,
        userData:"",
        userBookData:[],
        bookData: [],
        filterByStatus: "finished",
        prevScrollPos: 0,
        userInfoPos: 0,
        currentHover: null,
        showCreateNote: false,
        userBookForNote: null,
        showEditEntry: false,
        editUserInfo: false,
        currentAboutMe: "",
        noteData: [],
      }
      this.saveUserInfo = this.saveUserInfo.bind(this)
      this.changeAboutMe = this.changeAboutMe.bind(this)
      this.editUserData = this.editUserData.bind(this)
      this.handleUnHover = this.handleUnHover.bind(this)
      this.handlleFilter = this.handlleFilter.bind(this)
      this.handleUserInfoMove = this.handleUserInfoMove.bind(this)
      this.handleHover = this.handleHover.bind(this)
      this.handleHoverChild = this.handleHoverChild.bind(this)
      this.showAddNote = this.showAddNote.bind(this)
      this.hideAddNote = this.hideAddNote.bind(this)
      this.showEditEntryFunc = this.showEditEntryFunc.bind(this)
      this.hideEditEntry = this.hideEditEntry.bind(this)
      this.getUserBookData = this.getUserBookData.bind(this)
      this.cancelUserInfo = this.cancelUserInfo.bind(this)
      this.updateNotes = this.updateNotes.bind(this)
      this.getUserLikes = this.getUserLikes.bind(this)
      this.handleLike = this.handleLike.bind(this)
      this.deleteApi = this.deleteApi.bind(this)
      this.postApi = this.postApi.bind(this)
    }

  componentDidUpdate(prevProps){
    if (this.props.loggedUser !== prevProps.loggedUser && this.props.loggedUser){
    this.getUserLikes();
    }
  }
  componentDidMount(){
    this.getAPI(`https://book-album.herokuapp.com/API/user/${this.props.userID}`, (res) => {
    this.setState({
        userData: res[0]
      })
    })
    this.getUserBookData();
    this.updateNotes();
  }
  getAPI(url, callback){
    fetch(url)
    .then(res => res.json())
    .then(json => callback(json))
  }
  getUserBookData(){
    this.setState({
      userBookData: [],
    },() => {
      this.getAPI(`https://book-album.herokuapp.com/API/userBook/${this.props.userID}`, (res) => {
      res.map((item) => {
        this.getAPI(`https://book-album.herokuapp.com/API/book/${item.isbn}`, (res) => {
          this.setState({
            userBookData: [...this.state.userBookData, [item, ...res]]
          })
        })
      })
    })   
    })
    
  }
  //
  handlleFilter(event){
    this.setState({
      filterByStatus: event.target.id,
      userInfoPos: 0
    }, () =>document.getElementById("user-info-wrapper").style.top = "0vh")
  }
  handleUserInfoMove(){
    let currentScrollPos = document.getElementById("book-list-wrapper").scrollTop;
    let newInfoPos = this.state.userInfoPos;
    // fixes the book hover overlay in place 

    if (this.state.currentHover){
      let hover = document.getElementById(this.state.currentHover[1])
      this.setState({
        overlayPos: hover.getBoundingClientRect()
      })
    }

    //moves the user info out of sight during scroll down in mobile mode
    if ( currentScrollPos > this.state.prevScrollPos && newInfoPos >= -19){
      newInfoPos -= 6.5;
    }else if (currentScrollPos < this.state.prevScrollPos && newInfoPos < 0 ){
      newInfoPos += 6.5;
    }
    this.setState({
      prevScrollPos: currentScrollPos,
      userInfoPos: newInfoPos
    }, () => document.getElementById("user-info-wrapper").style.top = this.state.userInfoPos + "vh")
  }
  handleHover(e){
    this.setState({
      currentHover: [this.state.userBookData[e.target.id], e.target.id],
      overlayPos: e.target.getBoundingClientRect()
    })
  }
  handleUnHover(){
    this.setState({
      currentHover: null,
    })
  }
  handleHoverChild(e){
    let prevHover = this.state.currentHover[1]
    this.setState({
      currentHover: [this.state.userBookData[prevHover], prevHover]
    })
  }
  showAddNote(){
    this.setState({
      showAddNote: true,
      userBookForNote: this.state.currentHover,
    })
  }
  hideAddNote(){
    this.setState({
      showAddNote: false,
    })
  }
  showEditEntryFunc(){
    this.setState({
      showEditEntry: true,
      userBookForNote: this.state.currentHover,
    })
  }
  hideEditEntry(){
    this.setState({
      showEditEntry: false,
    })
  }
  editUserData(){
    this.setState({
      editUserInfo: true,
      currentAboutMe: this.state.userData.aboutMe,
    })
  }
  changeAboutMe(e){
    this.setState({
      currentAboutMe: e.target.value,
    })
  }
  saveUserInfo(){
    this.setState({
      editUserInfo: false,
    })
    fetch(`https://book-album.herokuapp.com/API/updateUser/${this.props.loggedUser.sub}/${this.state.currentAboutMe}`, {method: "POST"})
    this.getAPI(`https://book-album.herokuapp.com/API/user/${this.props.userID}`, (res) => {
    this.setState({
        userData: res[0]
      })
    })
  }
  cancelUserInfo(){
    this.setState({
      currentAboutMe: "",
      editUserInfo: false,
    })
  }
  updateNotes(){
    this.setState({
      noteData: [],
    }, () => {
      this.getAPI(`https://book-album.herokuapp.com/API/notebyuser/${this.props.userID}`, (res) => {
      res.map(item => {
        this.getAPI(`https://book-album.herokuapp.com/API/like/${item.id}`, (res) => {
          this.getAPI(`https://book-album.herokuapp.com/API/book/${item.isbn}`, (book) => {
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
                    isbn: item.isbn,
                    imgurl: `http://books.google.com/books/content?id=${item.isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`,
                    bookTitle: book[0].title
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
    }) 
  }
  getUserLikes(){
    let likedArr = []
    if (this.props.loggedUser){
      this.state.noteData.map(item => {
        likedArr = [...item[2].filter(likes => likes.userID == this.props.loggedUser.id), ...likedArr]
      })
    }
    else{
      this.state.noteData.map(item => {
        likedArr = [...item[2].filter(likes => likes.userID == 0), ...likedArr]
      })
    }
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
  deleteApi(url){
    fetch(url, {method: "DELETE"})
  }
  postApi(url){
    fetch(url, {method: "POST"})
  }
    render(){
      if (this.state.userData === undefined){
        return(
          <div id="noUser">This user does not exist</div>
        )}
      else{

      return(
        <div id="user-page-wrapper">
          <div id="user-info-wrapper">
            <h1 className="title">{this.state.userData.name}</h1>
            {this.state.editUserInfo
            ? <div id="save-cancel-container">
                <button id="save-user-info-btn" onClick={this.saveUserInfo}>save</button>
                <button id="cancel-user-info-btn" onClick={this.cancelUserInfo}>cancel</button>
              </div>
            :<button id="edit-user-info-btn" onClick={this.editUserData}>edit</button>}
            <img id="pfp" src={this.state.userData.profilePicture}></img>
            <div id="about-me">
              {!this.state.editUserInfo && <p>{this.state.userData.aboutMe}</p>}
              {this.state.editUserInfo && <textarea id="AboutMeTextArea" value={this.state.currentAboutMe} onChange={this.changeAboutMe} style={!this.state.currentAboutMe ? null : this.state.currentAboutMe.length > 140 ? {border: "2px solid red"} : null}/>}
            </div>
            <button id="finished" onClick={this.handlleFilter} style={this.state.filterByStatus === "finished" ? {backgroundColor: "#1F1D36"} : null}>Finished reading</button>
            <button id="current"onClick={this.handlleFilter} style={this.state.filterByStatus === "current" ? {backgroundColor: "#1F1D36"} : null}>Currently reading</button>
            <button id="dropped"onClick={this.handlleFilter} style={this.state.filterByStatus === "dropped" ? {backgroundColor: "#1F1D36"} : null}>Dropped</button>
            <button id="plan"onClick={this.handlleFilter} style={this.state.filterByStatus === "plan" ? {backgroundColor: "#1F1D36"} : null}>Plan to read</button>
            <button id="notes"onClick={this.handlleFilter} style={this.state.filterByStatus === "notes" ? {backgroundColor: "#1F1D36"} : null}>Notes</button>
          </div>
          <div id="book-list-wrapper" onScroll={this.handleUserInfoMove}>
            {
              this.state.filterByStatus === "notes"
              ? this.state.noteData.map((item, idx) => {
                console.log(item)
                return(
                  <NoteTemplate 
                    key = {idx}
                    type={item[0].type}
                    title={item[0].title}
                    authorName={item[0].bookTitle}
                    authorPicture={item[0].imgurl}
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
                    isbn = {item[0].isbn}
                 />
                ) 
              })
              
              : this.state.userBookData.map((item, idx)=> {
                if (item[0].status === this.state.filterByStatus) {
                  return(
                    <BookTemplate 
                    key={idx} 
                    imageUrl={`http://books.google.com/books/content?id=${item[1].isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`} 
                    title = {item[1].title}
                    isbn = {item[1].isbn}
                    hoverFunc = {this.handleHover}
                    unHoverFunc = {this.handleUnHover}
                    id = {idx}
                    />
                  )
                }
                
              })
            }
            {this.state.currentHover && 
            <div id="book-info" onMouseOut={this.handleUnHover} style={{
              width: this.state.overlayPos.width,
              height: this.state.overlayPos.height,
              top: this.state.overlayPos.top -58,
              left: this.state.overlayPos.left,
            }}>
              <span id="title-info" className="info-span" onMouseEnter={this.handleHoverChild}>{this.state.currentHover[0][1].title}</span>
              <span id="author-info" className="info-span" onMouseEnter={this.handleHoverChild}>{this.state.currentHover[0][1].author}</span>
              <span id="page-count-info" className="info-span" onMouseEnter={this.handleHoverChild}>Pages: {this.state.currentHover[0][1].pageCount}</span>
              <span id="rating-info" className="info-span" onMouseEnter={this.handleHoverChild}>
              {[...Array(this.state.currentHover[0][0].score)].map((item, idx) => <i className="fa fa-star" key={idx} onMouseEnter={this.handleHoverChild}/>
              )}
              </span>
              <span id="date-info" className="info-span" onMouseEnter={this.handleHoverChild}>{this.state.currentHover[0][0].date.substring(0, 10)}</span>
              <div id="book-info-controls"> 
                {  this.props.loggedUser ? this.props.loggedUser.id == this.props.userID &&  <button id="edit-entry-button" onMouseEnter={this.handleHoverChild} onClick={this.showEditEntryFunc}>Edit entry</button> : null}
                {  this.props.loggedUser ? this.props.loggedUser.id == this.props.userID && <button id="add-note-button" onMouseEnter={this.handleHoverChild} onClick={this.showAddNote}>Add note</button> : null}
              </div>
            </div>
            }
          </div>
          {this.state.showAddNote && <CreateNote 
          hideFunc={this.hideAddNote}
          bookData = {this.state.userBookForNote}
          loggedInUser = {this.props.loggedUser}
          />}
          {this.state.showEditEntry && <EditEntry 
          hideFunc={this.hideEditEntry}
          bookData = {this.state.userBookForNote}
          loggedInUser = {this.props.loggedUser}
          updateUserBookData = {this.getUserBookData}
          />}
        </div>
      )}
    }
  }
  
const BookTemplate = (props) => {
  return (
    <div className="book-template-wrapper">
        <a href={`http://localhost:3000/book/${props.isbn}`}>
          <img id={props.id} src={props.imageUrl} alt={props.title} onMouseEnter={props.hoverFunc} onMouseLeave={props.unHoverFunc}/>
        </a>
    </div>
  )
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
        fetch(`https://book-album.herokuapp.com/API/note/post/${this.props.bookData[0][0].isbn}/${this.props.loggedInUser.id}/${this.state.currentType}/${this.state.currentTitle}/${this.state.currentBody}/0`, {method: "POST"})
      }else{
        fetch(`https://book-album.herokuapp.com/API/note/post/${this.props.bookData[0][0].isbn}/${this.props.loggedInUser.id}/${this.state.currentType}/${undefined}/${this.state.currentBody}/${this.state.currentTitle}`, {method: "POST"})
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

class EditEntry extends React.Component{
  constructor(props){
    super(props)
    this.state={
      deleteConfirmationVisible: false,
      currentStatus: this.props.bookData[0][0].status,
      currentRating: this.props.bookData[0][0].score,
    }
    this.wrapperRef = React.createRef();
    this.removePopup = this.removePopup.bind(this)
    this.showConfirmation = this.showConfirmation.bind(this)
    this.editEntry = this.editEntry.bind(this)
    this.handleStatusChange = this.handleStatusChange.bind(this)
    this.handleRatingChange = this.handleRatingChange.bind(this)
    this.deleteForReal = this.deleteForReal.bind(this)
  }
  componentDidMount(){
    if (this.state.currentRating){
      document.getElementById(this.state.currentRating+"star").checked = true
    }
    document.addEventListener("mousedown", this.removePopup)
  }
  componentWillUnmount(){
    document.removeEventListener("mousedown", this.removePopup)
  }
  removePopup(event){
    if(this.wrapperRef && !this.wrapperRef.current.contains(event.target)){
      this.props.hideFunc()
      document.removeEventListener("mousedown", this.removePopup)
    }
  }
  editEntry(e){
    e.preventDefault();
    fetch(`https://book-album.herokuapp.com/API/userbooks/put/${this.props.bookData[0][0].isbn}/${this.props.loggedInUser.id}/${this.state.currentStatus}/${this.state.currentRating}`, {method: "PUT"})
    .then(this.props.updateUserBookData)
    this.props.hideFunc()
  }
  showConfirmation(e){
    e.preventDefault();
    this.setState({
      deleteConfirmationVisible: true,
    })
  }
  handleStatusChange(e){
    this.setState({
      currentStatus: e.target.value 
    })
  }
  handleRatingChange(e){
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
  deleteForReal(){
    fetch(`https://book-album.herokuapp.com/API/userBooks/delete/${this.props.bookData[0][0].isbn}/${this.props.loggedInUser.id}`, {method: "DELETE"})
    .then(this.props.updateUserBookData)
    this.props.hideFunc()
  }
  render(){
    if (this.state.deleteConfirmationVisible){
      return(
        <div id="delete-confirmation" ref={this.wrapperRef}> 
            <span>This action is not reversible! Are you sure?</span>
            <button onClick={this.deleteForReal}>DELETE</button>
        </div>
      )
    }
    return (
            <div id="popup-wrapper" >
              <form id="add-form" className="popup-form" ref={this.wrapperRef}>
                <select id="status-select" value={this.state.currentStatus} onChange={this.handleStatusChange}>
                  <option name="status" value="finished">Finished Reading</option>
                  <option name="status" value="current">Currently Reading</option>
                  <option name="status" value="dropped">Dropped</option>
                  <option name="status" value="plan">Plan to Read</option>
                </select>
                <div id="rating">
                  <input type="radio" name="score" value="5" id="5star" onClick={this.handleRatingChange}/>
                  <label className="fa fa-star" htmlFor="5star"/>
                  <input type="radio" name="score" value="4" id="4star" onClick={this.handleRatingChange}/>
                  <label className="fa fa-star" htmlFor="4star"/>
                  <input type="radio" name="score" value="3" id="3star" onClick={this.handleRatingChange}/>
                  <label className="fa fa-star" htmlFor="3star"/>
                  <input type="radio" name="score" value="2" id="2star" onClick={this.handleRatingChange}/>
                  <label className="fa fa-star" htmlFor="2star"/>
                  <input type="radio" name="score" value="1" id="1star" onClick={this.handleRatingChange}/>
                  <label className="fa fa-star" htmlFor="1star"/>
                </div>
                <div id="edit-entry-button-wrapper">
                  <button id="edit-btn-userpage" onClick={this.editEntry}>EDIT</button>
                  <button id="delete-btn" onClick={this.showConfirmation}>DELETE</button>
                </div>
              </form>
              
            </div> 
            )
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
          <a href={`http://localhost:3000/book/${props.isbn}`}  id="author-wrapper">
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
          <a href={`http://localhost:3000/user/${props.isbn}`} id="author-wrapper">
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
export default Userpage;