const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating get detail thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'Sebuah judul',
      body: 'Isi thread',
      username: 'dicoding',
      date: '2022',
      comments: [],
    });

    const expectedDetailComment = [
      new DetailComment({
        id: 'comment-123',
        username: 'erudev',
        content: 'Komentar A',
        date: '2022',
        likeCount: 0,
        replies: [],
      }),
    ];

    const expectedDetailReply = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Balasan A',
        username: 'janedoe',
        date: '2022',
      }),
      new DetailReply({
        id: 'reply-456',
        commentId: 'comment-123',
        content: 'Balasan A',
        date: '2022',
        username: 'johndoe',
      }),
    ];

    const { ...detailComment } = expectedDetailComment[0];
    const { ...detailReplyA } = expectedDetailReply[0];
    const { ...detailReplyB } = expectedDetailReply[1];

    const expectedCommentsAndReplies = [
      { ...detailComment, replies: [detailReplyA, detailReplyB] },
    ];

    /* creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /* mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'Sebuah judul',
        body: 'Isi thread',
        username: 'dicoding',
        date: '2022',
        comments: [],
      }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'erudev',
          content: 'Komentar A',
          date: '2022',
          is_deleted: false,
          likeCount: 0,
        },
      ]));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'Balasan A',
          date: '2022',
          username: 'janedoe',
          is_deleted: false,
        },
        {
          id: 'reply-456',
          commentId: 'comment-123',
          content: 'Balasan A',
          date: '2022',
          username: 'johndoe',
          is_deleted: false,
        },
      ]));

    mockLikeRepository.getLikeCountByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(0));

    /* creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(useCaseParams);

    // Assert
    expect(detailThread).toEqual(new DetailThread({
      ...expectedDetailThread, comments: expectedCommentsAndReplies,
    }));
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCaseParams.threadId);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(expectedDetailComment[0].id);
  });
});
