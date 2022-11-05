const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
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
        replies: [],
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'erudev',
        content: '**komentar telah dihapus**',
        date: '2022',
        replies: [],
      }),
    ];

    const expectedDetailReply = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: '**balasan telah dihapus**',
        date: '2022',
        username: 'janedoe',
      }),
      new DetailReply({
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'Balasan A',
        date: '2022',
        username: 'janedoe',
      }),
    ];

    const { is_deleted: isCommentDeletedA, ...detailCommentA } = expectedDetailComment[0];
    const { is_deleted: isCommentDeletedB, ...detailCommentB } = expectedDetailComment[1];
    const {
      is_deleted: isReplyDeletedA, commentId: commentIdReplyA, ...detailReplyA
    } = expectedDetailReply[0];
    const {
      is_deleted: isReplyDeletedB, commentId: commentIdReplyB, ...detailReplyB
    } = expectedDetailReply[1];

    const expectedCommentsAndReplies = [
      { ...detailCommentA, replies: [detailReplyA] },
      { ...detailCommentB, replies: [detailReplyB] },
    ];

    /* creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

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
        },
        {
          id: 'comment-456',
          username: 'erudev',
          content: 'Komentar B',
          date: '2022',
          is_deleted: true,
        },
      ]));

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'Balasan A',
          date: '2022',
          username: 'janedoe',
          is_deleted: true,
        },
        {
          id: 'reply-456',
          commentId: 'comment-456',
          content: 'Balasan A',
          date: '2022',
          username: 'janedoe',
          is_deleted: false,
        },
      ]));

    /* creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParams.threadId);
  });

  it('should return comments with content \'**komentar telah dihapus**\' when is_deleted is true', async () => {
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

    const expectedDetailComment = new DetailComment({
      id: 'comment-123',
      username: 'erudev',
      content: '**komentar telah dihapus**',
      date: '2022',
      replies: [],
    });

    const expectedDetailReply = new DetailReply({
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'Balasan A',
      date: '2022',
      username: 'janedoe',
    });

    const { is_deleted: isCommentDeleted, ...detailComment } = expectedDetailComment;
    const { is_deleted: isReplyDeleted, commentId, ...detailReply } = expectedDetailReply;

    const expectedCommentsAndReplies = [
      { ...detailComment, replies: [detailReply] },
    ];

    /* creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

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
          is_deleted: true,
        },
      ]));

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'Balasan A',
          date: '2022',
          username: 'janedoe',
          is_deleted: false,
        },
      ]));

    /* creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParams.threadId);
  });

  it('should return replies with content \'**balasan telah dihapus**\' when is_deleted is true', async () => {
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

    const expectedDetailComment = new DetailComment({
      id: 'comment-123',
      username: 'erudev',
      content: 'Komentar A',
      date: '2022',
      replies: [],
    });

    const expectedDetailReply = new DetailReply({
      id: 'reply-123',
      commentId: 'comment-123',
      content: '**balasan telah dihapus**',
      date: '2022',
      username: 'janedoe',
    });

    const { is_deleted: isCommentDeleted, ...detailComment } = expectedDetailComment;
    const { is_deleted: isReplyDeleted, commentId, ...detailReply } = expectedDetailReply;

    const expectedCommentsAndReplies = [
      { ...detailComment, replies: [detailReply] },
    ];

    /* creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

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
        },
      ]));

    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          commentId: 'comment-123',
          content: 'Balasan A',
          date: '2022',
          username: 'janedoe',
          is_deleted: true,
        },
      ]));

    /* creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParams.threadId);
  });
});
