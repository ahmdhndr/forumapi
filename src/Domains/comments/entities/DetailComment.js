class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, content, date, is_deleted: isDeleted, replies,
    } = payload;

    this.id = id;
    this.username = username;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.date = date;
    this.replies = replies;
  }

  _verifyPayload({
    id, username, content, date, replies,
  }) {
    if (!id || !username || !content || !date || !replies) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || !(Array.isArray(replies))
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment;
