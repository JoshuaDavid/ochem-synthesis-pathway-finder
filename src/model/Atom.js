import {periodicData, periodicDataBy} from "/src/data/periodic-data.js";
import {Electron} from "/src/model/Electron.js"
import {LonePair} from "/src/model/LonePair.js"
import {Bond, SingleBond, DoubleBond, TripleBond} from '/src/model/Bond.js';

class Atom {
    constructor() {
        var elementData = periodicDataBy['name'][this.constructor.name];
        this.symbol = elementData.symbol;
        this.atomicWeight = elementData.atomicWeight;
        this.atomicNumber = elementData.atomicNumber;
        this.period = elementData.period;

        this.initializeElectrons();
    }

    initializeElectrons() {
        this.electronShells = this.getElectronShellsByFillOrder();
        this.orbitals = {}
        this.electronShells.forEach(shell => {
            shell.forEach(orbital => {
                this.orbitals[orbital.type] = orbital.contents;
            })
        })

        for (var i = 0; i < this.atomicNumber; i++) {
            this.addElectron();
        }
    }

    getElectronShellsByFillOrder() {
        return [
            [
                {'type': '1s', 'contents': []}
            ],
            [
                {'type': '2s', 'contents': []}
            ],
            [
                {'type': '2px', 'contents': []},
                {'type': '2py', 'contents': []},
                {'type': '2pz', 'contents': []},
            ],
            [
                {'type': '3s', 'contents': []}
            ],
            [
                {'type': '3px', 'contents': []},
                {'type': '3py', 'contents': []},
                {'type': '3pz', 'contents': []},
            ],
            [
                {'type': '4s', 'contents': []}
            ],
            [
                {'type': '3dz2', 'contents': []},
                {'type': '3dxy', 'contents': []},
                {'type': '3dxz', 'contents': []},
                {'type': '3dyz', 'contents': []},
                {'type': '3dx2y2', 'contents': []},
            ],
            [
                {'type': '4px', 'contents': []},
                {'type': '4py', 'contents': []},
                {'type': '4pz', 'contents': []},
            ],
            [
                {'type': '5s', 'contents': []}
            ],
            [
                {'type': '4dz2', 'contents': []},
                {'type': '4dxy', 'contents': []},
                {'type': '4dxz', 'contents': []},
                {'type': '4dyz', 'contents': []},
                {'type': '4dx2y2', 'contents': []},
            ],
            [
                {'type': '5px', 'contents': []},
                {'type': '5py', 'contents': []},
                {'type': '5pz', 'contents': []},
            ],
        ];
    }

    canBond(bondType) {
        return true;
    }

    getCharge() {
        var charge = this.atomicNumber;
        for (var i = 0; i < this.electronShells.length; i++) {
            var shell = this.electronShells[i];
            for (var j = 0; j < shell.length; j++) {
                var orbital = shell[j];
                for (var k = 0; k < orbital.contents.length; k++) {
                    var x = orbital.contents[k];

                    if (x.constructor == Electron) {
                        charge -= 1;
                    } else if (x.constructor == LonePair) {
                        charge -= 2;
                    } else if (x.constructor == SingleBond) {
                        charge -= 1;
                    } else {
                        throw ("Unrecognized content of orbital: " + x.constructor);
                    }
                }
            }
        }

        return charge;
    }

    hasOrbital(orbitalName) {
        return (orbitalName in this.orbitals);
    }

    hasEmptyOrbital(orbitalName) {
        return this.hasOrbital(orbitalName)
            && this.orbitals[orbitalName].length == 0;
    }

    getOrbitalContentType(orbitalName) {
        if (!this.hasOrbital(orbitalName)) {
            throw("cannot get content of orbital the atom does not have");
        } else if (this.hasEmptyOrbital(orbitalName)) {
            return null;
        } else {
            return this.orbitals[orbitalName][0].constructor;
        }
    }

    canSP3Hybridize() {
        for (var n = 2; n < 7; n++) {

            var isUnhybridized = this.hasOrbital(n + 's')
                && this.hasOrbital(n + 'px')
                && this.hasOrbital(n + 'py')
                && this.hasOrbital(n + 'pz');

            if (isUnhybridized) {
                // In order to sp3 hybridize, we need to have a
                // lone pair in the s orbital and at least one empty
                // p orbital
                var hasSLonePair = this.getOrbitalContentType(n + 's') == LonePair;
                var hasEmptyP = this.hasEmptyOrbital(n + 'px')
                    || this.hasEmptyOrbital(n + 'py')
                    || this.hasEmptyOrbital(n + 'pz');

                if (hasSLonePair && hasEmptyP) {
                    return true;
                }
            }
        }

        return false;
    }

