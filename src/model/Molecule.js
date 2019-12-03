import {Bond, SingleBond, DoubleBond, TripleBond} from '/src/model/Bond.js';

class Molecule {
    constructor() {
        this.atoms = [];
        this.bonds = [];
    }

    hasAtom(atom) {
        for (var i = 0; i < this.atoms.length; i++) {
            if (atom == this.atoms[i]) {
                return true;
            }
        }
        return false;
    }

    createBond(bondType, atom1, atom2) {
        if (!this.hasAtom(atom1) || !this.hasAtom(atom2)) {
            throw ("Cannot create bond between atoms not in molecule");
        }

        if (!atom1.canBond(SingleBond) || !atom2.canBond(SingleBond)) {
            throw ("Cannot create single bond");
        }

        var bond = new SingleBond(atom1, atom2);
        atom1.applySingleBond(bond)
        atom2.applySingleBond(bond)

        this.bonds.push(bond);
    }
}

export {Molecule}
