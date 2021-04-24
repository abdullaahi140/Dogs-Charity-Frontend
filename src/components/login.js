import React from 'react';
import { withRouter } from 'react-router-dom';
import { GoogleOutlined } from '@ant-design/icons';
import OauthPopup from 'react-oauth-popup';

import {
	Form, Input, Button, message
} from 'antd';
import PropTypes from 'prop-types';

import { status, json } from '../utilities/requestHandlers.js';
import UserContext from '../contexts/user.js';

// add some layout to keep the form organised on different screen sizes
const formItemLayout = {
	labelCol: { xs: { span: 24 }, sm: { span: 6 } },
	wrapperCol: { xs: { span: 24 }, sm: { span: 12 } }
};
const tailFormItemLayout = {
	wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 6 } }
};

// define validation rules for the form fields
const passwordRules = [
	{ required: true, message: 'Please input your password!' }
];

const usernameRules = [
	{ required: true, message: 'Please input your username!', whitespace: true }
];

/**
 * Login form component for app signup.
 */
class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { redirect: false };
		this.login = this.login.bind(this);
		this.handleGoogle = this.handleGoogle.bind(this);
	}

	handleGoogle() {
		fetch('http://localhost:3000/api/v1/auth/google/callback', {
			method: 'GET'
		})
			.then(status)
			.then(json)
			.then((user) => {
				// eslint-disable-next-line no-console
				console.log(user);
				const { login } = this.context;
				login(user);
				this.setState({ redirect: true });
			})
			.catch((err) => {
				console.error(err);
			});
	}

	login(values) {
		const { username, password } = values;
		fetch('http://localhost:3000/api/v1/auth/login', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${btoa(`${username}:${password}`)}`
			}
		})
			.then(status)
			.then(json)
			.then((user) => {
				const { login } = this.context;
				login(user);
				this.setState({ redirect: true });
			})
			.catch((err) => {
				console.error(err);
				message.error('Incorrect username or password');
			});
	}

	render() {
		const { redirect } = this.state;
		const { location, history } = this.props;
		const { from } = location.state || { from: { pathname: '/' } };
		if (redirect) {
			history.push(from.pathname);
		}

		return (
			<Form {...formItemLayout} name="login" onFinish={this.login} scrollToFirstError>
				<Form.Item name="username" label="Username" rules={usernameRules}>
					<Input />
				</Form.Item>
				<Form.Item name="password" label="Password" rules={passwordRules} hasFeedback>
					<Input.Password />
				</Form.Item>
				<Form.Item {...tailFormItemLayout}>
					<Button type="primary" htmlType="submit">Login</Button>
					<OauthPopup
						url="http://localhost:3000/api/v1/auth/google/callback"
						onCode={(code, params) => {
							console.error(code);
							console.error(params);
						}}
						onClose={() => console.error('closed')}
					>
						<Button icon={<GoogleOutlined />}>Login with Google</Button>
					</OauthPopup>
				</Form.Item>
			</Form>
		);
	}
}

LoginForm.contextType = UserContext;
LoginForm.propTypes = {
	location: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired
};

export default withRouter(LoginForm);