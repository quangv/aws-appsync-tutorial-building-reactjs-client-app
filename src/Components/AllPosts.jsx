import React, { Component } from "react";

export default class AllPosts extends Component {

    constructor(props) {
        super(props);

        this.state = {
            editing: {}
        }
    }

    static defaultProps = {
        posts: [],
        onDelete: () => null,
        onEdit: () => null,
    }

    handleDelete = (post) => {
        if (window.confirm('Are you sure')) {
            this.props.onDelete(post);
        }
    }

    handleEdit = (post) => {
        const { editing } = this.state;

        this.setState({ editing: { ...editing, [post.id]: { ...post } } });
    }

    handleEditCancel = (id) => {
        const { editing } = this.state;
        const { [id]: curr, ...others } = editing;

        this.setState({ editing: { ...others } });
    }

    handleFieldEdit = (id, field, event) => {
        const { target: { value } } = event;
        const { editing } = this.state;
        const editData = { ...editing[id] };

        editData[field] = value;

        this.setState({
            editing: { ...editing, ...{ [id]: editData } }
        });
    }

    handleEditSave = (id) => {
        const { editing } = this.state;
        const { [id]: editedPost, ...others } = editing;

        this.props.onEdit({ ...editedPost });
        this.setState({
            editing: { ...others }
        });
    }

    renderOrEditPost = (post) => {
        const { editing } = this.state;

        const editData = editing[post.id];
        const isEditing = !!editData;

        return (
            !isEditing ?
                (
                    <tr key={post.id}>
                        <td>{post.id}</td>
                        <td>{post.title}</td>
                        <td>{post.author}</td>
                        <td>
                            <button onClick={this.handleEdit.bind(this, post)}>Edit</button>
                            <button onClick={this.handleDelete.bind(this, post)}>Delete</button>
                        </td>
                    </tr>
                ) : (
                    <tr key={post.id}>
                        <td>
                            {post.id}
                        </td>
                        <td>
                            <input type="text" value={editData.title} onChange={this.handleFieldEdit.bind(this, post.id, 'title')} />
                        </td>
                        <td>
                            <input type="text" value={editData.author} onChange={this.handleFieldEdit.bind(this, post.id, 'author')} />
                        </td>
                        <td>
                            <button onClick={this.handleEditSave.bind(this, post.id)}>Save</button>
                            <button onClick={this.handleEditCancel.bind(this, post.id)}>Cancel</button>
                        </td>
                    </tr>
                )
        );
    }

    render() {
        const { posts } = this.props;

        return (<table width="100%">
            <thead>
                <tr>
                    <th>id</th>
                    <th>title</th>
                    <th>author</th>
                    <th>action</th>
                </tr>
            </thead>
            <tbody>
                {[].concat(posts).sort((a, b) => b.id - a.id).map(this.renderOrEditPost)}
            </tbody>
        </table>);
    }
}