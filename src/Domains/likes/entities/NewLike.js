class NewLike {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId, owner } = payload;

    this.commentId = commentId;
    this.owner = owner;
  }

  _verifyPayload({ commentId, owner }) {
    if (!commentId || !owner) {
      throw new Error('NEW_LIKE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof commentId !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('NEW_LIKE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewLike;
