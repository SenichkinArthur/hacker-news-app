import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      searchTerm: "",
      error: null,
      isLoadingNews: false,
      isLoadingPage: false,
    };
    this.posts = this.posts.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.inputVal = this.inputVal.bind(this);
    this.submit = this.submit.bind(this);
  }
  componentDidMount() {
    this.setState({ isLoadingNews: true });

    fetch("http://hn.algolia.com/api/v1/search?query=&tags=story")
      .then(response => response.json())
      .then(result => this.posts(result))
      .catch(error => this.setState({ error }));
  }
  posts(result) {
    const { hits, page } = result;
    const oldHits = page !== 0
      ? this.state.result.hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    this.setState({
      result: {hits: updatedHits, page},
      isLoadingNews: false,
      isLoadingPage: false,
    });
  }
  inputVal(event) {
    this.setState({searchTerm: event.target.value});
  }
  onSearch(searchTerm, page = 0) {
    if(page === 0) {
      this.setState({
        isLoadingNews: true,
      });
    } else {
      this.setState({
        isLoadingPage: true,
      });
    }

    let url = "http://hn.algolia.com/api/v1/search?query=" + searchTerm + "&tags=story&page=" + page;
    fetch(url)
      .then(response => response.json())
      .then(result => this.posts(result))
      .catch(error => this.setState({ error }));
  }
  submit(event) {
    event.preventDefault();
    this.onSearch(this.state.searchTerm);
  }
  
  render() {
    let {result, searchTerm, error, isLoadingNews, isLoadingPage} = this.state;
    let page = (result && result.page) || 0; // ????????????????????????????????????????
    
    if(!result) {return null;}

    return (
      <div className="App">
        <Search value={searchTerm} inputVal={this.inputVal} submit={this.submit}></Search>
        <div className="news-wrap">
        { result.hits.length === 0
          ? <p>No matches found :( </p>
          : null
        }
          { error
            ? <p>Something went wrong.</p>
            : isLoadingNews
              ? <Loading type={"newsLoading"}/>
              : <News result={result}></News>
          }
        </div>
        { isLoadingPage
          ? <Loading type={"buttonLoading"} />
          : <ShowMore onSearch={() => this.onSearch(searchTerm, page + 1)}></ShowMore>
        }
        
      </div>
    );
  }
}

class News extends Component {
  render() {
    let result = this.props.result;

    return(
      result.hits.map((item) => {
        return (
          <div key={item.objectID} className="news-item">
            <a href={item.url} className="link">
              <p className="news-item-title">{item.title}</p>
              <span className="news-item-info">Author: </span> <span className="news-item-text">{item.author} </span>
              <span className="news-item-info">Date: </span>   <span className="news-item-text">{item.created_at} </span>
            </a>
          </div>
        )
      })      
    )
  }
}

class Search extends Component {
  render() {
    let {value, inputVal, submit} = this.props;
    return (
      <div className="search-wrap">
        <form className="search-form" onSubmit={submit}>
          <input className="search-wrap-text" placeholder="Search" type="text" value={value} onChange={inputVal} />
          <input className="search-wrap-btn" type="submit" value=" "/>
        </form>
      </div>
    )
  }
}
class ShowMore extends Component {
  render() {
    let onSearch = this.props.onSearch;
    return (
      <div>
        <button className="show-more-btn" onClick={onSearch}>Show More</button>
      </div>
    )
  }
}
class Loading extends Component {
  render() {
    let type = this.props.type;
    if(type === "newsLoading") {
      return <div className="spinner-wrap"><i className="fa fa-spinner fa-spin fa-3x fa-fw"></i></div>
    } else if(type === "buttonLoading") {
      return <div>Loading more news...</div>
    }
  }
  
  
}

export default App;