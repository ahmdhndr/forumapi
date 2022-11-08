const ToggleLikeCommentUseCase = require('../../../../Applications/use_case/ToggleLikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
  }

  async putLikeCommentHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const toggleLikeCommentUseCase = await this._container
      .getInstance(ToggleLikeCommentUseCase.name);

    await toggleLikeCommentUseCase.execute({
      threadId,
      commentId,
      owner,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
