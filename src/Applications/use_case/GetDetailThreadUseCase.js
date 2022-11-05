const DetailThread = require('../../Domains/threads/entities/DetailThread');

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;

    await this._threadRepository.verifyThreadAvailability(threadId);

    const detailThread = await this._threadRepository.getThreadById(threadId);
    detailThread.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const threadReplies = await this._replyRepository.getRepliesByThreadId(threadId);

    for (let i = 0; i < detailThread.comments.length; i += 1) {
      const { is_deleted: isCommentDeleted, ...detailComment } = detailThread.comments[i];
      detailThread.comments[i] = detailComment;
      detailComment.content = isCommentDeleted
        ? '**komentar telah dihapus**'
        : detailComment.content;

      detailComment.replies = threadReplies
        .filter((reply) => reply.commentId === detailComment.id)
        .map((reply) => {
          const { commentId, is_deleted: isReplyDeleted, ...detailReply } = reply;
          detailReply.content = isReplyDeleted
            ? '**balasan telah dihapus**'
            : detailReply.content;

          return detailReply;
        });
    }

    return new DetailThread(detailThread);
  }
}

module.exports = GetDetailThreadUseCase;
