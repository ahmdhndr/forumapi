const ToggleLikeCommentRepository = require('../ToggleLikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate the toggle like comment use case action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // creating dependency of use case
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    // mocking needed function
    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.toggleLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // creating use case instance
    const toggleLikeCommentUseCase = new ToggleLikeCommentRepository({
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Act
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.checkCommentIsExist)
      .toBeCalledWith({
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
      });
    expect(mockLikeRepository.toggleLike)
      .toBeCalledWith({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      });
  });
});
