import {periodicData, periodicDataBy} from "/src/data/periodic-data.js";
import {Atom} from '/src/model/Atom.js';
import {elements} from '/src/model/Elements.js';
import {Bond, SingleBond, DoubleBond, TripleBond} from '/src/model/Bond.js';
import {Molecule} from '/src/model/Molecule.js';
import {Electron} from "/src/model/Electron.js"
import {LonePair} from "/src/model/LonePair.js"


var molecule = new Molecule;


function buildInitialUI() {
    buildAddAtomTable();
    rerenderMolecule();
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

    var atomsCtr = document.getElementById('molecule-atoms');
    atomsCtr.innerHTML = '';
    molecule.atoms.forEach(atom => {
        atomsCtr.appendChild(tagTree('li', {}, [
            ['div', {}, [
                ['b', {}, "Name: "],
                ['span', {}, atom.symbol],
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

function tagTree(tagName, attrs, contents) {
    var t = document.createElement(tagName);
    for (var name in attrs) {
        var value = attrs[name];
        t.setAttribute(name, value);
    }
    if (Array.isArray(contents)) {
        for (var i = 0; i < contents.length; i++) {
            var [childTagName, childAttrs, childContents] = contents[i];
            var child = tagTree(childTagName, childAttrs, childContents);
            t.appendChild(child);
        }
    } else {
        t.textContent = contents;
    }
    return t;
}

buildInitialUI();
