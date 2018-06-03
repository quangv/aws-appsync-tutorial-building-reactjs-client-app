import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import AllPosts from "./Components/AllPosts";
import AddPost from "./Components/AddPost";

import AWSAppSyncClient from 'aws-appsync';
import { Rehydrated } from 'aws-appsync-react';
import { AUTH_TYPE } from 'aws-appsync/lib/link/auth-link';
import { graphql, ApolloProvider, compose } from 'react-apollo';
import * as AWS from 'aws-sdk';
import AppSync from './AppSync.js'
import AllPostsQuery from './Queries/AllPostsQuery';
import NewPostMutation from './Queries/NewPostMutation';
import DeletePostMutation from './Queries/DeletePostMutation';
import UpdatePostMutation from './Queries/UpdatePostMutation';

const client = new AWSAppSyncClient({
    url: AppSync.graphqlEndpoint,
    region: AppSync.region,
    auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: AppSync.apiKey

        // type: AUTH_TYPE.AWS_IAM,
        // Note - Testing purposes only
        /*credentials: new AWS.Credentials({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        })*/

        // Amazon Cognito Federated Identities using AWS Amplify
        //credentials: () => Auth.currentCredentials(),

        // Amazon Cognito user pools using AWS Amplify
        // type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        // jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken(),
    }
})


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
                <h1 className="App-title">Welcom to React</h1>
              </header>
              <p className="App-intro">
                To get started, edit <code>src/App.js</code> and save to reload.
              </p>
              <NewPostWithData />
              <AllPostsWithData />
            </div>
        );
    }
}

const AllPostsWithData = compose(
    graphql(AllPostsQuery, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: (props) => ({
            posts: props.data.allPost && props.data.allPost.posts,
        })
    }),
    graphql(DeletePostMutation, {
        props: (props) => ({
            onDelete: (post) => props.mutate({
                variables: {id: post.id, expectedVersion: post.version },
                optimisticResponse: () => ({deletePost: {...post, __namenaem: 'Post'}}),
            })
        }),
        options: {
            refetchQueries: [{query: AllPostsQuery}],
            update: (proxy, {data: {deletePost: {id}}}) => {
                const query = AllPostsQuery;
                const data = proxy.readQuery({query});
                data.allPost.posts = data.allPost.posts.filter(post => post.id !== id);
                proxy.writeQuery({query, data});
            }
        }
    }),
    graphql(UpdatePostMutation, {
        props: (props) => ({
            onEdit: (post) => {
                props.mutate({
                    variables: {...post, expectedVersion: post.verson },
                    optimisticResponse: ()=> ({updatePost: {...post, __typename: 'Post', version: post.version + 1}}),
                })
            }
        }),
        options: {
            refetchQueries: [{query: AllPostsQuery}],
            update: (dataProxy, {data: {updatePost}}) => {
                const query = AllPostsQuery;
                const data = dataProxy.readQuery({query});

                data.allPost.posts = data.allPost.posts.map(post => post.id !== updatePost.id ? post: {...updatePost});
                dataProxy.writeQuery({query, data})
            }
        }
    })
)(AllPosts);


const NewPostWithData = graphql(NewPostMutation, {
    props: (props)=>({
        onAdd: post => props.mutate({
            variables: post,
            optimisticResponse: ()=> ({addPost: {...post, __typename: 'Post', version: 1}}),
        })
    }),
    options: {
        refetchQueries: [{query: AllPostsQuery}],
        update: (dataProxy, {data: {addPost}}) => {
            const query = AllPostsQuery;
            const data = dataProxy.readQuery({query});
            data.allPost.posts.push(addPost);
            dataProxy.writeQuery({query, data});
        }
    }
})

const WithProvider = () => (
    <ApolloProvider client={client}>
      <Rehydrated>
        <App />
      </Rehydrated>
    </ApolloProvider>
)
export default WithProvider;
