import assert from 'assert';

describe('Array', () => {
    describe('#indexOf', () => {
        it('returns -1 when the value is not present', () => {
            assert.equal([1,2,3].indexOf(4), -1);
        });
        it('returns index of the value when present once', () => {
            assert.equal([1,2,3].indexOf(2), 1);
        });
        it('returns first index of the value when present multiple times', () => {
            assert.equal([1,2,3,2].indexOf(2), 1);
        });
    });
});
