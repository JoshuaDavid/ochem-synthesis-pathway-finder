import {periodicData, periodicDataBy} from "/src/data/periodic-data.js";
import {Electron} from "/src/model/Electron.js"
import {LonePair} from "/src/model/LonePair.js"

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
                for (var k = 0; k < orbital.length; k++) {
                    var x = orbital[k];

                    if (x.constructor == Electron) {
                        charge -= 1;
                    } else if (x.constructor == LonePair) {
                        charge -= 2;
                    } else {
                        throw ("Unrecognized content of orbital: " + x.constructor);
                    }
                }
            }
        }

        return charge;
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
}

Atom.electronShellFillOrder = [
    ["1s"],
    ["2s"], "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p"];

export {Atom};
