const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewLike = require('../../../Domains/likes/entities/NewLike');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('toggleLike function', () => {
    it('should add liked comment to database if record not exist', async () => {
      // Arrange
      const newLike = new NewLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const fakeIDGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIDGenerator);

      // Act
      const addedLike = await likeRepositoryPostgres.toggleLike(newLike);
      const like = await LikesTableTestHelper
        .getLikeByCommentIdAndOwner(newLike);

      // Assert
      expect(addedLike).toStrictEqual({
        index: 1,
        id: 'like-123',
      });
      expect(like).toStrictEqual({
        id: 'like-123',
        comment_id: 'comment-123',
        owner: 'user-123',
      });
    });

    it('should remove liked comment from database if record already exist', async () => {
      // Arrange
      const newLike = new NewLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Act
      await LikesTableTestHelper.removeLike(newLike);
      const addedLike = await likeRepositoryPostgres.toggleLike(newLike);
      const like = await LikesTableTestHelper
        .getLikeByCommentIdAndOwner(newLike);

      // Assert
      expect(addedLike).toStrictEqual({
        index: -1,
        id: 'like-123',
      });
      expect(like).toBeUndefined();
    });
  });

  describe('getLikeCountByCommentId', () => {
    it('should return the correct number of likeCount to the comment #1', async () => {
      // Arrange
      const newLike1 = new NewLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const newLike2 = new NewLike({
        commentId: 'comment-456',
        owner: 'user-123',
      });

      // add second comment
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123', owner: 'user-123' });
      // add first like to commentId = 'comment-123'
      await LikesTableTestHelper
        .addLike({
          commentId: newLike1.commentId,
          owner: newLike1.owner,
        });
      // add second like to commentId = 'comment-456'
      await LikesTableTestHelper
        .addLike({
          id: 'like-456',
          commentId: newLike2.commentId,
          owner: newLike2.owner,
        });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Act
      const likeCount1 = await likeRepositoryPostgres
        .getLikeCountByCommentId(newLike1.commentId);
      const likeCount2 = await likeRepositoryPostgres
        .getLikeCountByCommentId(newLike2.commentId);

      // Assert
      expect(likeCount1).toEqual(1);
      expect(likeCount2).toEqual(1);
    });

    it('should return the correct number of likeCount to the comment #2', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await LikesTableTestHelper.addLike({ id: 'like-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-456', owner: 'user-456' });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Act
      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likeCount).toEqual(2);
    });

    it('should return likeCount with 0 if the comment has no like', async () => {
      // Arrange
      const commentId = 'comment-456';

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Act
      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId(commentId);

      // Assert
      expect(likeCount).toEqual(0);
    });
  });
});
