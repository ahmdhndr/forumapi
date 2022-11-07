const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

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
      detailThread.comments[i] = new DetailComment({
        id: detailThread.comments[i].id,
        content: detailThread.comments[i].content,
        username: detailThread.comments[i].username,
        date: detailThread.comments[i].date,
        is_deleted: detailThread.comments[i].is_deleted,
        replies: threadReplies
          .filter((reply) => reply.commentId === detailThread.comments[i].id)
          .map((reply) => new DetailReply(reply)),
      });
    }

    return new DetailThread(detailThread);
  }
}

module.exports = GetDetailThreadUseCase;