    sp3Hybridize() {
        for (var n = 2; n < 7; n++) {
            var s = n + 's',
                px = n + 'px',
                py = n + 'py',
                pz = n + 'pz';

            var isUnhybridized = this.hasOrbital(s)
                && this.hasOrbital(px)
                && this.hasOrbital(py)
                && this.hasOrbital(pz);

            if (isUnhybridized) {
                // In order to sp3 hybridize, we need to have a
                // lone pair in the s orbital and at least one empty
                // p orbital
                var hasSLonePair = this.getOrbitalContentType(s) == LonePair;
                var firstEmptyP = this.hasEmptyOrbital(px) ? px
                    : this.hasEmptyOrbital(py) ? py
                    : this.hasEmptyOrbital(pz) ? pz
                    : null;

                var nonEmptyPs = firstEmptyP == px ? [py, pz]
                    : firstEmptyP == py ? [px, pz]
                    : firstEmptyP == pz ? [px, py]
                    : null;

                if (hasSLonePair && firstEmptyP) {
                    var newOrbitals = [
                        {type: n + 'sp3a', contents: [new Electron]},
                        {type: n + 'sp3b', contents: [new Electron]},
                        {type: n + 'sp3c', contents: this.orbitals[nonEmptyPs[0]]},
                        {type: n + 'sp3d', contents: this.orbitals[nonEmptyPs[1]]},
                    ];

                    // Delete [ns] shell
                    // Replace [np[xyz]] shell with [nsp3[abcd]]
                    // note this may not get the energy levels exactly right, not
                    // sure though
                    this.electronShells = this.electronShells
                        .map(es => {
                            if (es.length == 0 || es[0].type[0] != n) {
                                return es;
                            } else if (es[0].type[0] == n && es[0].type[1] == 's') {
                                // Delete [ns] shell
                                return [];
                            } else if (es[0].type[0] == n && es[0].type[1] == 'p') {
                                // Replace [np[xyz]] shell with [nsp3[abcd]]
                                return newOrbitals
                            } else {
                                return es;
                            }
                        })
                        .filter(es => es.length > 0);

                    delete this.orbitals[s];
                    delete this.orbitals[px];
                    delete this.orbitals[py];
                    delete this.orbitals[pz];

                    newOrbitals.forEach(({type, contents}) => {
                        this.orbitals[type] = contents;
                    });
                }
            }
        }
    }

    addElectron() {
        for (var i = 0; i < this.electronShells.length; i++) {
            var shell = this.electronShells[i];
            for (var j = 0; j < shell.length; j++) {
                var orbital = shell[j];
                if (orbital.contents.length == 0) {
                    orbital.contents.push(new Electron());
                    return;
                }
            }

            for (var j = 0; j < shell.length; j++) {
                var orbital = shell[j];
                if (orbital.contents.length == 1 && orbital.contents[0].constructor == Electron) {
                    orbital.contents.pop();
                    orbital.contents.push(new LonePair());
                    return;
                }
            }
        }

        throw new Exception("Not enough electron shells!");
    }

    applySingleBond(bond) {
        // Try to apply the bond first without hybridizing
        for (var i = 0; i < this.electronShells.length; i++) {
            var shell = this.electronShells[i];
            for (var j = 0; j < shell.length; j++) {
                var orbital = shell[j];
                if (orbital.contents.length == 1 && orbital.contents[0].constructor == Electron) {
                    orbital.contents.pop();
                    orbital.contents.push(bond);
                    return;
                }
            }
        }

        // If that fails, hybridize and apply the bond
        if (this.canSP3Hybridize()) {
            this.sp3Hybridize();
            return this.applySingleBond(bond);
        }

        // If we can't hybridize, we can't create the bond
        throw("No free electrons to replace with sigma bond");
    }
}

Atom.electronShellFillOrder = [
    ["1s"],
    ["2s"], "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p"];

export {Atom};
