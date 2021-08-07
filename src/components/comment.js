import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Comment, message as Message } from 'antd';
import axios from 'axios';

import PropTypes from 'prop-types';

import DeleteIcon from './deleteicon.js';
import Image from './image.js';
import useAuthentication from '../hooks/useAuthentication.js';

/**
 * Component that renders a single message from a chat.
 */
function MessageComment(props) {
	const { state: { user, accessToken } } = useAuthentication();
	const {
		ID, senderName, senderID, senderImageID, message, dateCreated
	} = props;
	const queryClient = useQueryClient();

	/**
	 * Delete a message from a chat.
	 */
	function deleteMessage() {
		return axios(`http://localhost:3000/api/v1/messages/${ID}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken.token}`
			}
		});
	}

	const { mutate } = useMutation(deleteMessage, {
		onSuccess: () => queryClient.refetchQueries('messages'),
		onError: () => Message.error('Message could not be deleted')
	});

	/**
	 * Determines whether to show the delete icon for a message
	 * Depends on who sent the message and the user's role
	 * @returns {null | React.ElementType<DeleteIcon>}
	 */
	function showDeleteIcon() {
		if (user.ID === senderID || user.role !== 'user') {
			return <DeleteIcon handleConfirm={mutate} key={ID} />;
		}
		return null;
	}

	return (
		<Comment
			author={senderName}
			avatar={<Image ID={senderImageID} alt={senderName} />}
			content={message}
			datetime={new Date(Date.parse(dateCreated)).toLocaleString()}
			actions={[showDeleteIcon()]}
		/>
	);
}

MessageComment.propTypes = {
	/** ID of message */
	ID: PropTypes.number.isRequired,
	/** Image ID of user who sent message */
	senderImageID: PropTypes.number.isRequired,
	/** Name of user who sent message */
	senderName: PropTypes.string.isRequired,
	/** ID of user who sent message */
	senderID: PropTypes.string.isRequired,
	/** The message string */
	message: PropTypes.string.isRequired,
	/** Datetime of the message being sent */
	dateCreated: PropTypes.string.isRequired
};

export default MessageComment;
