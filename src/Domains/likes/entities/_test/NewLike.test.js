const NewLike = require('../NewLike');

describe('NewLike entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      commentId: 'comment-123',
    };

    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      commentId: [],
      owner: 123,
    };

    expect(() => new NewLike(payload)).toThrowError('NEW_LIKE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newLike object correctly', () => {
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const newLike = new NewLike(payload);
    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.owner).toEqual(payload.owner);
  });
});
