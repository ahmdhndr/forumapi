const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    await UsersTableTestHelper.addUser({ id: userId, username: 'erudev' });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
    await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newReply = {
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'balasan',
        owner: 'user-123',
      };
      const fakeIDGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIDGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);
      const reply = await RepliesTableTestHelper.findReplyById(addedReply.id);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: newReply.content,
        owner: newReply.owner,
      }));
      expect(reply).toBeDefined();
    });
  });

  describe('deleteReplyById function', () => {
    it('should update is_deleted column as true in database', async () => {
      // Arrange
      const addedReply = {
        id: 'reply-123',
        commentId: 'comment-123',
      };
      await RepliesTableTestHelper.addReply({
        id: addedReply.id, commentId: addedReply.commentId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReplyById('reply-123');
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');

      // Assert
      expect(reply[0].is_deleted).toEqual(true);
    });

    it('should throw NotFoundError when reply id is invalid or not found', async () => {
      // Arrange
      const replyId = 'reply-456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(replyRepositoryPostgres.deleteReplyById(replyId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('checkReplyIsExist function', () => {
    it('should throw NotFoundError when reply is not exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(replyRepositoryPostgres.checkReplyIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-888',
      })).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when reply is exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123' });

      // Act & Assert
      expect(replyRepositoryPostgres.checkReplyIsExist({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
      })).resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyReplyAccess function', () => {
    it('should throw AuthorizationError when user has no access', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-768', owner: 'user-123', commentId: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({ replyId: 'reply-768', ownerId: 'user-234' })).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when user has access', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123', commentId: 'comment-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(replyRepositoryPostgres.verifyReplyAccess({ replyId: 'reply-123', ownerId: 'user-123' })).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return all replies in a comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await UsersTableTestHelper.addUser({ id: 'user-789', username: 'janedoe' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-456', owner: 'user-123' });

      await CommentsTableTestHelper.addComment({ id: 'comment-456', owner: 'user-789', threadId: 'thread-456' });

      const replies = [
        {
          id: 'reply-123', content: 'Balasan a', date: '2021',
        },
        {
          id: 'reply-456', content: 'Balasan b', date: '2022',
        },
      ];

      const expectedReplies = [
        { ...replies[0], username: 'johndoe' },
        { ...replies[1], username: 'janedoe' },
      ];

      await RepliesTableTestHelper.addReply({ ...replies[0], owner: 'user-456', commentId: 'comment-456' });
      await RepliesTableTestHelper.addReply({ ...replies[1], owner: 'user-789', commentId: 'comment-456' });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const listOfReplies = await replyRepositoryPostgres
        .getRepliesByCommentId('comment-456');

      // Assert
      expect(listOfReplies).toEqual(expectedReplies);
    });
  });
});
