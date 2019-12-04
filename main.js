import {periodicData, periodicDataBy} from "/src/data/periodic-data.js";
import {Atom} from '/src/model/Atom.js';
import {elements} from '/src/model/Elements.js';
import {Bond, SingleBond, DoubleBond, TripleBond} from '/src/model/Bond.js';
import {Molecule} from '/src/model/Molecule.js';
import {Electron} from "/src/model/Electron.js"
import {LonePair} from "/src/model/LonePair.js"


var molecule = new Molecule();
var selectedAtoms = [];

function buildInitialUI() {
    buildAddAtomTable();
    rerenderMolecule();

    var singleBondCreator = document.getElementById('molecule-create-single-bond');

    singleBondCreator.addEventListener('click', function() {
        molecule.createBond(SingleBond, selectedAtoms[0], selectedAtoms[1]);
        selectedAtoms = [];
        rerenderMolecule();
    });

    var rerenderBtn = document.getElementById('molecule-rerender');
    rerenderBtn.addEventListener('click', () => rerenderMolecule());
}

function buildAddAtomTable() {
    var periodicTable = document.getElementById('periodic-table');
    var atomicNumber = 1;
    for (var p = 0; p < 6; p++) {
        var tr = document.createElement('tr');
        for (var c = 0; c < 18; c++) {
            var td = document.createElement('td');
            var cellHasElement = false;
            if (p == 0 && (c <= 0 || c >= 17)) {
                cellHasElement = true;
            } else if (p >= 1 && (c <= 1 || c >= 12)) {
                cellHasElement = true;
            } else if (p >= 3) {
                cellHasElement = true;
            }

            if (cellHasElement) {
                var element = periodicDataBy['atomicNumber'][atomicNumber];
                (function (element) {
                    var addBtn = document.createElement('button');
                    addBtn.textContent = element.symbol;
                    addBtn.addEventListener('click', function(e) {
                        var atom = new elements[element.name];
                        molecule.atoms.push(atom);
                        rerenderMolecule();
                    });
                    td.appendChild(addBtn);
                })(element);
                atomicNumber += 1;
            }

            tr.appendChild(td)
        }
        periodicTable.appendChild(tr);
    }
}

function rerenderMolecule() {
    var moleculeStatsFields = {
        'num-atoms': molecule => molecule.atoms.length,
        'num-bonds': molecule => molecule.bonds.length,
    }
    for (var f in moleculeStatsFields) {
        var el = document.getElementById('molecule-info-' + f);
        if (el) {
            el.textContent = moleculeStatsFields[f](molecule);
        }
    }

    var bondCreatorCtr = document.getElementById('bond-creator');

    var atomsCtr = document.getElementById('molecule-atoms');
    atomsCtr.innerHTML = '';
    molecule.atoms.forEach((atom, i) => {
        atomsCtr.appendChild(tagTree('li', {}, [
            ['div', {}, [
                ['input', {
                    'type': 'checkbox',
                    'id': 'atom-' + i,
                    'checked': selectedAtoms.indexOf(atom) != -1,
                }, null, {
                    'change': (e) => {
                        var selectionIndex = selectedAtoms.indexOf(atom); 
                        if (e.target.checked) {
                            if (selectionIndex == -1) {
                                selectedAtoms.push(atom);
                            }
                        } else {
                            if (selectionIndex != -1) {
                                selectedAtoms.splice(selectionIndex, 1);
                            }
                        }
                        if (selectedAtoms.length == 2) {
                            bondCreatorCtr.style.display = 'block';
                        } else {
                            bondCreatorCtr.style.display = 'none';
                        }
                    }
                }],
                ['label', {'for': 'atom-' + i}, atom.symbol],
            ]],
            ['div', {}, [
                ['b', {}, "Charge: "],
                ['span', {}, atom.getCharge()],
            ]],
            ['div', {}, [
                ['b', {}, "Orbitals: "],
                ['span', {}, Object.keys(atom.orbitals)
                .filter(k => atom.orbitals[k].length > 0)
                .map(k => {
                    var o = atom.orbitals[k];
                    var s = '';
                    if (o[0].constructor == Electron) {
                        s = "\u21BF";
                    } else if (o[0].constructor == LonePair) {
                        s = "\u21C5";
                    } else if (o[0].constructor == SingleBond) {
                        s = "\u03c3";
                    } else {
                        s = o[0].constructor;
                    }

                    return ['div', {style: 'display: inline-block; border: 1px solid black;'}, [
                        ['div', {}, s],
                        ['div', {}, k],
                    ]];
                })]
            ]],
        ]));
    });
}

function tagTree(tagName, attrs, contents, listeners) {
    var t = document.createElement(tagName);
    for (var name in attrs) {
        var value = attrs[name];
        if (name == 'checked' && !value) {
            // skip in this case cause "false" is truthy
        } else {
            t.setAttribute(name, value);
        }
    }
    if (Array.isArray(contents)) {
        for (var i = 0; i < contents.length; i++) {
            var [childTagName, childAttrs, childContents, childListeners] = contents[i];
            var child = tagTree(childTagName, childAttrs, childContents, childListeners);
            t.appendChild(child);
        }
    } else if(typeof contents == 'number' || contents) {
        t.textContent = contents;
    }

    if (listeners) {
        for (var k in listeners) {
            t.addEventListener(k, listeners[k]);
        }
    }
    return t;
}

molecule.atoms.push(new elements.Carbon);
molecule.atoms.push(new elements.Hydrogen);
molecule.atoms.push(new elements.Hydrogen);
molecule.atoms.push(new elements.Hydrogen);
molecule.atoms.push(new elements.Hydrogen);
molecule.createBond(SingleBond, molecule.atoms[0], molecule.atoms[1]);
molecule.createBond(SingleBond, molecule.atoms[0], molecule.atoms[2]);
molecule.createBond(SingleBond, molecule.atoms[0], molecule.atoms[3]);
molecule.createBond(SingleBond, molecule.atoms[0], molecule.atoms[4]);

buildInitialUI();
window.molecule = molecule;
