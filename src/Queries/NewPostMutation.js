import gql from 'graphql-tag';

export default gql`
mutation AddPostMutation($id: ID!, $author: String!, $title: String!) {
  addPost(
      id: $ID
      author: $author
      title: $title
      content: " "
      url: " "
      ) {
        __typename
        id
        author
        title
        version
  }
}`;