const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('endpoint concerning on liking a comment', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when like or unlike without access token', async () => {
      // Arrange
      const server = await createServer(container);

      const { userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 status code when like comment on invalid thread', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-xxx/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 status code when like on invalid comment', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment-xxx/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 200 status code when giving a like', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when user giving like to other\'s comment', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await LikesTableTestHelper.addLike({ commentId, owner: 'user-456' });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when user giving like to own comment', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await LikesTableTestHelper.addLike({ commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 status code when user unlike own comment', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await LikesTableTestHelper.removeLike({ commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when user unlike other\'s comment', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      await LikesTableTestHelper.removeLike({ commentId, owner: 'user-456' });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
