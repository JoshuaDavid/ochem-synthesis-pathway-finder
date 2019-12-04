import assert from 'assert';
import {elements} from '../../src/model/Elements.js';
import {Electron} from '../../src/model/Electron.js';

describe('Atom', () => {
    describe('Hydrogen', () => {
        var h = new elements.Hydrogen;
        it('has a single electron in the 1s orbital', () => {
            assert.equal(h.getOrbitalContentType('1s'), Electron);
        });
    });
});
