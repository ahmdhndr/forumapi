class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const detailThread = await this._threadRepository.verifyThreadAvailability(threadId);
    detailThread.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const threadReplies = await this._replyRepository.getRepliesByThreadId(threadId);

    for (let i = 0; i < detailThread.comments.length; i += 1) {
      detailThread.comments[i].replies = threadReplies
        .filter((reply) => reply.commentId === detailThread.comments[i].id)
        .map((reply) => {
          const { commentId, ...detailReply } = reply;
          return detailReply;
        });
    }

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
