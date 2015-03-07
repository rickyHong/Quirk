const COLLECTION_CUTOFF = 1000;
const BAD_TO_STRING_RESULT = new (function(){})().toString();
const RECURSE_LIMIT_DESCRIPTION = "!recursion-limit!";
const DEFAULT_RECURSION_LIMIT = 10;

/**
 * Attempts to give a useful and unambiguous description of the given value.
 *
 * @param {*} value
 * @param {!int=} recursionLimit
 * @returns {!string}
 */
export default function describe(value, recursionLimit = DEFAULT_RECURSION_LIMIT) {
    if (value === null) {
        return "null";
    }
    if (value === undefined) {
        return "undefined";
    }
    if (typeof value === "string") {
        return `"${value}"`;
    }
    if (typeof value === "number") {
        return "" + value;
    }
    if (recursionLimit === 0) {
        return RECURSE_LIMIT_DESCRIPTION;
    }

    //noinspection JSUnresolvedVariable
    if (value instanceof Map) {
        return describe_Map(value, recursionLimit);
    }

    //noinspection JSUnresolvedVariable
    if (value instanceof Set) {
        return describe_Set(value, recursionLimit);
    }

    //noinspection JSUnresolvedVariable
    if (value[Symbol.iterator] !== undefined) {
        return describe_Iterable(value, recursionLimit);
    }

    let defaultString = String(value);
    if (defaultString !== BAD_TO_STRING_RESULT) {
        return defaultString;
    }

    return describe_Object(value, recursionLimit);
}

function describe_Map(map, limit) {
    var entries = [];
    for (let [k, v] of map.entries()) {
        if (entries.length > COLLECTION_CUTOFF) {
            entries.push("[...]");
            break;
        }
        //noinspection JSUnusedAssignment
        let keyDesc = describe(k, limit - 1);
        let valDesc = describe(v, limit - 1);
        entries.push(`${keyDesc}: ${valDesc}`);
    }
    return `Map{${entries.join(", ")}}`;
}

function describe_Set(set, limit) {
    var entries = [];
    for (let e of set) {
        if (entries.length > COLLECTION_CUTOFF) {
            entries.push("[...]");
            break;
        }
        entries.push(describe(e, limit - 1));
    }
    return `Set{${entries.join(", ")}}`;
}

function describe_Iterable(seq, limit) {
    let entries = [];
    for (let e of seq) {
        if (entries.length > COLLECTION_CUTOFF) {
            entries.push("[...]");
            break;
        }
        entries.push(describe(e, limit - 1));
    }
    let prefix = Array.isArray(seq) ? "" : seq.constructor.name;
    return `${prefix}[${entries.join(", ")}]`;
}

function describe_Object(value, limit) {
    var entries = [];
    for (let k in value) {
        if (!value.hasOwnProperty(k)) {
            continue;
        }
        if (entries.length > COLLECTION_CUTOFF) {
            entries.push("[...]");
            break;
        }
        let v = value[k];
        let keyDesc = describe(k, limit - 1);
        let valDesc = describe(v, limit - 1);
        entries.push(`${keyDesc}: ${valDesc}`);
    }

    let typeName = value.constructor.name;
    let prefix = typeName === {}.constructor.name ? "" : `(Type: ${typeName})`;
    return `${prefix}{${entries.join(", ")}}`;
}
