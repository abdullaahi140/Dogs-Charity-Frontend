import React from 'react';
import { withRouter } from 'react-router-dom';

import {
	Button, Input, List, PageHeader, Form
} from 'antd';
import SendOutlined from '@ant-design/icons/SendOutlined';
import PropTypes from 'prop-types';

import Comment from './comment.js';
import UserContext from '../contexts/user.js';
import { json, status } from '../utilities/requestHandlers.js';

/**
 * Component that displays a list of current messages and a form to send new messages.
 */
class Message extends React.Component {
	constructor(props) {
		super(props);
		const { match } = this.props;
		this.state = {
			chatID: match.params.chatID,
			shelterName: '',
			messages: [],
			value: ''
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.fetchMessages = this.fetchMessages.bind(this);
	}

	/**
	 * Get request to retrieve all messages for the current chat.
	 */
	componentDidMount() {
		const { user } = this.context;
		const { chatID } = this.state;
		fetch(`http://localhost:3000/api/v1/chats/${chatID}`, {
			headers: {
				Authorization: `Bearer ${user.accessToken.token}`
			}
		})
			.then(status)
			.then(json)
			.then((data) => this.setState({ shelterName: data.locationName }))
			.catch((err) => console.error(err));
		this.fetchMessages();
		setInterval(this.fetchMessages, 1000); // refresh messages every second
	}

	/**
	 * Stop fetching messages when the component is not in view
	 */
	componentWillUnmount() {
		clearInterval(this.fetchMessages);
	}

	/**
	 * Update state when the text area is populated with text.
	 */
	handleChange(event) {
		this.setState({ value: event.target.value });
	}

	/**
	 * Submits the form if a message is provided for the current chat.
	 */
	handleSubmit() {
		const { user } = this.context;
		const { chatID, value } = this.state;
		if (!value) {
			return; // don't post if text area is empty
		}

		fetch(`http://localhost:3000/api/v1/messages/${chatID}`, {
			method: 'POST',
			body: JSON.stringify({ message: value }),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${user.accessToken.token}`
			}
		})
			.then(status)
			.then(json)
			.then(() => {
				this.setState({ value: '' });
				this.fetchMessages();
				window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // scroll to bottom
			})
			.catch((err) => {
				json(err)
					.then((data) => console.error(data));
			});
	}

	/**
	 * Fetch messages for the current chat.
	 */
	fetchMessages() {
		const { user } = this.context;
		const { chatID } = this.state;
		fetch(`http://localhost:3000/api/v1/messages/${chatID}`, {
			headers: {
				Authorization: `Bearer ${user.accessToken.token}`
			}
		})
			.then(status)
			.then(json)
			.then((data) => this.setState({ messages: data }))
			.catch((err) => {
				console.error(err);
				this.setState({ messages: [] });
			});
	}

	render() {
		const { shelterName, messages, value } = this.state;
		const { history } = this.props;
		return (
			<div style={{ padding: '0% 10% 1%' }}>
				<PageHeader
					className="site-page-header"
					title={`${shelterName} Shelter`}
					subTitle="Have a chat with us and we'll try our best."
					onBack={() => history.push('/chats')}
				/>

				<List
					style={{ padding: '2rem' }}
					header={`${messages.length} messages`}
					itemLayout="horizontal"
					dataSource={messages}
					renderItem={(item) => (
						<li>
							<Comment
								{...item}
								updateParent={this.fetchMessages}
							/>
						</li>
					)}
				/>

				<Form className="blur-form" style={{ position: 'sticky', bottom: '0.5rem' }} onFinish={this.handleSubmit}>
					<Form.Item>
						<Input.TextArea
							name="message"
							disabled={(shelterName === '')}
							rows={4}
							value={value}
							onChange={this.handleChange}
						/>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							icon={<SendOutlined />}
							disabled={(shelterName === '')}
						>
							Send Message
						</Button>
					</Form.Item>
				</Form>
			</div>
		);
	}
}

Message.contextType = UserContext;
Message.propTypes = {
	/** Object containing info on the URL including parameters */
	match: PropTypes.object.isRequired,
	/** Object containing the history of URLs for the app */
	history: PropTypes.object.isRequired
};

export default withRouter(Message);
