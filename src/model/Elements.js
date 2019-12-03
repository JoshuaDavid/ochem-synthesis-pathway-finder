import {periodicData, periodicDataBy} from "/src/data/periodic-data.js";
import {Atom} from '/src/model/Atom.js';

var elements = {};
for (var i = 0; i < periodicData.length; i++) {
    var elName = periodicData[i].name;
    elements[elName] = ({[elName]: class extends Atom {}})[elName];
}

export {elements}
