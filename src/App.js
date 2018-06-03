import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import AllPosts from "./Components/AllPosts";
import AddPost from "./Components/AddPost";

const posts = [{ "id": "1", "title": "My first post", "author": "Someone" }, { "id": "2", "title": "Another post", "author": "Someone else" }, { "id": "3", "title": "A better one", "author": "Stranger" }];

class App extends Component {
    state = { posts };

    handleOnAdd = (post) => {
        const { posts } = this.state;

        this.setState({
            posts: [...posts, post]
        });
    };

    handleOnDelete = ({id}) => {
        const { posts } = this.state;

        this.setState({
            posts: [...posts.filter(post => post.id !== id)]
        });
    }

    handleOnEdit = (editedPost) => {
        const { posts } = this.state;

        this.setState({
            posts: [...posts.map(post => post.id === editedPost.id ? editedPost : post)]
        });
    }

    render() {
        const { posts } = this.state;

        return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1 className="App-title">Welcome to React</h1>
            </header>
            <p className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
            </p>
            <AddPost onAdd={this.handleOnAdd} />
            <AllPosts posts={posts} onDelete={this.handleOnDelete} onEdit={this.handleOnEdit} />
        </div>
        );
    }
}

export default App;