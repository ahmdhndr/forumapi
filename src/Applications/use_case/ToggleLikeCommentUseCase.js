const NewLike = require('../../Domains/likes/entities/NewLike');

class ToggleLikeCommentUseCase {
  constructor({ commentRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._commentRepository.checkCommentIsExist({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
    });
    const newLike = new NewLike({
      commentId: useCasePayload.commentId,
      owner: useCasePayload.owner,
    });
    return this._likeRepository.toggleLike(newLike);
  }
}

module.exports = ToggleLikeCommentUseCase;
