/* eslint-disable no-await-in-loop */
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class GetDetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;

    await this._threadRepository.verifyThreadAvailability(threadId);

    const detailThread = await this._threadRepository.getThreadById(threadId);
    detailThread.comments = await this._commentRepository.getCommentsByThreadId(threadId);

    for (let i = 0; i < detailThread.comments.length; i += 1) {
      const replies = await this._replyRepository
        .getRepliesByCommentId(detailThread.comments[i].id);
      detailThread.comments[i] = new DetailComment({
        id: detailThread.comments[i].id,
        content: detailThread.comments[i].content,
        username: detailThread.comments[i].username,
        date: detailThread.comments[i].date,
        is_deleted: detailThread.comments[i].is_deleted,
        replies: replies.map((reply) => new DetailReply(reply)),
        likeCount: await this._likeRepository
          .getLikeCountByCommentId(detailThread.comments[i].id),
      });
    }

    return new DetailThread(detailThread);
  }
}

module.exports = GetDetailThreadUseCase;
