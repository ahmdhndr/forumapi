class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, username, date, is_deleted: isDeleted,
    } = payload;

    this.id = id;
    this.content = isDeleted ? '**balasan telah dihapus**' : content;
    this.username = username;
    this.date = date;
  }

  _verifyPayload({
    id, username, content, date,
  }) {
    if (!id || !username || !content || !date) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
