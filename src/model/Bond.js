class Bond {
    constructor (atom1, atom2) {
        this.atom1 = atom1;
        this.atom2 = atom2;
    }
}
class SingleBond extends Bond {}
class DoubleBond extends Bond {}
class TripleBond extends Bond {}

export {Bond, SingleBond, DoubleBond, TripleBond}
